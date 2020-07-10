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

class UserLogin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isCancelShow: false,
            fileString: "",
            credentialSubject: {},
            fileName: "",
        }
    }


    componentDidMount() {
        let fileName = localStorage.getItem('fileName');
        if (fileName) {
            let credentialSubjectStr = localStorage.getItem('credentialSubject');
            let credentialSubject = credentialSubjectStr ? JSON.parse(credentialSubjectStr) : {};
            $("#xFile").css('display', 'none');
            this.setState({
                fileName: fileName,
                isCancelShow: true,
                credentialSubject: credentialSubject,
            })
        } else {
            $("#xFile").css('display', 'inline-block');
            this.setState({
                isCancelShow: false,
            })
        }
    }

    fileChange = (e) => {
        $("#xFile").css('display', 'none');
        let files = e.target.files; // 获取上传的文件集合
        if (files) {
            this.setState({
                isCancelShow: true,
            })
        }
        let file = files[0]; // 获取第一个文件
        let reader = new FileReader();//新建一个FileReader
        reader.readAsText(file, "UTF-8");//读取文件

        reader.onload = (evt) => { //读取完文件之后会回来这里
            let fileString = evt.target.result; // 读取文件内容
            let fileData = fileString ? JSON.parse(fileString) : {};
            let credentialSubject = fileData.claims ? fileData.claims[0].credentialSubject[0] : {};
            this.setState({
                fileString: fileString,
                credentialSubject: credentialSubject,
                fileName: credentialSubject.longDescription,
            })
        }

    }

    submitClick = () => {
        let credentialSubject = this.state.credentialSubject;
        localStorage.setItem('credentialSubject', JSON.stringify(credentialSubject));
        localStorage.setItem('fileName', this.state.fileName);
        localStorage.setItem('fileString', this.state.fileString);
        window.location.pathname = "/policeUser";
    }

    cancelClick = () => {
        $("#xFile").css('display', 'inline-block');
        document.getElementById("xFile").value = "";
        this.setState({
            isCancelShow: false,
            fileName: "",
        })
    }

    render() {
        return (
            <div id="userLogin">
                <header className="header">
                    <img className="userLoginLogo" src="../image/policelogo.png" alt=""></img>
                    <h4 className="logoTitle" >公安部业务系统</h4>
                </header>
                <div id="userLoginContent">
                    <div className="userLoginContentTitle">
                        <span>用户类型：</span>
                        <span>指派调用人员</span>
                    </div>
                    <div>
                        <label>电子授权选择：</label>
                        <input type="file" id="xFile" accept=".json,application/json,JavaScript Object Notation" onChange={this.fileChange} ref="fileInput" />
                        <label>{this.state.fileName}</label>
                    </div>
                    <div className="buttonArr">
                        <Button className="ui button" id="cancalButton" onClick={this.cancelClick} style={{ 'display': this.state.isCancelShow ? 'inline-block' : 'none' }}>撤销</Button>
                        <Button primary onClick={this.submitClick} className="submitButton">提交</Button>
                    </div>
                </div>
            </div>
        )
    }
}
const mapStateToProps = state => {
    return {
        // menus: state.menuReducers.menus
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(UserLogin)