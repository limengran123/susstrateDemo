/*
 * @Author: your name
 * @Date: 2020-06-01 21:05:08
 * @LastEditTime: 2020-06-02 14:28:45
 * @LastEditors: Please set LastEditors
 * @Description:首页
 * @FilePath: \substrate-web\src\pages\Home.js
 */
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import $ from 'jquery';
import "./Home.css";

class Overview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userRoleArr: ['公安部系统', '建行系统', '云档案产品'],
            systemArr: [
                ['公安部档案调阅人力系统', '公安部档案调阅申请系统', '公安部档案调阅执行系统'],
                ['建设银行档案调阅审批系统'],
                ['建信金科云档案产品']
            ]
        }
    }

    itemClick = (item) => {
        const systemPathObj = {
            '公安部档案调阅人力系统': '/didRegister',
            '公安部档案调阅申请系统': '/police',
            '公安部档案调阅执行系统': '/userLogin',
            '建设银行档案调阅审批系统': '/ccb',
            '建信金科云档案产品': '/fintech',
        }
        // window.location.pathname = systemPathObj[item]
        window.open(systemPathObj[item], '_blank')
    }


    render() {
        return (
            <div id="overview">
                <header className="header">
                    <h4 className="overviewHeaderText">
                        区块链电子档案调阅——多系统切换页
                    </h4>
                </header>
                <div className="overviewContent">
                    {this.state.userRoleArr.map((item, key) => {
                        return (<div className="contentRow" key={key}>
                            <h4>{item}</h4>
                            <div>
                                {this.state.systemArr[key].map((systemItem, key) => {
                                    return (<div className="contentCol" key={key} onClick={this.itemClick.bind(this, systemItem)}>
                                        <h4 className="contentColText">{systemItem}</h4>
                                    </div>)
                                })}
                            </div>
                        </div>)
                    })}
                </div>
            </div>
        )
    }
}
const mapStateToProps = state => {
    return {
    }
}

const mapDispatchToProps = (dispatch) => {
    return {

    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Overview)