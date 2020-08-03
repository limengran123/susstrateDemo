import React from 'react';
import './common.css';
import { Loader, Confirm } from 'semantic-ui-react';
import { Table } from 'antd';
import 'antd/dist/antd.css';
import { connect } from 'react-redux';
import * as COMMON from '../tools/CommonConstant';
import http from '../service/httpRequest';
import { resolvePlugin } from '@babel/core';



class ApprovalList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: [],
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
                    dataIndex: 'applyOrg',
                    key: 'applyOrg',
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
                    title: '申请人',
                    dataIndex: 'applyUser',
                    key: 'applyUser',
                },
                {
                    title: '申请日期',
                    dataIndex: 'creationDate',
                    key: 'creationDate',
                },
                {
                    title: '授权真实性',
                    dataIndex: 'vcReal',
                    key: 'vcReal',
                },
                {
                    title: '操作',
                    dataIndex: 'operate',
                    key: 'operate',
                    render: (item) => item.approveStatus === 0 ?
                        <div>
                            <div className="operation" onClick={this.handleAgreeClick.bind(this, item)}>同意</div>
                            <div className="operation" onClick={this.handleRefuseClick.bind(this, item)}>拒绝</div>
                        </div>
                        :  ( item.approveStatus === 1 ? <div>已同意</div> : <div>已拒绝</div>) 

                }
            ],
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
        http.get("admin/docs/application/list?pageSize=" + pageSize + "&pageNum=" + pageNum).then((resp) => {
            if (resp.data && resp.data.status === 1) {
                let tableDataList = resp.data.data.list;
                let newTbaleData = []
                for (var i = 0; i < tableDataList.length; i++) {
                    newTbaleData.push({
                        index: pageNum === 1 ? i + 1 : (pageNum - 1) * pageSize + i + 1,
                        applyOrg: tableDataList[i].applyOrg,
                        customerNo: tableDataList[i].customerNo,
                        docType: tableDataList[i].docType,
                        docDateRange: tableDataList[i].docDateRange,
                        applyUser: tableDataList[i].applyUser,
                        creationDate: this.getDateStr(tableDataList[i].creationDate),
                        vcReal: tableDataList[i].vcReal === 1 ? "真实" : "伪造",
                        operate: tableDataList[i]
                    });
                }
                this.setState({
                    tableData: newTbaleData,
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

    handleAgreeClick = (rowData) => {
        this.setState({
            loaderState: "active",
        })
        let newRowData = JSON.parse(JSON.stringify(rowData));
        newRowData.approveStatus = 1;
        http.post("admin/docs/approval", newRowData).then((resp) => {
            if (resp.data && resp.data.status === 1) {
                this.loadTbaleData(this.state.pagination.pageSize, 1);
                this.setState({
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

    handleRefuseClick = (rowData) => {
        this.setState({
            loaderState: "active",
        })
        let newRowData = JSON.parse(JSON.stringify(rowData));
        newRowData.approveStatus = 2;
        http.post("admin/docs/approval", newRowData).then((resp) => {
            if (resp.data && resp.data.status === 1) {
                this.loadTbaleData(this.state.pagination.pageSize, 1);
                this.setState({
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

