import React from 'react';
import './common.css';
import { Loader, Confirm } from 'semantic-ui-react';
import { Table } from 'antd';
import 'antd/dist/antd.css';
import { connect } from 'react-redux';
import http from '../service/httpRequest';
import { getMenuDataAction } from '@/actions/menuAction';
import useSubstrate from '../service/userSubstrateRequest.js';
import * as COMMON from '../tools/CommonConstant';
import { hexToString } from '@polkadot/util';

const stringToU8a = require('@polkadot/util/string/toU8a').default;
const testKeyring = require('@polkadot/keyring/testing');
const keyring = testKeyring.default();


class ApplyResult extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: [
                {
                    title: '编号',
                    dataIndex: 'index',
                    key: 'index',
                },
                {
                    title: '申请机构',
                    dataIndex: 'applyOrg',
                    key: 'applyOrg',
                },
                {
                    title: '调用机构范围',
                    dataIndex: 'callOrgRange',
                    key: 'callOrgRange',
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
                    dataIndex: 'docDateRange',
                    key: 'docDateRange',
                },
                {
                    title: '申请时间',
                    dataIndex: 'creationDate',
                    key: 'creationDate',
                },
                {
                    title: '审批状态',
                    dataIndex: 'approveStatus',
                    key: 'approveStatus',
                },
                {
                    title: '操作',
                    dataIndex: 'operate',
                    key: 'operate',
                    render: (item) => <div style={{ 'display': item.approveStatus === 1 ? "inline-block" : "none" }} className="operation" onClick={this.handleMoreClick.bind(this, item)}>查看详情</div>
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
            },
            isShowMoreInfo: false,
            loaderState: "disabled",
            confirmOpen: false,
            messageContent: '',
        }
    }

    componentDidMount() {
        let pageSize = this.state.pagination.pageSize;
        this.getResultTableData(pageSize, 1);
    }

    componentWillReceiveProps(nextProps) {
        let pageSize = this.state.pagination.pageSize;
        this.getResultTableData(pageSize, 1);

    }

    getResultTableData = (pageSize, pageNum) => {
        let credentialSubjectStr = localStorage.getItem('credentialSubject');
        let credentialSubject = credentialSubjectStr ? JSON.parse(credentialSubjectStr) : {};
        let fileInformation = credentialSubject.fileInformation || {};
        let orgDidStr = localStorage.getItem('userHasDid' + fileInformation.name);
        let orgDidObj = orgDidStr ? JSON.parse(orgDidStr) : {};
        let userDid = orgDidObj[fileInformation.name];
        http.get("consumer/docs/application/pagedlist?pageSize=" + pageSize + "&pageNum=" + pageNum + "&applyUserDid=" + userDid).then((resp) => {
            if (resp.data && resp.data.status === 1) {
                let newTableData = []
                let tableDataList = resp.data.data.list;
                for (var i = 0; i < tableDataList.length; i++) {
                    let statusToTextArr = ["未审批", "已通过", "已拒绝"]
                    let approveStatus = statusToTextArr[tableDataList[i].approveStatus]
                    newTableData.push({
                        index: pageNum === 1 ? i + 1 : (pageNum - 1) * pageSize + i + 1,
                        applyOrg: tableDataList[i].applyOrg || "",
                        callOrgRange: tableDataList[i].callOrgRange || "",
                        customerNo: tableDataList[i].customerNo || "",
                        docType: tableDataList[i].docType || "",
                        docDateRange: tableDataList[i].docDateRange || "",
                        creationDate: tableDataList[i].creationDate ? tableDataList[i].creationDate.split(" ")[0] : "",
                        approveStatus: tableDataList[i].approveStatus === 100 ? "未查询到相关档案" : approveStatus,
                        operate: tableDataList[i] || {}
                    })
                }
                this.setState({
                    tableData: newTableData,
                    pagination: {
                        current: pageNum,
                        pageSize: pageSize,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 20, 50, 100],
                        total: resp.data.data.total,
                        showTotal: total => `共 ${resp.data.data.total} 条`
                    }
                })
            }
        })
    }

    handleMoreClick = (rowData) => {
        this.setState({
            loaderState: "active",
            isShowMoreInfo: true,
            columns: [
                {
                    title: '编号',
                    dataIndex: 'index',
                    key: 'index',
                },
                {
                    title: '档案名称',
                    dataIndex: 'filName',
                    key: 'filName',
                },
                {
                    title: '生成日期',
                    dataIndex: 'creationDate',
                    key: 'creationDate',
                },
                {
                    title: '数据真实性编号',
                    dataIndex: 'isReal',
                    key: 'isReal',
                },
                {
                    title: '编号',
                    dataIndex: 'operate',
                    key: 'operate',
                    render: (id) => <div>
                        <div className="operation" onClick={this.seePdfDoc.bind(this, id)}>查看 </div>
                        <div className="operation" onClick={this.download.bind(this, id)}> 下载</div>
                    </div>
                },
            ],
            tableData: [],
            pagination: {},
        })
        let tableData = [];
        // 获取详情里的文书档案列表
        http.get("consumer/docs/filelist?docApplyId=" + rowData.producerId).then((resp) => {
            if (resp.data && resp.data.status === 1) {
                let respList = resp.data.data;
                this.getDocTruth(respList, (tableData) => {
                    this.setState({
                        loaderState: "disabled",
                        tableData: tableData,
                    })
                })
            }
        })

    }


    // 调用区块链接口验证档案
    getDocTruth = (respList, callback) => {
        if (respList.length === 0) {
            callback([])
        }
        let tableData = [];
        let account = COMMON.ACCOUNT_TO_USER["police"];
        // 根据每条档案副本查询档案hash
        http.post("consumer/docs/validator", respList).then((resp) => {
            if (!resp.data || resp.data.status === 0) {
                callback([]);
            }
            let resultList = resp.data.data;
            useSubstrate.useSubstrateApi((api) => {
                (async function () {
                    if (!api) { return; }
                    for (var i = 0; i < resultList.length; i++) {
                        const filName = resultList[i].fileName;
                        const id = resultList[i].id || "";
                        const creationDate = resultList[i].creationDate ? resultList[i].creationDate.split(" ")[0] : "";
                        const fileId = resultList[i].fileId;
                        const fileHash = resultList[i].fileHash
                        api.query.potModule.archDoc(fileId, (arcData) => {
                            let dataStr = arcData.toString() || "";
                            console.log(dataStr)
                            let hashStr = dataStr.substring(1, dataStr.length - 1).split(",")[0];
                            let newHashStr = hexToString(hashStr.substring(1, hashStr.length - 1));
                            console.log(newHashStr)
                            if (newHashStr === fileHash) {
                                // tableData.push([id, filName, creationDate, "真实"]);
                                tableData.push({
                                    index: i,
                                    filName: filName,
                                    creationDate: creationDate,
                                    isReal: "真实",
                                    operate: id
                                });
                            } else {
                                // tableData.push([id, filName, creationDate, "伪造"]);
                                tableData.push({
                                    index: i,
                                    filName: filName,
                                    creationDate: creationDate,
                                    isReal: "伪造",
                                    operate: id
                                });
                            }

                            if (tableData.length === resultList.length) {
                                callback(tableData);
                            }
                        })

                        if (tableData.length === resultList.length) {
                            callback(tableData);
                        }

                    }
                })();
            })
        })

    }

    download = (id) => {
        window.open("consumer/docs/downloader?id=" + id, "_self");
    }

    seePdfDoc = (id) => {
        let pdfUrl = `/pdfjs-1.9.426-dist/web/viewer.html?file=http://${window.location.hostname}:8081/consumer/docs/preview/` + id;
        window.open(pdfUrl, "_blank");
    }


    handleTablePageChange = (pagination) => {
        let pageSize = pagination.pageSize;
        let pageNum = pagination.current;
        this.getResultTableData(pageSize, pageNum)
    }


    render() {
        return (
            <div style={{ 'width': '99%' }} id="applyListDiv" >
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
        'GET_MENU_DATA': (payload) => {
            dispatch(getMenuDataAction(payload));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ApplyResult)

