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
            validdate: "",
            dateRange: "",
        }
    }

    componentDidMount() {
        let fileString = localStorage.getItem('fileString');
        let fileObj = fileString ? JSON.parse(fileString) : {};
        let credentialSubject = fileObj.claims ? fileObj.claims[0].credentialSubject[0] : {};
        let fileInformation = credentialSubject.fileInformation || {};
        let number = fileInformation.number || "";
        let filetype = fileInformation.fileType || "";
        let initiator = fileInformation.validAgency || "";
        let validdate = fileInformation.validDate;
        let issuanceDate = fileObj.claims[0].issuanceDate || "";
        let overDate = issuanceDate ?  new Date(issuanceDate).getTime() + 30 * 24 * 3600 * 1000 : "";
        let dateRangeYear = overDate ? new Date(overDate).getFullYear() : "";
        let dateRangeMonth = overDate ? new Date(overDate).getMonth() + 1 : "";
        dateRangeMonth = dateRangeMonth < 10 ? "0" + dateRangeMonth : dateRangeMonth;
        let dateRangeDate = overDate ? new Date(overDate).getDate() : "";
        dateRangeDate = dateRangeDate < 10 ? "0" + dateRangeDate : dateRangeDate;
        let dateRange = issuanceDate ? dateRangeYear + "-" + dateRangeMonth +  "-" + dateRangeDate : "";
        this.setState({
            number: number,
            filetype: filetype,
            initiator: initiator,
            validdate: validdate,
            dateRange: dateRange
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
                        <span>{this.state.validdate}</span>
                    </div>
                    <div>
                        <span>调用机构范围:</span>
                        <span>{this.state.initiator}</span>
                    </div>
                    <div>
                        <span>失效日期:</span>
                        <span>{this.state.dateRange}</span>
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

