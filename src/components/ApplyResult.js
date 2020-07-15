import React from 'react';
import PDF from 'react-pdf-js';
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
            tableTtile: ["编号", "申请机构", "调用机构范围", "调用客户编号", "档案类型", "生成日期范围", "申请时间", "操作"],
            tableData: [],
            isShowMoreInfo: false,
            userName: "",
        }
    }

    componentDidMount() {
        this.getResultTableData();
        let credentialSubjectStr = localStorage.getItem('credentialSubject');
        let credentialSubject = credentialSubjectStr ? JSON.parse(credentialSubjectStr) : {};
        let fileInformation = credentialSubject.fileInformation || {};
        this.setState({
            userName: fileInformation.name || "",
        })
    }

    componentWillReceiveProps(nextProps) {
        this.getResultTableData();
    }

    getResultTableData = () => {
        http.get("consumer/docs/application/pagedlist").then((resp) => {
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
                    let rowData = [producerId, applyOrg, callOrgRange, customerNo, docType, docDateRange, creationDate];
                    newTableData.push(rowData);
                }
                this.setState({
                    tableColumns: 8,
                    tableTtile: ["编号", "申请机构", "调用机构范围", "调用客户编号", "档案类型", "生成日期范围", "申请时间", "操作"],
                    // tableData: newTableData,
                    tableData: [[0, "建设银行", "支行", "20200909", "文书档案", "20200708-20200809", "20200809"]],
                    isShowMoreInfo: false,
                })
            }
        })
    }

    handleMoreClick = (rowData) => {
        let tableData = [];
        // 获取详情里的文书档案列表
        http.get("consumer/docs/filelist?docApplyId=" + rowData[0]).then((resp) => {
            if (resp.data && resp.data.status === 1) {
                let respList = resp.data.data;
                this.getDocTruth(respList, (tableData) => {
                    this.setState({
                        tableColumns: 5,
                        tableTtile: ["编号", "档案名称", "生成日期", "数据真实性", "操作"],
                        // tableData: tableData,
                        tableData: [[1, "xxx档案",'20200909', 1]],
                        isShowMoreInfo: true,
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
        // useSubstrate.useSubstrateApi((api) => {
        //     (async function () {
        //         if (!api) { return; }
        //         let { nonce } = await api.query.system.account(account);
        for (var i = 0; i < respList.length; i++) {
            const filName = respList[i].fileName;
            const id = respList[i].id || "";
            const creationDate = respList[i].creationDate ? respList[i].creationDate.split(" ")[0] : "";
            // 根据每条档案副本查询档案hash
            // http.get("consumer/").then((resp) => {
            //     if (resp.data && resp.data.status === 1) {
            //         let docId = resp.data.data.docId;
            //         let docHash = resp.data.data.hash;
            //         const result = api.tx.potModule.verify(docId, docHash);
            //         result.signAndSend(keyring.getPair(account), { nonce }, ({ events = [], status }) => {
            //             if (status.isInBlock) {
            //                 events.forEach(({ event: { data, method, section }, phase }) => {
            //                     if (section === 'system' && method === 'ExtrinsicSuccess') {
            tableData.push([id, filName, creationDate, true])
            // } else if (section === 'system' && method === 'ExtrinsicFailed') {
            //     const [error, info] = data;
            //     if (error.isModule) {
            //         const decoded = api.registry.findMetaError(error.asModule);
            //         const { documentation, name, section } = decoded;
            //         tableData.push([id, filName, creationDate, false])
            //     }

            // }
            if (tableData.length === respList.length) {
                callback(tableData);
            }
            // });
            //     }
            // }).catch(console.error);
        }
        //         })
        //         nonce = parseInt(nonce) + 1;
        //     }
        // })();
        // })

    }

    download = (rowData) => {
        window.open("consumer/docs/downloader?id=" + rowData[0], "_self");
    }

    // seePdfDoc = (rowData) => {
    //     return  (
        // return (
        //     <div className="pdf">
        //         <PDF
        //             file="./somefile.pdf"
        //         />
        //     </div>
        // )

    // }

    render() {
        return (
            <div style={{ 'width': '99%' }} id="applyListDiv">
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
                                    return (<Table.Cell key={index}>{index === 0 ? index : value}</Table.Cell>)
                                })
                            }
                                {this.state.isShowMoreInfo ?
                                    <Table.Cell >
                                        {/* <div className="operation" ><iframe src="./somefile.pdf">查看</iframe> </div> */}
                                        <div className="operation" ><a href="./somefile.pdf">查看</a> </div>
                                        <div className="operation" onClick={this.download.bind(this, item)}> 下载</div>
                                    </Table.Cell>
                                    : <Table.Cell className="operation" onClick={this.handleMoreClick.bind(this, item)} >查看详情</Table.Cell>
                                }
                            </Table.Row>)
                        })}
                    </Table.Body>
                </Table>
            </div>
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

