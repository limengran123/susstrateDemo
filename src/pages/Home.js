/*
 * @Author: your name
 * @Date: 2020-06-01 21:05:08
 * @LastEditTime: 2020-06-02 14:28:45
 * @LastEditors: Please set LastEditors
 * @Description:首页
 * @FilePath: \substrate-web\src\pages\Home.js
 */
import React from 'react';
import LeftMenu from '@/components/menu/LeftMenu';
import Content from '@/components/content/Content';
import { connect } from 'react-redux';
import { Button, Confirm, Loader } from 'semantic-ui-react';
import "./Home.css";
import http from '../service/httpRequest.js';
import * as COMMON from '../tools/CommonConstant';
import useSubstrate from '../service/userSubstrateRequest.js';
import { u8aToString } from '@polkadot/util';

const testKeyring = require('@polkadot/keyring/testing');
const keyring = testKeyring.default();

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowDidInfo: false,
      userDid: "",
      userLoginName: '',
      askUserDidUrl: '',
      userType: "",
      organization: "",
      creationDate: "",
      confirmOpen: false,
      messageContent: "",
      loaderState: 'disabled',
    }
  }

  componentDidMount() {
    let userName = window.location ? window.location.pathname.slice(1) : "police";
    let credentialSubjectStr = localStorage.getItem('credentialSubject');
    let credentialSubject = credentialSubjectStr ? JSON.parse(credentialSubjectStr) : {};
    let fileInformation = credentialSubject.fileInformation || {};
    let name = fileInformation.name || "";
    let loginName = "";
    if (userName === "policeUser") {
      loginName = name;
    } else {
      loginName = COMMON.ORG_TO_USERNAME[userName];
    }

    this.setState({
      userLoginName: loginName,
    })

  }

  userClick = () => {
    this.setState({
      loaderState: 'active',
    })
    let credentialSubjectStr = localStorage.getItem('credentialSubject');
    let credentialSubject = credentialSubjectStr ? JSON.parse(credentialSubjectStr) : {};
    let fileInformation = credentialSubject.fileInformation || {};
    let name = fileInformation.name || "";
    let userName = window.location ? window.location.pathname.slice(1) : "police";
    let orgDidStr;
    let userDid = "";
    if (userName === "policeUser") {
      orgDidStr = localStorage.getItem('userHasDid' + name);
    } else {
      orgDidStr = localStorage.getItem('orgrHasDid' + userName);
    }
    let orgDidObj = orgDidStr ? JSON.parse(orgDidStr) : {};
    if (userName === "policeUser") {
      userDid = orgDidObj[name];
    } else {
      userDid = orgDidObj[this.state.userLoginName];
    }
    let docUrl = "";
    useSubstrate.useSubstrateApi((api) => {
      if (!api) { return; }
      api.query.potModule.didDoc(userDid, (resp) => {
        docUrl = resp[0];

        let userType = "";
        let organization = "";
        let creationDate = "";
        let httpDidUrl = COMMON.URL_TO_NAME[userName] + u8aToString(docUrl);
        http.get(httpDidUrl).then((resp) => {
          if (resp.data && resp.data.status === 1) {
            let result = resp.data.data ? resp.data.data : {};
            userType = result.userType || "";
            organization = result.organization || "";
            creationDate = result.creationDate || "";
            this.setState({
              loaderState: 'disabled',
              userDid: userDid,
              userType: userType,
              organization: organization,
              creationDate: creationDate,
            })
          } else {
            this.setState({
              loaderState: 'disabled',
              userDid: userDid,
              confirmOpen: true,
              messageContent: resp.data.msg,
            })
          }
        })
      });

    }
    )

    this.setState({
      isShowDidInfo: true,
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

  backClick = () => {
    this.setState({ isShowDidInfo: false })
  }

  render() {
    let userName = window.location ? window.location.pathname.slice(1) : "police";
    const userNameSystem = {
      "police": "公安部业务系统",
      "didRegister": "公安部业务系统",
      "policeUser": "公安部业务系统",
      "ccb": "建设银行业务系统",
      "fintech": "云档案产品"
    };
    const userImg = {
      "fintech": "../image/fintechlogo.png",
      "ccb": "../image/ccblogo.png",
      "police": "../image/policelogo.png",
      "didRegister": "../image/policelogo.png",
      "policeUser": "../image/policelogo.png",
    };
    return (
      <div className="Home">
        <header className="header">
          <img className={userName} src={userImg[userName]} alt=""></img>
          <h4 className={userName + "text"}>{userNameSystem[userName]}</h4>
          <div className="userLogo" onClick={this.userClick}>
            <div className="logoRadio"> </div>
            <div className="logoUserName">{this.state.userLoginName}</div>
          </div>
        </header>
        <div id="contentBody">
          <div id="menuData" className="leftMenu" style={{ 'display': this.state.isShowDidInfo ? 'none' : "inline-flex" }}>
            <LeftMenu menuTagData={this.props.menus} user={userName} />
          </div>
          {this.state.isShowDidInfo ?
            <div className="didInfo">
              <div>
                <span className='didTitle'>DID：</span>
                <span>{this.state.userDid}</span>
              </div>
              <div>
                <span className='didTitle'>机构类型：</span>
                <span>{this.state.userType}</span>
              </div>
              <div>
                <span className='didTitle'>机构名称：</span>
                <span>{this.state.organization}</span>
              </div>
              <div>
                <span className='didTitle'>创建时间：</span>
                <span>{this.state.creationDate}</span>
              </div>
              <Button primary id="backButton" onClick={this.backClick}>返回</Button>
            </div> :
            <div className="content">
              <Content menuData={this.props.menus} user={userName} />
            </div>}
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
  return {
    menus: state.menuReducers.menus,
    userDid: state.menuReducers.userDid,
  }
}

export default connect(mapStateToProps)(Home)