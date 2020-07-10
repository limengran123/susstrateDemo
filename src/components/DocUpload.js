import React from 'react';
import './common.css';
import { Form, Confirm, Button, Select, Loader } from 'semantic-ui-react';
import { connect } from 'react-redux';
import $ from 'jquery';
import http from '../service/httpRequest';
import * as COMMON from '../tools/CommonConstant';
import useSubstrate from '../service/userSubstrateRequest.js';

const testKeyring = require('@polkadot/keyring/testing');
const keyring = testKeyring.default();

class DocUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaderState: "disabled",
            confirmOpen: false,
            confirmContent: "",
            producerOptions: [{ key: 0, value: 0, text: "建设银行办公室" }],
            producer: "",
            docNameArr: [],
            fileList: [],
            num: "",
            numMessage: "",
            docTypeOption: [{ key: 0, value: 0, text: "文书档案" }],
            docType: "",
            date: "",
            rangeOptions: [
                { key: 0, value: 0, text: "建设银行上海浦东南路支行" },
                { key: 1, value: 1, text: "建设银行武汉金地城支行" },
                { key: 2, value: 2, text: "建设银行武汉经济技术开发区支行" },
                { key: 3, value: 3, text: "建设银行武汉江堤中路高龙支行" },
                { key: 4, value: 4, text: "建设银行武汉利济北路支行" },
            ],
            range: "",
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

    handleProduChange = (e, value) => {
        this.setState({
            producer: value.value,
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

    handleDocTypeChange = (node, value) => {
        this.setState({
            docType: value.value,
        })
    }

    handleStartDateChange = () => {
        this.setState({
            date: this.refs.dateInput.value,
        })
    }
    handleRangeChange = (node, value) => {
        this.setState({
            range: value.value,
        })
    }


    cancelClick = () => {
        this.setState({
            producer: "",
            num: "",
            docType: "",
            date: "",
            range: "",
        })
    }


    addDoc = () => {
        $("#addFile").click();
    }

    fileChange = (e) => {
        let docNameArr = this.state.docNameArr;
        let fileList = this.state.fileList;
        let files = e.target.files; // 获取上传的文件集合
        if (files) {
            let file = files[0];
            let name = file.name
            docNameArr.push(name);
            fileList.push(file);
            this.setState({
                docNameArr: docNameArr,
                fileList: fileList,
            });
        }

    }

    deleteDoc = (index) => {
        document.getElementById("addFile").value = "";
        let docNameArr = this.state.docNameArr;
        let fileList = this.state.fileList;
        docNameArr.splice(index, 1);
        fileList.splice(index, 1);
        this.setState({
            docNameArr: docNameArr,
            fileList: fileList,
        });

    }

    submitClick = () => {
        this.setState({ loaderState: "active" })
        let range = this.state.range > 0 || (!this.state.range && this.state.range === 0);
        let producer = this.state.producer > 0 || (!this.state.producer && this.state.producer === 0);
        let docType = this.state.docType > 0 || (!this.state.docType && this.state.docType === 0);
        if (!this.state.num || !this.state.date || !range || !producer || !docType) {
            this.setState({
                loaderState: "disabled",
                confirmOpen: true,
                confirmContent: "每项都为必填项，请检查是否填写完整",
            })
            return;
        }
        let paramsData = new FormData();
        paramsData.append("callOrgRange", this.state.rangeOptions[this.state.range].text);
        paramsData.append("producerName", this.state.producerOptions[this.state.producer].text);
        paramsData.append("customerNo", this.state.num);
        paramsData.append("docType", this.state.docTypeOption[this.state.docType].text);
        paramsData.append("docCreationDate", this.state.date);
        let fileList = this.state.fileList;
        for (var i = 0; i < fileList.length; i++) {
            paramsData.append("files", fileList[i]);
        }
        let headers = { headers: { "Content-Type": "multipart/form-data" } }
        http.post("admin/docs/uploader", paramsData, headers).then((resp) => {
            if (resp.data && resp.data.status === 1) {
                let fileList = resp.data.data ? resp.data.data.fileList : [];
                this.setArchiveData(fileList);
            } else {
                this.setState({
                    loaderState: "disabled",
                    confirmOpen: true,
                    confirmContent: "上传失败，失败原因：" + resp.data.msg,
                })
            }
        })
    }

    setArchiveData = (fileList) => {
        let windowName = window.location ? window.location.pathname.slice(1) : "police";
        let account = COMMON.ACCOUNT_TO_USER[windowName];
        return new Promise(function (resolve, reject) {
            useSubstrate.useSubstrateApi((api) => {
                (async function () {
                    if (!api) { return; }
                    let { nonce } = await api.query.system.account(account);
                    for (var i = 0; i < fileList.length; i++) {
                        const filName = fileList[i].fileName;
                        const resp = api.tx.potModule.setArchive(fileList[i].id, fileList[i].fileHash, fileList[i].ipfsUrl);
                        resp.signAndSend(keyring.getPair(account), { nonce }, ({ events = [], status }) => {
                            if (status.isInBlock) {
                                events.forEach(({ event: { data, method, section }, phase }) => {
                                    if (section === 'system' && method === 'ExtrinsicSuccess') {
                                        // resolve([true, filName]);
                                        resolve(this.setState({
                                            loaderState: "disabled",
                                            confirmOpen: true,
                                            confirmContent: filName + "上传成功",
                                        }));
                                    } else if (section === 'system' && method === 'ExtrinsicFailed') {
                                        const [error, info] = data;
                                        if (error.isModule) {
                                            const decoded = api.registry.findMetaError(error.asModule);
                                            const { documentation, name, section } = decoded;
                                            resolve(this.setState({
                                                loaderState: "disabled",
                                                confirmOpen: true,
                                                confirmContent: filName + "上传失败，失败原因：" + name,
                                            }));
                                        }

                                    }
                                });
                            }
                        }).catch(console.error);
                        nonce = parseInt(nonce) + 1;
                    }
                })();
            })
        })
    }

    render() {
        const docNameArr = this.state.docNameArr;
        return (
            <div className="applyDiv" >
                <div>
                    <div id="uploadDocForm">
                        <div className="authorization">
                            <label className="applyLabel">档案生产方：</label>
                            <Select required options={this.state.producerOptions} onChange={this.handleProduChange} value={this.state.producer} />
                        </div>
                        <div>
                            <label className="applyLabel">调档案客户编号：</label>
                            <Form.Input className="applyWork" fluid maxLength="50" onChange={this.handleNumChange} value={this.state.num} />
                            <label className="errorTip">{this.state.numMessage}</label>
                        </div>
                        <div className="authorization">
                            <label className="applyLabel">档案类型：</label>
                            <Select required options={this.state.docTypeOption} onChange={this.handleDocTypeChange} value={this.state.docType} />
                        </div>
                        <div className="authorization">
                            <label className="applyLabel">档案生成日期：</label>
                            <input className="applyUser" type="date" name="" value={this.state.date} onChange={this.handleStartDateChange} ref="dateInput" />
                        </div>
                        <div className="authorization">
                            <label className="applyLabel">调用机构范围：</label>
                            <Select required options={this.state.rangeOptions} onChange={this.handleRangeChange} value={this.state.range} />
                        </div>
                    </div>
                    <div className="uploadDoc">
                        <div className="uploadDocTitle">档案附件上传</div>
                        <div className="uploadDocTxt">
                            {docNameArr.map((item, key) => {
                                return (<div key={key}>
                                    <div className="docName" >{item}</div>
                                    <div className="deleteDoc" onClick={this.deleteDoc.bind(this, key)}>删除</div>
                                </div>)
                            })}
                        </div>
                        <div className="addButton" onClick={this.addDoc}>
                            <input type="file" id="addFile" style={{ 'display': 'none' }} onChange={this.fileChange} multiple="multiple" />
                            增加档案
                        </div>
                    </div>
                    <div id="buttonOperate">
                        <Button className="ui button" id="clearButton" onClick={this.cancelClick}>清空</Button>
                        <Button primary onClick={this.submitClick} className="submitButton">上传</Button>
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

export default connect(mapStateToProps, mapDispatchToProps)(DocUpload)

