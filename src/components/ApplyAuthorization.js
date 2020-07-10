import React from 'react';
import './common.css';
import { Select, Form, Confirm, Loader } from 'semantic-ui-react';
import { getMenuDataAction } from '@/actions/menuAction';
import { getUserDidInfoAction } from '@/actions/didInfoAction';
import { connect } from 'react-redux';
import useSubstrate from '../service/userSubstrateRequest.js';

const testKeyring = require('@polkadot/keyring/testing');
const keyring = testKeyring.default();



const dataTypeOptions = [
    { key: 0, value: 0, text: "文书档案" },
    // { key: 1, value: 1, text: "会计档案" },
    // { key: 2, value: 2, text: "个人信贷档案" },
]

const rangeOptions = [
    { key: 0, value: 0, text: "建设银行上海浦东南路支行" },
    { key: 1, value: 1, text: "建设银行武汉金地城支行" },
    { key: 2, value: 2, text: "建设银行武汉经济技术开发区支行" },
    { key: 3, value: 3, text: "建设银行武汉江堤中路高龙支行" },
    { key: 4, value: 4, text: "建设银行武汉利济北路支行" },
]

class ApplyAuthorization extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            authOrgDidMap: new Map(),
            userOptions: [],
            authOrgOptions: [],
            workAutho: '',
            num: '',
            dataType: '',
            startDate: '',
            endDate: '',
            range: '',
            user: '',
            email: '',
            numMessage: '',
            emailErrorMessage: '',
            confirmOpen: false,
            messageContent: '',
            loaderState: "disabled",
        }
    }

    componentDidMount() {
        let authOrgDidMap = new Map();
        let userOptions = this.state.userOptions;
        let authOrgOptions = this.state.authOrgOptions;
        let operatorArrStr = localStorage.getItem("operatorArr") || "";
        let operatorArr = operatorArrStr ? JSON.parse(operatorArrStr) : "";
        for (var i = 0; i < operatorArr.length; i++) {
            userOptions.push({ key: i, value: i, text: operatorArr[i] });
        }
        authOrgOptions.push({ key: 0, value: 0, text: "建设银行办公室" });
        const orgDidStr = localStorage.getItem("orgrHasDidccb") || "";
        const orgDid = orgDidStr ? JSON.parse(orgDidStr)["建设银行办公室"] : "";
        // 建设银行办公室DID先获取再写死
        authOrgDidMap.set("建设银行办公室", orgDid);
        authOrgDidMap.set("建设银行办公室", "did:ccbft:AZS34F2HSuSiPvjx2DjvU8FYYP");


        this.setState({
            authOrgDidMap: authOrgDidMap,
            userOptions: userOptions,
            authOrgOptions: authOrgOptions,
        })
        this.props.GET_USER_DID(orgDid);

    }


    handleChange = (node, value) => {
        this.setState({
            workAutho: value.value,
            dataType: value.value,
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

    handleStartDateChange = () => {
        this.setState({
            startDate: this.refs.startDateInput.value,
        })
    }

    handleEndDateChange = () => {
        this.setState({
            endDate: this.refs.endDateInput.value,
        })
    }

    handleRangeChange = (node, value) => {
        this.setState({
            range: value.value,
        })
    }

    handleUserChange = (node, value) => {
        this.setState({
            user: value.value,
        })
    }

    handleEmailChange = (node, value) => {
        let regex = /^\w+((\.\w+){0,3})@\w+(\.\w{2,3}){1,3}$/;
        let emailError = "";
        if (!regex.test(value.value)) {
            emailError = "邮箱格式不正确，请重新输入"
        }
        this.setState({
            email: value.value,
            emailErrorMessage: emailError,
        })
    }

    handleSubmit = () => {
        let userName = window.location ? window.location.pathname.slice(1) : "police";
        if (this.state.emailErrorMessage.length > 0 || this.state.numMessage.length > 0) {
            return;
        }
        let workAuthoReg = this.state.workAutho > 0 || (!this.state.workAutho && this.state.workAutho === 0);
        let dataType = this.state.dataType > 0 || !this.state.dataType && this.state.dataType === 0;
        let user = this.state.user > 0 || !this.state.user && this.state.user === 0;
        let range = this.state.range > 0 || !this.state.range && this.state.range === 0;
        if (!workAuthoReg || !this.state.num || !dataType || !this.state.startDate || !this.state.endDate || !user || !range || !this.state.email) {
            this.setState({
                confirmOpen: true,
                messageContent: '每项都为必填项，请检查是否填写完整',
            })
            return;
        }

        this.setState({ loaderState: "active" })

        let authOrgName = this.state.workAutho || this.state.workAutho === 0 ? this.state.authOrgOptions[this.state.workAutho].text : "";
        let authDid = this.state.authOrgDidMap.get(authOrgName);
        let operateorName = this.state.user || this.state.user === 0 ? this.state.userOptions[this.state.user].text : "";

        const orgDidStr = localStorage.getItem("orgrHasDid" + userName) || "";
        const orgDid = orgDidStr ? JSON.parse(orgDidStr)["公安部"] : "";

        const operateorDidStr = localStorage.getItem("userHasDid" + operateorName) || "";
        const operateorDid = operateorDidStr ? JSON.parse(operateorDidStr)[operateorName] : "";
        let param = {
            "authOrg": authOrgName, //授权机构（档案生产方）
            "applyOrg": "公安部", //申请机构（档案使用方）
            "customerNo": this.state.num, //客户编号
            "docType": this.state.dataType || this.state.dataType === 0 ? dataTypeOptions[this.state.dataType].text : "", //文档类型
            "startDate": this.state.startDate, //调用开始日期
            "endDate": this.state.endDate, //调用结束日期
            "operator": operateorName, //调阅人员
            "callOrgRange": this.state.range || this.state.range === 0 ? rangeOptions[this.state.range].text : "",
            "receiveMail": this.state.email,
            "authOrgDid": authDid, //授权机构Did需要写死在系统中
            "applyOrgDid": orgDid, //使用机构DID
            "operatorDid": operateorDid, //调阅人员DID
        }

        const paramStr = JSON.stringify(param);
        // 调用区块链申请授权接口
        const userKeyObj = localStorage.getItem("orgrHasPrivateKey" + userName) || "";
        const publicKey = userKeyObj ? JSON.parse(userKeyObj)["公安部"] : "";

        useSubstrate.useSubstrateApi((api) => {
            if (!api) { return; }
            const result = api.tx.potModule.apply(operateorDid, authDid, paramStr);
            result.signAndSend(keyring.getPair(publicKey), ({ events = [], status }) => {
                if (status.isInBlock) {
                    events.forEach(({ event: { data, method, section }, phase }) => {
                        if (section === 'system' && method === 'ExtrinsicSuccess') {
                            this.setState({
                                workAutho: '',
                                num: '',
                                dataType: '',
                                startDate: '',
                                endDate: '',
                                range: '',
                                user: '',
                                email: '',
                                confirmOpen: true,
                                messageContent: '申请成功',
                                loaderState: "disabled",
                            })
                        } else if (section === 'system' && method === 'ExtrinsicFailed') {
                            const [error, info] = data;
                            if (error.isModule) {
                                const decoded = api.registry.findMetaError(error.asModule);
                                const { documentation, name, section } = decoded;
                                this.setState({
                                    confirmOpen: true,
                                    messageContent: '申请失败,失败原因：' + name,
                                    loaderState: "disabled",
                                })
                            }


                        }
                    });

                }

            }).catch(console.error)
        });
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
            <div className="applyDiv">
                <h3>建设银行档案信息调用</h3>
                <div>
                    <div className="applyForm">
                        <div className="authorization">
                            <label className="applyLabel">授权机构：</label>
                            <Select required options={this.state.authOrgOptions} onChange={this.handleChange} value={this.state.workAutho} />
                        </div>
                        <div>
                            <label className="applyLabel">申请机构：</label>
                            <Form.Input className="applyWork" fluid readOnly value="公安部" />
                        </div>
                        <div>
                            <label className="applyLabel">调用客户编号：</label>
                            <Form.Input className="applyWork" fluid maxLength="50" onChange={this.handleNumChange} value={this.state.num} />
                            <label className="errorTip">{this.state.numMessage}</label>
                        </div>
                        <div className="authorization">
                            <label className="applyLabel">档案类型：</label>
                            <Select options={dataTypeOptions} value={this.state.dataType} onChange={this.handleChange} />
                        </div>
                        <div>
                            <label className="applyLabel">调用日期范围：</label>
                            <input className="applyUserDate" type="date" name="" value={this.state.startDate} onChange={this.handleStartDateChange} ref="startDateInput" />
                            <span> ~ </span>
                            <input className="applyUserDate" type="date" name="" value={this.state.endDate} onChange={this.handleEndDateChange} ref="endDateInput" />
                        </div>
                        <div className="authorization">
                            <label className="applyLabel">调用机构范围：</label>
                            <Select options={rangeOptions} value={this.state.range} onChange={this.handleRangeChange} />
                        </div>
                        <div className="authorization">
                            <label className="applyLabel">指派调用人员：</label>
                            <Select options={this.state.userOptions} value={this.state.user} onChange={this.handleUserChange} />
                        </div>
                        <div className="authorization">
                            <label className="applyLabel">授权文件接收邮箱：</label>
                            <Form.Input className="applyWork" name='email' type='email' onChange={this.handleEmailChange} value={this.state.email} />
                            <label className="errorTip">{this.state.emailErrorMessage}</label>
                        </div>
                        <div>
                            <Form.Button content='提交' className="submit" onClick={this.handleSubmit} />
                        </div>
                    </div>
                </div>
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
        'GET_MENU_DATA': (payload) => {
            dispatch(getMenuDataAction(payload));
        },
        "GET_USER_DID": (payload) => {
            dispatch(getUserDidInfoAction(payload));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ApplyAuthorization)

