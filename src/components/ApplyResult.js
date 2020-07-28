import React from 'react';
import './common.css';
import { Table, Loader, Confirm } from 'semantic-ui-react';
import { connect } from 'react-redux';
import http from '../service/httpRequest';
import { getMenuDataAction } from '@/actions/menuAction';
import useSubstrate from '../service/userSubstrateRequest.js';
import * as COMMON from '../tools/CommonConstant';


const stringToU8a = require('@polkadot/util/string/toU8a').default;
const testKeyring = require('@polkadot/keyring/testing');
const keyring = testKeyring.default();


class ApplyResult extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableColumns: 8,
            tableTtile: ["编号", "申请机构", "调用机构范围", "调用客户编号", "档案类型", "生成日期范围", "申请时间", "审批状态", "操作"],
            tableData: [],
            isShowMoreInfo: false,
            loaderState: "disabled",
            confirmOpen: false,
            messageContent: '',
        }
    }

    componentDidMount() {
        this.getResultTableData();
    }

    componentWillReceiveProps(nextProps) {
        this.getResultTableData();

    }

    getResultTableData = () => {
        let credentialSubjectStr = localStorage.getItem('credentialSubject');
        let credentialSubject = credentialSubjectStr ? JSON.parse(credentialSubjectStr) : {};
        let fileInformation = credentialSubject.fileInformation || {};
        let orgDidStr = localStorage.getItem('userHasDid' + fileInformation.name);
        let orgDidObj = orgDidStr ? JSON.parse(orgDidStr) : {};
        let userDid = orgDidObj[fileInformation.name];
        http.get("consumer/docs/application/pagedlist?applyUserDid=" + userDid).then((resp) => {
            if (resp.data && resp.data.status === 1) {
                let newTableData = []
                let tableDataList = resp.data.data.list;
                for (var i = 0; i < tableDataList.length; i++) {
                    let applyOrg = tableDataList[i].applyOrg || "";
                    let callOrgRange = tableDataList[i].callOrgRange || "";
                    let customerNo = tableDataList[i].customerNo || "";
                    let docType = tableDataList[i].docType || "";
                    let docDateRange = tableDataList[i].docDateRange || "";
                    let creationDate = tableDataList[i].creationDate ? tableDataList[i].creationDate.split(" ")[0] : "";
                    let producerId = tableDataList[i].producerId || "";
                    let statusToTextArr = ["未审批", "已通过", "已拒绝"]
                    let approveStatus = statusToTextArr[tableDataList[i].approveStatus]
                    approveStatus = tableDataList[i].approveStatus === 100 ? "未查询到相关档案" : approveStatus
                    let rowData = [producerId, applyOrg, callOrgRange, customerNo, docType, docDateRange, creationDate, approveStatus];
                    newTableData.push(rowData);
                }
                this.setState({
                    tableColumns: 9,
                    tableTtile: ["编号", "申请机构", "调用机构范围", "调用客户编号", "档案类型", "生成日期范围", "申请时间", "审批状态", "操作"],
                    tableData: newTableData,
                    isShowMoreInfo: false,
                })
            }
        })
    }

    handleMoreClick = (rowData) => {
        this.setState({
            loaderState: "active",
            isShowMoreInfo: true,
            tableColumns: 5,
            tableTtile: ["编号", "档案名称", "生成日期", "数据真实性", "操作"],
            tableData: [],
        })
        let tableData = [];
        // 获取详情里的文书档案列表
        http.get("consumer/docs/filelist?docApplyId=" + rowData[0]).then((resp) => {
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
                    let { nonce } = await api.query.system.account(account);
                    for (var i = 0; i < resultList.length; i++) {
                        const filName = resultList[i].fileName;
                        const id = resultList[i].id || "";
                        const creationDate = resultList[i].creationDate ? resultList[i].creationDate.split(" ")[0] : "";
                        const fileId = resultList[i].fileId;
                        const result = api.tx.potModule.verify(fileId, resultList[i].fileHash);
                        await result.signAndSend(keyring.getPair(account), { nonce }, ({ events = [], status }) => {
                            if (status.isInBlock) {
                                events.filter(({ event: { section } }) => {
                                    return section === 'potModule'
                                }).forEach(({ event: { data, method, section } }) => {
                                    console.log(`${section}.${method}`, data.toString());
                                    if (method === "Verified") {
                                        let respDataStr = data.toString();
                                        let arcDataReal = respDataStr.substring(1, respDataStr.length - 1).split(",")[2];
                                        if (arcDataReal === "true") {
                                            tableData.push([id, filName, creationDate, "真实"]);
                                        } else {
                                            tableData.push([id, filName, creationDate, "伪造"]);
                                        }
                                    }
                                    if (tableData.length === resultList.length) {
                                        callback(tableData);
                                    }
                                });

                                events.filter(({ event: { section, method } }) => {
                                    return section === 'system' && method === 'ExtrinsicFailed'
                                }).forEach(({ event: { data: [error, info] } }) => {
                                    if (error.isModule) {
                                        const decoded = api.registry.findMetaError(error.asModule);
                                        const { documentation, name, section } = decoded;
                                        console.log(`${section}.${name}: ${documentation.join(' ')}`);
                                        if (name === "ArchiveIsVerified") {
                                            api.query.potModule.archDoc(fileId, (arcData) => {
                                                let dataStr = arcData.toString() || "";
                                                console.log(dataStr)
                                                let arcReal = dataStr.substring(1, dataStr.length - 1).split(",")[2];
                                                let newArcReal = arcReal.substring(1, arcReal.length - 1);
                                                console.log(arcReal)
                                                if (newArcReal === "Authentic") {
                                                    tableData.push([id, filName, creationDate, "真实"]);
                                                } else if (newArcReal === "Fake") {
                                                    tableData.push([id, filName, creationDate, "伪造"]);
                                                }

                                                if (tableData.length === resultList.length) {
                                                    callback(tableData);
                                                }
                                            })
                                        } else {
                                            tableData.push([id, filName, creationDate, name]);
                                        }

                                        if (tableData.length === resultList.length) {
                                            callback(tableData);
                                        }

                                    } else {
                                        console.log(error.toString());
                                    }

                                    if (tableData.length === resultList.length) {
                                        callback(tableData);
                                    }
                                });



                            }
                        }).catch(console.error);
                        nonce = parseInt(nonce) + 1;
                    }
                })();
            })
        })

    }

    download = (rowData) => {
        window.open("consumer/docs/downloader?id=" + rowData[0], "_self");
    }

    seePdfDoc = (rowData) => {
        let pdfUrl = `/pdfjs-1.9.426-dist/web/viewer.html?file=http://${window.location.hostname}:8081/consumer/docs/preview/` + rowData[0];
        window.open(pdfUrl, "_blank");
    }



    render() {
        return (
            <div style={{ 'width': '99%' }} id="applyListDiv" >
                <Table columns={this.state.tableColumns} id="applyTableList">
                    <Table.Header>
                        <Table.Row>
                            {this.state.tableTtile.map((item, key) => {
                                return (<Table.HeaderCell key={key}>{item}</Table.HeaderCell>)
                            })
                            }
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.state.tableData.map((item, num) => {
                            return (<Table.Row key={num}>{
                                item.map((value, index) => {
                                    return (<Table.Cell key={index}>{index === 0 ? num : value}</Table.Cell>)
                                })
                            }
                                {this.state.isShowMoreInfo ?
                                    <Table.Cell>
                                        <div className="operation" onClick={this.seePdfDoc.bind(this, item)}>查看 </div>
                                        <div className="operation" onClick={this.download.bind(this, item)}> 下载</div>
                                    </Table.Cell>
                                    : <Table.Cell>
                                        <div style={{'display': item[7] === "已通过" ? "inline-block" : "none"}} className="operation" onClick={this.handleMoreClick.bind(this, item)}>查看详情</div>
                                    </Table.Cell>
                                }
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

