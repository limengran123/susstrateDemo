import React from 'react';
import './common.css';
import { Table, Loader, Confirm } from 'semantic-ui-react';
import { connect } from 'react-redux';
import * as COMMON from '../tools/CommonConstant';
import http from '../service/httpRequest';
import { resolvePlugin } from '@babel/core';

const tableTtile = ["编号", "申请机构", "调用客户编号", "档案类型", "生成日期范围", "申请人", "申请日期", "授权真实性", "操作"];
const tableData = [
]

class ApprovalList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: tableData,
            loaderState: "disabled",
            confirmOpen: false,
            messageContent: '',
        }
    }

    componentDidMount() {
        http.get("admin/docs/application/list?pageSize=200").then((resp) => {
            if (resp.data && resp.data.status === 1) {
                let tableDataList = resp.data.data.list;
                let newTbaleData = []
                for (var i = 0; i < tableDataList.length; i++) {
                    if (tableDataList[i].approveStatus === 0) {
                        newTbaleData.push(tableDataList[i]);
                    }
                }
                this.setState({
                    tableData: newTbaleData
                })
            }
        })
    }

    handleAgreeClick = (key, rowData) => {
        this.setState({
            loaderState: "active",
        })
        let newRowData = JSON.parse(JSON.stringify(rowData));
        newRowData.approveStatus = 1;
        http.post("admin/docs/approval", newRowData).then((resp) => {
            if (resp.data && resp.data.status === 1) {
                let tableData = this.state.tableData;
                tableData.splice(key, 1);
                this.setState({
                    tableData: tableData,
                    messageContent: "操作成功",
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

    handleRefuseClick = (key, rowData) => {
        this.setState({
            loaderState: "active",
        })
        let newRowData = JSON.parse(JSON.stringify(rowData));
        newRowData.approveStatus = 2;
        http.post("admin/docs/approval", newRowData).then((resp) => {
            if (resp.data && resp.data.status === 1) {
                let tableData = this.state.tableData;
                tableData.splice(key, 1);
                this.setState({
                    tableData: tableData,
                    messageContent: "操作成功",
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
                <Table columns={9} id="applyTableList">
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
                                <Table.Cell>{key}</Table.Cell>
                                <Table.Cell>{item.applyOrg}</Table.Cell>
                                <Table.Cell>{item.customerNo}</Table.Cell>
                                <Table.Cell>{item.docType}</Table.Cell>
                                <Table.Cell>{item.docDateRange}</Table.Cell>
                                <Table.Cell>{item.applyUser}</Table.Cell>
                                <Table.Cell>{this.getDateStr(item.creationDate)}</Table.Cell>
                                <Table.Cell>{item.vcReal === 1 ? "真实" : "伪造"}</Table.Cell>
                                <Table.Cell>
                                    <div className="operation" onClick={this.handleAgreeClick.bind(this, key, item)}>同意</div>
                                    <div className="operation" onClick={this.handleRefuseClick.bind(this, key, item)}>拒绝</div>
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

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ApprovalList)

