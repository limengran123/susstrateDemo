import React from 'react';
import './common.css';
import { Form, Confirm } from 'semantic-ui-react';
// import { getMenuDataAction } from '@/actions/menuAction';
import { connect } from 'react-redux';


class UserApply extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            authoName: "",
            range: "",
            num: "",
            numMessage: "",
            type: "",
            startDate: "",
            endDate: "",
            confirmOpen: false,

        }
    }


    componentDidMount() {
        let fileinforStr = localStorage.getItem('fileinformation');
        let fileinformation = fileinforStr ? JSON.parse(fileinforStr) : {};
        let credentialSubjectStr = localStorage.getItem('credentialSubject');
        let credentialSubject = credentialSubjectStr ? JSON.parse(credentialSubjectStr) : {};
        let validdate = fileinformation.validdate || "";
        let startDate = "";
        let endDate = "";
        if (validdate.indexOf("~") > -1) {
            startDate = validdate.split("~")[0];
            endDate = validdate.split("~")[1];
        }
        this.setState({
            authoName: credentialSubject.shortDescription || "",
            range: fileinformation.initiator || "",
            num: fileinformation.number || "",
            type: fileinformation.filetype || "",
            startDate: startDate,
            endDate: endDate,

        })
    }

    handleNumChange = (node, value) => {
        let regex = /^[A-Za-z0-9]+$/;
        let numError = "";
        if (!regex.test(value.value)) {
            numError = "调用客户编号仅可填写数字和字母，且长度不能超过50位，请重新输入"
        }
        this.setState({
            num: value.value,
            numMessage: numError,
        })
    }


    handleSubmit = () => {
        if (this.state.numMessage.length > 0 ) {
            return;
        }

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
            <div className="applyDiv userApplyDiv">
                <div>
                    <div className="applyForm">
                        <div className="authorization">
                            <label className="applyLabel">授权书选择：</label>
                            <Form.Input className="applyWork" fluid readOnly value={this.state.authoName} />
                        </div>
                        <div>
                            <label className="applyLabel">调用机构范围：</label>
                            <Form.Input className="applyWork" fluid readOnly value={this.state.range} />
                        </div>
                        <div>
                            <label className="applyLabel">调用客户编号：</label>
                            <Form.Input className="applyWork" fluid maxLength="50" onChange={this.handleNumChange} value={this.state.num} />
                            <label className="errorTip">{this.state.numMessage}</label>
                        </div>
                        <div className="authorization">
                            <label className="applyLabel">档案类型：</label>
                            <Form.Input className="applyWork" fluid readOnly value={this.state.type} />
                        </div>
                        <div>
                            <label className="applyLabel">调用日期范围：</label>
                            <input className="applyUserDate" type="date" name="" readOnly value={this.state.startDate} />
                            <span> ~ </span>
                            <input className="applyUserDate" type="date" name="" readOnly value={this.state.endDate} />
                        </div>
                        <div>
                            <Form.Button content='提交' className="userSubmit" onClick={this.handleSubmit} />
                        </div>
                    </div>
                </div>
                <Confirm
                    open={this.state.confirmOpen}
                    content='申请成功'
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

export default connect(mapStateToProps, mapDispatchToProps)(UserApply)

