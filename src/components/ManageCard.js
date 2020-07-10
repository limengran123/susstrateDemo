import React from 'react';
import './common.css';
import { connect } from 'react-redux';

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
        let credentialSubjectStr = localStorage.getItem('credentialSubject');
        let credentialSubject = credentialSubjectStr ? JSON.parse(credentialSubjectStr) : {};
        let fileInformation = credentialSubject.fileInformation || {};
        let number = fileInformation.number || "";
        let filetype = fileInformation.fileType || "";
        let initiator = fileInformation.validAgency || "";
        let validdate = fileInformation.validDate;
        let startDate = "";
        let endDate = "";
        if (validdate && validdate.indexOf("~") > -1) {
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

