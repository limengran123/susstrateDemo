import React from 'react';
import './common.css';
import { connect } from 'react-redux';
import http from '../service/httpRequest.js';

const Keyring = require('@polkadot/keyring').default;
const stringToU8a = require('@polkadot/util/string/toU8a').default;
const ALICE_SEED = 'zhangsan'.padEnd(32, ' ');
const keyring = new Keyring();

// 创建钥对并将Alice添加到keyring pair字典中（带有帐户种子）
const pairAlice = keyring.addFromSeed(stringToU8a(ALICE_SEED));
const aa = keyring.getPair(pairAlice.address);
const bb = (keyring.getPair(pairAlice.address));
const publicKey = keyring.decodeAddress(pairAlice.address); //公钥

console.log(pairAlice);
console.log(aa);
console.log(bb);
console.log(publicKey);



class ManageCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            number: "",
            filetype: "",
            initiator: "",
            startDate: "",
            endDate: "",
        }
    }

    componentDidMount() {
        let fileinforStr = localStorage.getItem('fileinformation');
        let fileinformation = fileinforStr ? JSON.parse(fileinforStr) : {};
        let number = fileinformation.number || "";
        let filetype = fileinformation.filetype || "";
        let initiator = fileinformation.initiator || "";
        let validdate = fileinformation.validdate || "";
        let startDate = "";
        let endDate = "";
        if (validdate.indexOf("~") > -1) {
            startDate = validdate.split("~")[0];
            endDate = validdate.split("~")[1];
        }

        this.setState({
            number: number,
            filetype: filetype,
            initiator: initiator,
            startDate: startDate,
            endDate: endDate,
        })
    }

    render() {

        return (
            <div id="manage">
                <h4 className="manageTip">有效授权书（有效期一个月）</h4>
                <div id="manageCard">
                    <h4 className="manageTitle">建设银行公司部档案信息调用</h4>
                    <div>
                        <span>调用客户编号:</span>
                        <span>{this.state.number}</span>
                    </div>
                    <div>
                        <span>档案类型:</span>
                        <span>{this.state.filetype}</span>
                    </div>
                    <div>
                        <span>调用日期:</span>
                        <span>{this.state.startDate}</span>
                    </div>
                    <div>
                        <span>调用机构范围:</span>
                        <span>{this.state.initiator}</span>
                    </div>
                    <div>
                        <span>失效日期:</span>
                        <span>{this.state.endDate}</span>
                    </div>
                </div>
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


export default connect(mapStateToProps, mapDispatchToProps)(ManageCard)

