import React from 'react';
import './common.css';
import { Button, Form, Confirm, Loader } from 'semantic-ui-react';
import { connect } from 'react-redux';
import http from '../service/httpRequest.js';
import useSubstrate from '../service/userSubstrateRequest.js';
import * as COMMON from '../tools/CommonConstant';
import { getMenuDataAction } from '@/actions/menuAction';
import { u8aToHex } from '@polkadot/util';

const stringToU8a = require('@polkadot/util/string/toU8a').default;
const testKeyring = require('@polkadot/keyring/testing');
const keyring = testKeyring.default();


class DidApply extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applyUser: "",
            confirmOpen: false,
            messageContent: '',
            loaderState: "disabled",
        }
    }


    handleUserChange = (node, value) => {
        this.setState({
            applyUser: value.value.trim(),
        })
    }

    submitClick = (userNameTxt) => {
        this.setState({ loaderState: "active" })
        let userName = window.location ? window.location.pathname.slice(1) : "police";
        let authUserNmae = this.state.applyUser;
        let accountId1 = "";
        let accountId2 = "";
        let url = "";
        let userType = "";
        let organization = "";
        let newOperatorArr = [];
        // 生成人员Did
        if (this.props.isUser) {
            let operatorArr = JSON.parse(localStorage.getItem("operatorArr"));
            if (!operatorArr) {
                newOperatorArr.push(authUserNmae);
            } else {
                if (operatorArr.includes(authUserNmae)) {
                    this.props.GET_MENU_DATA("申请授权");
                    return;
                } else {
                    newOperatorArr = operatorArr;
                    newOperatorArr.push(authUserNmae)
                }
            }

            // 创建钥对并将Alice添加到keyring pair字典中（带有帐户种子）
            // const seed = (Math.random().toString(36).substr(2)).padEnd(32, ' ');
            const seed = escape(authUserNmae).split('%').join('').padEnd(32, ' ');
            const result = keyring.addFromSeed(stringToU8a(seed));
            accountId1 = result.address;
            url = "consumer/dids/register";
            userType = "调阅人员";
            organization = authUserNmae;
        } else {
            accountId1 = COMMON.ACCOUNT_TO_USER[userName];
            url = COMMON.URL_TO_NAME[userName] + "register";
            userType = COMMON.USER_TYPE[userName];
            organization = COMMON.ORG_TO_USERNAME[userName];
        }

        accountId2 = COMMON.ACCOUNT_SECONDARY;
        let params = {
            "mainKeyPair": {
                "publicKey": u8aToHex(keyring.getPair(accountId1).publicKey) || ""
            },
            "secondKeyPair": {
                "publicKey": u8aToHex(keyring.getPair(accountId2).publicKey) || ""
            },
            "userType": userType,
            "organization": organization,
        }
        if (userName === "ccb") {
            params = {
                "mainKeyPair": {
                    "publicKey": u8aToHex(keyring.getPair(accountId1).publicKey) || "",
                    "privateKey": u8aToHex(COMMON.getPairFromAccount("//CHARLIE").secretKey) || "",
                },
                "secondKeyPair": {
                    "publicKey": u8aToHex(keyring.getPair(accountId2).publicKey) || "",
                    "privateKey": u8aToHex(COMMON.getPairFromAccount("//BOB").secretKey) || "",
                },
                "userType": userType,
                "organization": organization,
            }
        }

        http.post(url, params).then((resp) => {
            if (resp.data && resp.data.status === 1) {
                let docUrl = resp.data.data.docUrl || "";
                let docHash = resp.data.data.docHash || "";
                let did = resp.data.data.didId || "";

                if (this.props.isUser) {
                    // 将已申请过DId的用户保存起来传给使用方供使用方选择
                    let userDidObj = {
                        [authUserNmae]: did
                    }
                    localStorage.setItem('userHasDid' + authUserNmae, JSON.stringify(userDidObj));
                    localStorage.setItem("operatorArr", JSON.stringify(newOperatorArr));
                } else {
                    //将Did保存在本地
                    let orgDidObj = {
                        [userNameTxt]: did
                    }
                    let privateKeyObj = {
                        [userNameTxt]: accountId1
                    }
                    // 将已申请过DId保存起来,如果有值，页面不会再申请DId
                    localStorage.setItem('orgrHasDid' + userName, JSON.stringify(orgDidObj));
                    localStorage.setItem('orgrHasPrivateKey' + userName, JSON.stringify(privateKeyObj));
                }

                // 调用区块链
                useSubstrate.useSubstrateApi((api) => {
                    if (!api) { return; }
                    const { nonce } = api.query.system.account(accountId1);
                    const operatePair = keyring.getPair(accountId1);
                    const result = api.tx.potModule.register(did, docUrl, docHash);
                    result.signAndSend(operatePair, { nonce }, ({ events = [], status }) => {
                        if (status.isInBlock) {
                            events.forEach(({ event: { data, method, section }, phase }) => {
                                if (section === 'system' && method === 'ExtrinsicSuccess') {
                                    this.setState({
                                        loaderState: "disabled",
                                        confirmOpen: true,
                                        messageContent: "生成成功",
                                    })
                                } else if (section === 'system' && method === 'ExtrinsicFailed') {
                                    const [error, info] = data;
                                    if (error.isModule) {
                                        const decoded = api.registry.findMetaError(error.asModule);
                                        const { documentation, name, section } = decoded;
                                        if (name === "DidAlreadyExist") {
                                            this.setState({
                                                loaderState: "disabled",
                                                confirmOpen: true,
                                                messageContent: "did已存在，did信息：" + did,
                                            })
                                        } else {
                                            this.setState({
                                                loaderState: "disabled",
                                                confirmOpen: true,
                                                messageContent: "did上链登记失败，失败原因" + name + "。请重试或联系管理员。",
                                            })
                                        }
                                    }
                                }

                            })
                        }
                    }).catch(console.error)

                })


            } else {
                this.setState({
                    loaderState: "disabled",
                    confirmOpen: true,
                    messageContent: resp.data.msg,
                })

            }

        }).catch((error) => {
            console.log(error);
        })

    }



    handleCancel = () => {
        this.setState({
            confirmOpen: false,
        })
    }


    handleConfirm = () => {
        let userName = window.location ? window.location.pathname.slice(1) : "police";
        this.setState({
            confirmOpen: false,
        })

        if (this.state.messageContent.indexOf("登记失败") > -1) {
            return;
        }

        // 生成Did后跳转至对应的页面
        if (userName === "police") {
            this.props.GET_MENU_DATA("调用人员DID生成");
        } else {
            this.props.GET_MENU_DATA(COMMON.menuItemObj[userName][0]);
        }

        if (this.props.isUser) {
            // 生成Did后跳转至对应的页面
            this.props.GET_MENU_DATA(COMMON.menuItemObj[userName][0]);
        }
    }


    render() {
        let userName = window.location ? window.location.pathname.slice(1) : "police";
        let userNameTxt = "";
        if (userName === "didRegister") {
            userNameTxt = "公安部";
        } else if (userName === "ccb") {
            userNameTxt = "建设银行办公室";
        } else if (userName === "fintech") {
            userNameTxt = "建信金科";
        } 
        return (
            <div id="didApplyDiv">
                <div>
                    <label>用户名：</label>
                    <label>{userNameTxt}</label>
                </div>
                <div style={{ 'display': this.props.isUser ? "block" : 'none' }}>
                    <label>下属调度人员名称：</label>
                    <Form.Input className="userOfOrg" fluid onChange={this.handleUserChange} value={this.state.applyUser} />
                </div>
                <div>
                    <Button primary onClick={this.submitClick.bind(this, userNameTxt)}>生成DID</Button>
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DidApply)

