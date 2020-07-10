import React from 'react';
import './common.css';
import { Table } from 'semantic-ui-react';
import { connect } from 'react-redux';
import * as COMMON from '../tools/CommonConstant';
import http from '../service/httpRequest';
import { resolvePlugin } from '@babel/core';

const tableTtile = ["编号", "申请机构", "调用客户编号", "档案类型", "生成日期范围", "申请人", "申请日期", "授权真实性", "操作"];
const tableData = [
    // {"num": '001', "work": "公安部", "consumerNum": '20197897', 'type': '文书', "date": '2020/08/19', 'user': '张三', 'appDate': '2020/08/19', "isTrue": true},
    // {"num": '002', "work": "公安部", "consumerNum": '20197897', 'type': '文书', "date": '2020/08/19', 'user': '张三', 'appDate': '2020/08/19', "isTrue": true},
    // {"num": '003', "work": "公安部", "consumerNum": '20197897', 'type': '文书', "date": '2020/08/19', 'user': '张三', 'appDate': '2020/08/19', "isTrue": true},
    // {"num": '004', "work": "公安部", "consumerNum": '20197897', 'type': '文书', "date": '2020/08/19', 'user': '张三', 'appDate': '2020/08/19', "isTrue": true},
]

class ApprovalList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: tableData,
        }
    }

    componentDidMount() {
        http.get("admin/docs/application/list").then((resp) => {
            if (resp.data && resp.data.status === 1) {
                this.setState({
                    tableData: resp.data.data.list
                })
            }
        })
    }

    handleAgreeClick = () => {

    }

    handleRefuseClick = () => {

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
                        {tableData.map((item, key) => {
                            return (<Table.Row key={key}>
                                <Table.Cell>{item.num}</Table.Cell>
                                <Table.Cell>{item.work}</Table.Cell>
                                <Table.Cell>{item.consumerNum}</Table.Cell>
                                <Table.Cell>{item.type}</Table.Cell>
                                <Table.Cell>{item.date}</Table.Cell>
                                <Table.Cell>{item.user}</Table.Cell>
                                <Table.Cell>{item.appDate}</Table.Cell>
                                <Table.Cell>{item.isTrue ? "真实" : "伪造"}</Table.Cell>
                                <Table.Cell>
                                    <div className="operation" onClick={this.handleAgreeClick}>同意</div>
                                    <div className="operation" onClick={this.handleRefuseClick}>拒绝</div>
                                </Table.Cell>
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

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ApprovalList)

