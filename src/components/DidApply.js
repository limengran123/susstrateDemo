import React from 'react';
import './common.css';
import { Button, Form, Confirm, Loader } from 'semantic-ui-react';
import { connect } from 'react-redux';
import http from '../service/httpRequest.js';
import useSubstrate from '../service/userSubstrateRequest.js';
import * as COMMON from '../tools/CommonConstant';
import { getMenuDataAction } from '@/actions/menuAction';

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
            applyUser: value.value,
        })
    }

    submitClick = (userNameTxt) => {
        this.setState({ loaderState: "active" })
        let userName = window.location ? window.location.pathname.slice(1) : "police";
        let authUserNmae = this.state.applyUser;
        let publicKey1 = "";
        let publicKey2 = "";
        let url = "";
        let userType = "";
        let organization = "";

        let did = "";
        // 生成人员Did
        if (this.props.isUser) {
            // 前端生成公私钥对，传给后端，返回DID
            publicKey1 = "5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw"; //EVE
            publicKey2 = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"; //BOB
            url = "consumer/dids/register";
            userType = "调阅人员";
            organization = "张三";
            did = "diaoyuerenyuanDidzhangsan" + new Date().getTime()
        } else {
            if (userName === "police") {
                publicKey1 = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; //ALICE
                publicKey2 = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"; //BOB
                url = "consumer/dids/register";
                userType = "档案使用方";
                organization = "公安部";
                did = "danganshiyongfangdidgonganbu" + new Date().getTime()
            } else if (userName === "ccb") {
                publicKey1 = "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y"; //CHARLIE
                publicKey2 = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"; //BOB
                url = "producer/dids/register";
                userType = "档案生产方";
                organization = "建设银行办公室";
                did = "dnaganshengchanfangjiansheyinhang" + new Date().getTime()
            } else if (userName === "fintech") {
                publicKey1 = "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy"; //DAVE
                publicKey2 = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"; //BOB 
                url = "admin/dids/register";
                userType = "档案运营方";
                organization = "建信金科";
                did = "dnaganyunyingfangdidjianxinjinke" + new Date().getTime()
            }
        }
        let params = {
            "mainKeyPair": {
                "publicKey": publicKey1 || ""
            },
            "secondKeyPair": {
                "publicKey": publicKey2 || ""
            },
            "userType": userType,
            "organization": organization,
        }
        // http.post(url, params).then((resp) => {
        //     if (resp.data && resp.data.status === 1) {
        let docUrl = "sjhcuioqw4c";
        let docHash = "csadnehfuiernnkj";
        // let did = 'shbeuwoo45670432';


        if (this.props.isUser) {
            // 将所有申请人员存起来
            let operatorArr = JSON.parse(localStorage.getItem("operatorArr"));
            let newOperatorArr = [];
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
            localStorage.setItem("operatorArr", JSON.stringify(newOperatorArr));

            // 将已申请过DId的用户保存起来传给使用方供使用方选择
            let userDidObj = {
                [authUserNmae]: did
            }
            localStorage.setItem('userHasDid' + authUserNmae, JSON.stringify(userDidObj));
        } else {
            //将Did保存在本地
            let orgDidObj = {
                [userNameTxt]: did
            }
            let privateKeyObj = {
                [userNameTxt]: publicKey1
            }
            // 将已申请过DId保存起来,如果有值，页面不会再申请DId
            localStorage.setItem('orgrHasDid' + userName, JSON.stringify(orgDidObj));
            localStorage.setItem('orgrHasPrivateKey' + userName, JSON.stringify(privateKeyObj));
        }

        // 根据公钥获取私钥
        // let privateKeyStr =  keyring.getPair(publicKey1)
        // console.log(JSON.stringify(privateKeyStr));

        // 调用区块链
        useSubstrate.useSubstrateApi((api) => {
            if (!api) { return; }
            const { nonce } = api.query.system.account(publicKey1);
            const operatePair = keyring.getPair(publicKey1);
            const result = api.tx.potModule.register(did, docUrl, docHash);
            console.log(result);
            result.signAndSend(operatePair, { nonce }, ({ events = [], status }) => {
                if (status.isInBlock) {
                    events.forEach(({ event: { data, method, section }, phase }) => {
                        console.log(`${section}.${method}`, data.toString());
                        if (section === 'system' && method === 'ExtrinsicSuccess') {
                            this.setState({
                                loaderState: "disabled",
                                confirmOpen: true,
                                messageContent: "生成成功",
                            })
                        } else if (section === 'system' && method === 'ExtrinsicFailed') {
                            console.log(`${section}.${method}`, data.toString());
                            this.setState({
                                loaderState: "disabled",
                                confirmOpen: true,
                                messageContent: "生成失败",
                            })
                        }

                    })
                }
            }).catch(console.error)

        })


        //     }

        // }).catch((error) => {
        //     console.log(error);
        // })

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
        if (userName === "police") {
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

