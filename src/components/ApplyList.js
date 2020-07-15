import React from 'react';
import './common.css';
import { Table, Loader, Confirm } from 'semantic-ui-react';
import { connect } from 'react-redux';
import http from '../service/httpRequest.js';
import $ from 'jquery';
import { getUserDidInfoAction } from '@/actions/didInfoAction';
import useSubstrate from '../service/userSubstrateRequest.js';
const testKeyring = require('@polkadot/keyring/testing');
const keyring = testKeyring.default();


const tableTtile = ["编号", "申请机构", "调用客户编号", "档案类型", "生成日期范围", "指派人员", "申请日期", "操作"];

class ApplyList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaderState: "disabled",
            confirmOpen: false,
            messageContent: '',
            tableData: [
                // {"authOrg": "建设银行办公室","customerNo": "20200708","docType": "文书档案","startDate": "16587800000","endDate": "156090340000","operator": "张三","creationDate": "1593705600000","approveStatus": "0","receiveMail": "limengran0911@163.com"}
            ],
        }
    }

    componentDidMount() {
        http.get("producer/vcs/application/pagedlist").then((resp) => {
            if (resp.data && resp.data.status === 1) {
                let resultData = resp.data.data ? resp.data.data : {};
                let tableData = resultData.list;
                let newTableData = [];
                for (var i = 0; i < tableData.length; i++) {
                    if (tableData[i].approveStatus === 0 || tableData[i].approveStatus === 1 ) {
                        newTableData.push(tableData[i])
                    }
                }
                this.setState({
                    tableData: newTableData,
                })
            }
        })

    }

    handleAgreeClick = (key, rowData, e) => {
        this.setState({
            loaderState: "active",
        })
        let userName = window.location ? window.location.pathname.slice(1) : "police";
        const operateorDid = rowData.operatorDid || "";
        const authOrgDid = rowData.authOrgDid || "";
        const orgrHasPrivateKeyStr = localStorage.getItem("orgrHasPrivateKey" + userName) || "";
        const orgPrivateKey = orgrHasPrivateKeyStr ? JSON.parse(orgrHasPrivateKeyStr)[rowData.authOrg] : "";

        if ($("#agreeButton" + key).html() === "同意") {
            let newRowData = JSON.parse(JSON.stringify(rowData));
            newRowData.approveStatus = 1;
            http.post("producer/vcs/approval", newRowData).then((resp) => {
                if (resp.data && resp.data.status === 1) {
                    useSubstrate.useSubstrateApi((api) => {
                        if (!api) { return; }
                        const result = api.tx.potModule.authorize(operateorDid, authOrgDid);
                        result.signAndSend(keyring.getPair(orgPrivateKey), ({ events = [], status }) => {
                            if (status.isInBlock) {
                                events.forEach(({ event: { data, method, section }, phase }) => {
                                    if (section === 'system' && method === 'ExtrinsicSuccess') {
                                        $("#agreeButton" + key).html("撤销");
                                        $("#refuseButton" + key).css("display", 'none');
                                        this.setState({
                                            confirmOpen: true,
                                            messageContent: '操作成功',
                                            loaderState: "disabled",
                                        })
                                    } else if (section === 'system' && method === 'ExtrinsicFailed') {
                                        const [error, info] = data;
                                        if (error.isModule) {
                                            const decoded = api.registry.findMetaError(error.asModule);
                                            const { documentation, name, section } = decoded;
                                            this.setState({
                                                confirmOpen: true,
                                                messageContent: '操作失败，失败原因：' + name,
                                                loaderState: "disabled",
                                            })
                                        }

                                    }
                                })
                            }
                        })
                    })
                } else {
                    this.setState({
                        confirmOpen: true,
                        messageContent: '操作失败，失败原因：' + resp.data.msg,
                        loaderState: "disabled",
                    })
                }

            })

        } else {
            let newRowData = JSON.parse(JSON.stringify(rowData));
            newRowData.approveStatus = 3;
            http.post("producer/vcs/approval", newRowData).then((resp) => {
                if (resp.data && resp.data.status === 1) {
                    useSubstrate.useSubstrateApi((api) => {
                        if (!api) { return; }
                        const result = api.tx.potModule.revoke(operateorDid, authOrgDid);
                        result.signAndSend(keyring.getPair(orgPrivateKey), ({ events = [], status }) => {
                            if (status.isInBlock) {
                                events.forEach(({ event: { data, method, section }, phase }) => {
                                    if (section === 'system' && method === 'ExtrinsicSuccess') {
                                        let tableData = this.state.tableData;
                                        tableData.splice(key, 1);
                                        this.setState({
                                            confirmOpen: true,
                                            messageContent: '操作成功',
                                            tableData: tableData,
                                            loaderState: "disabled",
                                        })
                                        $("#agreeButton" + key).html("同意");
                                        $("#refuseButton" + key).css("display", 'inline-block');
                                    } else if (section === 'system' && method === 'ExtrinsicFailed') {
                                        const [error, info] = data;
                                        if (error.isModule) {
                                            const decoded = api.registry.findMetaError(error.asModule);
                                            const { documentation, name, section } = decoded;
                                            this.setState({
                                                confirmOpen: true,
                                                messageContent: '操作失败，失败原因：' + name,
                                                loaderState: "disabled",
                                            })
                                        }
                                    }

                                })

                            }
                        })
                    })
                } else {
                    this.setState({
                        confirmOpen: true,
                        messageContent: '操作失败，失败原因：' + resp.data.msg,
                        loaderState: "disabled",
                    })
                }
            })

        }

    }

    handleRefuseClick = (key, item, e) => {
        this.setState({
            loaderState: "active",
        })
        let newRowData = JSON.parse(JSON.stringify(item));
        newRowData.approveStatus = 2;
        http.post("producer/vcs/approval", newRowData).then((resp) => {
            if (resp.data && resp.data.status === 1) {
                let tableData = this.state.tableData;
                tableData.splice(key, 1);
                this.setState({
                    tableData: tableData,
                    loaderState: "disabled",
                })
            } else {
                this.setState({
                    confirmOpen: true,
                    messageContent: '操作失败，失败原因：' + resp.data.msg,
                    loaderState: "disabled",
                })
            }
        })

    }

    getDateStr = (value) => {
        let year = new Date(value).getFullYear();
        let month = new Date(value).getMonth() + 1;
        let date = new Date(value).getDate();
        return year + "/" + month + "/" + date;
    }

    handleCancel = () => {
        this.setState({
            confirmOpen: false,
        })
    }


    handleConfirm = () => {
        this.setState({
            confirmOpen: false,
        })
    }


    render() {
        return (
            <div style={{ 'width': '99%' }} id="applyListDiv">
                <p className="tableTtile">申请列表</p>
                <Table columns={8} id="applyTableList">
                    <Table.Header>
                        <Table.Row>
                            {tableTtile.map((item, key) => {
                                return (<Table.HeaderCell key={key}>{item}</Table.HeaderCell>)
                            })
                            }
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.state.tableData.map((item, key) => {
                            return (<Table.Row key={key}>
                                <Table.Cell >{key}</Table.Cell>
                                <Table.Cell>{item.authOrg}</Table.Cell>
                                <Table.Cell>{item.customerNo}</Table.Cell>
                                <Table.Cell>{item.docType}</Table.Cell>
                                <Table.Cell>{this.getDateStr(item.startDate) + "~" + this.getDateStr(item.endDate)}</Table.Cell>
                                <Table.Cell>{item.operator}</Table.Cell>
                                <Table.Cell>{this.getDateStr(item.creationDate)}</Table.Cell>
                                <Table.Cell>
                                    {<div>
                                        <div className="operation" id={"agreeButton" + key} onClick={this.handleAgreeClick.bind(this, key, item)} >{item.approveStatus === 1 ? "撤销" : "同意"}</div>
                                        <div className="operation" id={"refuseButton" + key} onClick={this.handleRefuseClick.bind(this, key, item)} style={{ 'display': item.approveStatus !== 0 ? "none" : "inline-block" }}>拒绝</div>
                                    </div>}
                                </Table.Cell>
                            </Table.Row>)
                        })}

                    </Table.Body>
                </Table>
                <Loader className={this.state.loaderState} ></Loader>
                <Confirm
                    open={this.state.confirmOpen}
                    content={this.state.messageContent}
                    onCancel={this.handleCancel}
                    onConfirm={this.handleConfirm}
                />
            </div>
        )
    }
}

const mapStateToProps = state => {
    return state;
}

const mapDispatchToProps = (dispatch) => {
    return {
        "GET_USER_DID": (payload) => {
            dispatch(getUserDidInfoAction(payload));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ApplyList)

