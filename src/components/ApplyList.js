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
                { "applyOrg": "建设银行办公室", "customerNo": "297897869", "docType": "文书档案", "startDate": "2020-05-20", "endDate": "2020-06-20", "operator": "张三", "creationDate": "2020-05-21", },
                { "applyOrg": "建设银行办公室", "customerNo": "297897869", "docType": "文书档案", "startDate": "2020-05-20", "endDate": "2020-06-20", "operator": "张三", "creationDate": "2020-05-22", },
                { "applyOrg": "建设银行办公室", "customerNo": "297897869", "docType": "文书档案", "startDate": "2020-05-20", "endDate": "2020-06-20", "operator": "张三", "creationDate": "2020-05-23", },
                { "applyOrg": "建设银行办公室", "customerNo": "297897869", "docType": "文书档案", "startDate": "2020-05-20", "endDate": "2020-06-20", "operator": "张三", "creationDate": "2020-05-24", },
            ],
        }
    }

    componentDidMount() {
        let userName = window.location ? window.location.pathname.slice(1) : "police";
        let authOrgDidObj = localStorage.getItem("orgrHasDid" + userName) || "";
        let authOrgDid = authOrgDidObj ? JSON.parse(authOrgDidObj)["建设银行办公室"] : "";
        let authOrgDidMap = new Map();
        authOrgDidMap.set("建设银行办公室", authOrgDid);
        this.props.GET_USER_DID(authOrgDid);

        // http.get("producer/vcs/application/pagedlist").then((resp) => {
        //     if (resp.data && resp.data.status === 1) {
        //         let resultData = resp.data.data ? resp.data.data : {};
        //         this.setState({
        //             tableData: resultData.list || [],
        //         })
        //     }
        // })

    }

    handleAgreeClick = (key, rowData, e) => {
        this.setState({
            loaderState: "active",
        })
        let userName = window.location ? window.location.pathname.slice(1) : "police";
        const operateorDidStr = localStorage.getItem("userHasDid" + rowData.operator) || "";
        const operateorDid = operateorDidStr ? JSON.parse(operateorDidStr)[rowData.operator] : "";

        const orgrHasPrivateKeyStr = localStorage.getItem("orgrHasPrivateKey" + userName) || "";
        const orgPrivateKey = orgrHasPrivateKeyStr ? JSON.parse(orgrHasPrivateKeyStr)[rowData.applyOrg] : "";
        if ($("#agreeButton" + key).html() === "同意") {
            useSubstrate.useSubstrateApi((api) => {
                if (!api) { return; }
                const result = api.tx.potModule.authorize(operateorDid);
                result.signAndSend(keyring.getPair(orgPrivateKey), ({ events = [], status }) => {
                    if (status.isInBlock) {
                        events.forEach(({ event: { data, method, section }, phase }) => {
                            if (section === 'system' && method === 'ExtrinsicSuccess') {
                                console.log(`${section}.${method}`, data.toString());
                                $("#agreeButton" + key).html("撤销");
                                $("#refuseButton" + key).css("display", 'none');
                                this.setState({
                                    confirmOpen: true,
                                    messageContent: '操作成功',
                                    loaderState: "disabled",
                                })
                            } else if (section === 'system' && method === 'ExtrinsicFailed') {
                                console.log(`${section}.${method}`, data.toString());
                                const [error, info] = data;
                                if (error.isModule) {
                                    const decoded = api.registry.findMetaError(error.asModule);
                                    const { documentation, name, section } = decoded;
                                    console.log(section + " " + name);
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
            useSubstrate.useSubstrateApi((api) => {
                if (!api) { return; }
                const result = api.tx.potModule.revoke(operateorDid);
                result.signAndSend(keyring.getPair(orgPrivateKey), ({ events = [], status }) => {
                    if (status.isInBlock) {
                        events.forEach(({ event: { data, method, section }, phase }) => {
                            if (section === 'system' && method === 'ExtrinsicSuccess') {
                                console.log(`${section}.${method}`, data.toString());
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
                                console.log(`${section}.${method}`, data.toString());
                                const [error, info] = data;
                                if (error.isModule) {
                                    const decoded = api.registry.findMetaError(error.asModule);
                                    const { documentation, name, section } = decoded;
                                    console.log(section + " " + name);
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
        }

    }

    handleRefuseClick = (key, item, e) => {
        let tableData = this.state.tableData;
        tableData.splice(key, 1);
        this.setState({
            tableData: tableData
        })
    }

    getDateStr = (value) => {
        let year = new Date(value).getFullYear();
        let month = new Date(value).getMonth();
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
                                <Table.Cell>{item.applyOrg}</Table.Cell>
                                <Table.Cell>{item.customerNo}</Table.Cell>
                                <Table.Cell>{item.docType}</Table.Cell>
                                <Table.Cell>{this.getDateStr(item.startDate) + "~" + this.getDateStr(item.endDate)}</Table.Cell>
                                <Table.Cell>{item.operator}</Table.Cell>
                                <Table.Cell>{this.getDateStr(item.creationDate)}</Table.Cell>
                                <Table.Cell>
                                    {<div>
                                        <div className="operation" id={"agreeButton" + key} onClick={this.handleAgreeClick.bind(this, key, item)}>同意</div>
                                        <div className="operation" id={"refuseButton" + key} onClick={this.handleRefuseClick.bind(this, key, item)}>拒绝</div>
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

