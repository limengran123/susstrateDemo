import React from 'react';
import './common.css';
import { Table } from 'semantic-ui-react';
import { connect } from 'react-redux';

class ApplyResult extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableColumns: 9,
            tableTtile : ["编号", "申请机构", "调用机构范围", "调用客户编号", "档案类型", "生成日期范围", "申请时间", "数据真实性", "操作"],
            tableData: [
                ['001', "公安部", '20197897', '文书', '2020/08/19', '张三', '2020/08/19', "真实",],
                ['002', "公安部", '20197897', '文书', '2020/08/19', '张三', '2020/08/19', "伪造",],
                ['003', "公安部", '20197897', '文书', '2020/08/19', '张三', '2020/08/19', "真实",],
            ],
            isShowMoreInfo: false,
        }
    }

    handleMoreClick = () => {
        this.setState({
            tableColumns: 5,
            tableTtile: ["编号", "档案名称", "生成日期", "数据真实性", "操作"],
            tableData: [['1', '文书档案', '20/08/19', 'true']],
            isShowMoreInfo: true,
        })
    }

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
                                    return (<Table.Cell key={index}>{value}</Table.Cell>)
                                })
                            }
                            {this.state.isShowMoreInfo ?
                                    <Table.Cell >
                                        <div className="operation" >查看</div>
                                        <div className="operation" >下载</div>
                                    </Table.Cell>
                                    : <Table.Cell className="operation" onClick={this.handleMoreClick} >查看详情</Table.Cell>
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

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ApplyResult)

