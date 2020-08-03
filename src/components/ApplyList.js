import React from 'react';
import './common.css';
import { Loader, Confirm } from 'semantic-ui-react';
import { Table } from 'antd';
import 'antd/dist/antd.css';
import { connect } from 'react-redux';
import http from '../service/httpRequest.js';
import $ from 'jquery';
import { getUserDidInfoAction } from '@/actions/didInfoAction';
import useSubstrate from '../service/userSubstrateRequest.js';
const testKeyring = require('@polkadot/keyring/testing');
const keyring = testKeyring.default();

class ApplyList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaderState: "disabled",
            confirmOpen: false,
            messageContent: '',
            columns: [
                {
                    title: '编号',
                    dataIndex: 'index',
                    key: 'index',
                },
                {
                    title: '申请机构',
                    dataIndex: 'authOrg',
                    key: 'authOrg',
                },
                {
                    title: '调用客户编号',
                    dataIndex: 'customerNo',
                    key: 'customerNo',
                },
                {
                    title: '档案类型',
                    dataIndex: 'docType',
                    key: 'docType',
                },
                {
                    title: '生成日期范围',
                    dataIndex: 'dateRange',
                    key: 'dateRange',
                },
                {
                    title: '指派人员',
                    dataIndex: 'operator',
                    key: 'operator',
                },
                {
                    title: '申请日期',
                    dataIndex: 'creationDate',
                    key: 'creationDate',
                },
                {
                    title: '操作',
                    dataIndex: 'operate',
                    key: 'operate',
                    render: (item) => item.approveStatus === 3 ? <div>已撤销</div> : (item.approveStatus === 2 ? <div>已拒绝</div> :
                        <div>
                            <div className="operation" onClick={this.handleAgreeClick.bind(this, item.approveStatus, item)} >
                                {item.approveStatus === 1 ? "撤销" : "同意"}
                            </div>
                            <div className="operation" onClick={this.handleRefuseClick.bind(this, item.approveStatus, item)} style={{ 'display': item.approveStatus !== 0 ? "none" : "inline-block" }}>
                                拒绝
                            </div>
                        </div>)

                }
            ],
            tableData: [],
            pagination: {
                hideOnSinglePage: true,
                current: 1,
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50, 100],
                total: 0,
            }
        }
    }

    componentDidMount() {
        let pageSize = this.state.pagination.pageSize;
        this.loadTbaleData(pageSize, 1);
    }

    loadTbaleData = (pageSize, pageNum) => {
        http.get("producer/vcs/application/pagedlist?pageSize=" + pageSize + "&pageNum=" + pageNum).then((resp) => {
            if (resp.data && resp.data.status === 1) {
                let resultData = resp.data.data ? resp.data.data : {};
                let tableData = resultData.list;
                let newTableData = [];
                for (var i = 0; i < tableData.length; i++) {
                    newTableData.push({
                        index: pageNum === 1 ? i + 1 : (pageNum - 1) * pageSize + i + 1,
                        authOrg: tableData[i].authOrg,
                        customerNo: tableData[i].customerNo,
                        docType: tableData[i].docType,
                        dateRange: this.getDateStr(tableData[i].startDate) + "~" + this.getDateStr(tableData[i].endDate),
                        operator: tableData[i].operator,
                        creationDate: this.getDateStr(tableData[i].creationDate),
                        operate: tableData[i],
                    })
                }
                this.setState({
                    tableData: newTableData,
                    pagination: {
                        current: pageNum,
                        pageSize: pageSize,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 20, 50, 100],
                        total: resultData.total,
                        showTotal: total => `共 ${resultData.total} 条`
                    }
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

        if (key === 0) {
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
                                        this.loadTbaleData(this.state.pagination.pageSize, 1);
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
                                        this.loadTbaleData(this.state.pagination.pageSize, 1);
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
                this.loadTbaleData(this.state.pagination.pageSize, 1);
                this.setState({
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

    handleTablePageChange = (pagination) => {
        let pageSize = pagination.pageSize;
        let pageNum = pagination.current;
        this.loadTbaleData(pageSize, pageNum)
    }

    render() {
        return (
            <div style={{ 'width': '99%' }} id="applyListDiv">
                <p className="tableTtile">申请列表</p>
                <Table
                    bordered
                    columns={this.state.columns}
                    dataSource={this.state.tableData}
                    onChange={this.handleTablePageChange}
                    onShowSizeChange={this.handlePageSizeChange}
                    pagination={this.state.pagination}
                />
                <Loader className={this.state.loaderState} ></Loader>
                <Confirm
                    open={this.state.confirmOpen}
                    content={this.state.messageContent}
                    onCancel={this.handleCancel}
                    onConfirm={this.handleConfirm}
                />
            </div >
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

