import React from 'react';
import './common.css';
import { Form, Confirm, Loader } from 'semantic-ui-react';
import { connect } from 'react-redux';
import http from '../service/httpRequest';
import useSubstrate from '../service/userSubstrateRequest.js';
import * as COMMON from '../tools/CommonConstant';
import { u8aToHex, stringToU8a } from '@polkadot/util';


class UserApply extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileString: "",
            userDid: "",
            orgDid: "",
            authoName: "",
            range: "",
            num: "",
            userName: '',
            numMessage: "",
            type: "",
            startDate: "",
            endDate: "",
            confirmOpen: false,
            confirmContent: "",
            loaderState: "disabled",
        }
    }


    componentDidMount() {
        let credentialSubjectStr = localStorage.getItem('credentialSubject');
        let credentialSubject = credentialSubjectStr ? JSON.parse(credentialSubjectStr) : {};
        let fileInformation = credentialSubject.fileInformation || {};
        let validdate = fileInformation.validDate || "";
        let startDate = "";
        let endDate = "";
        if (validdate && validdate.indexOf("~") > -1) {
            startDate = validdate.split("~")[0];
            endDate = validdate.split("~")[1];
        }
        this.setState({
            fileString: localStorage.getItem('fileString') || "",
            userDid: fileInformation.operatorId,
            orgDid: fileInformation.approvalAgencyId,
            authoName: credentialSubject.longDescription || "",
            range: fileInformation.validAgency || "",
            num: fileInformation.number || "",
            userName: fileInformation.name || "",
            type: fileInformation.fileType || "",
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
        this.setState({ loaderState: 'active' });
        if (this.state.numMessage.length > 0) {
            return;
        }
        let seed = escape(this.state.userName).split('%').join('').padEnd(32, ' ');
        let pairs = COMMON.getallPairs(stringToU8a(seed));
        let params = {
            "sk": u8aToHex(pairs.secretKey),
            "vc": this.state.fileString,
        };
        useSubstrate.useSubstrateApi((api) => {
            if (!api) { return; }
            const key = api.createType('(Did, Did)', [this.state.userDid, this.state.orgDid]);
            api.query.potModule.applyAuth((key), (resp) => {
                console.log(resp.toString().slice(1, 2));
                let authState = resp.toString() ? resp.toString().slice(1, 2) : "0";
                if (authState === "1") {
                    // 请求VP
                    http.post("consumer/docs/application", params).then((resp) => {
                        if (resp.data && resp.data.status === 1) {
                            // 拿到VP后申请调阅档案
                            this.setState({
                                loaderState: 'disabled',
                                confirmOpen: true,
                                confirmContent: "申请成功。",
                            })
                        } else {
                            this.setState({
                                loaderState: 'disabled',
                                confirmOpen: true,
                                confirmContent: "申请失败，失败原因：" + resp.data.msg,
                            })
                        }
                    })

                } else {
                    this.setState({
                        loaderState: 'disabled',
                        confirmOpen: true,
                        confirmContent: "申请失败，失败原因：授权已过期或被撤销",
                    })
                }
                })
            })


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

            return(
            <div className = "applyDiv userApplyDiv" >
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
                    <Loader className={this.state.loaderState} ></Loader>
                    <Confirm
                        open={this.state.confirmOpen}
                        content={this.state.confirmContent}
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

