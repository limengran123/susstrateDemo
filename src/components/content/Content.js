/*
 * @Author: your name
 * @Date: 2020-06-02 10:27:36
 * @LastEditTime: 2020-06-02 15:03:42
 * @LastEditors: Please set LastEditors
 * @Description: 侧边栏菜单
 * @FilePath: \substrate-web\src\components\SideBar.js
 */
import React from 'react';
import './Content.css';
import ApplyAuthorization from '@/components/ApplyAuthorization';
import ApplyList from '@/components/ApplyList';
import ApprovalList from '@/components/ApprovalList';
import UserApply from '@/components/UserApply';
import ApplyResult from '@/components/ApplyResult';
import ManageCard from '@/components/ManageCard';
import DidApply from '@/components/DidApply';
import DocUpload from '@/components/DocUpload';

const MENUDATA = {
  APPLY_AUTOORTZATION: "申请授权",
  APPLY_REVIEW: "申请审核",
  APPROVAL_REVIEW: "调阅审批",
  DOC_UPLOAD: "档案上传",
  APPLY_CALL: "申请调用",
  CALL_RESULT: "调用结果",
  AUTOORTZATION_MANAGER: "授权书管理",
  DID_APPLY: "DID生成",
  USER_APPLY_DID: "调用人员DID生成"
}

export default class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }


  render() {
    const menuData = this.props.menuData;
    switch (menuData) {
      case MENUDATA.APPLY_AUTOORTZATION:
        return (<ApplyAuthorization />)
      case MENUDATA.APPLY_REVIEW:
        return (<ApplyList />)
      case MENUDATA.APPROVAL_REVIEW:
        return (<ApprovalList />)
      case MENUDATA.DOC_UPLOAD:
        return (<DocUpload />)
      case MENUDATA.APPLY_CALL:
        return (<UserApply />)
      case MENUDATA.CALL_RESULT:
        return (<ApplyResult />)
      case MENUDATA.AUTOORTZATION_MANAGER:
        return (<ManageCard />)
      case MENUDATA.DID_APPLY:
        return (<DidApply isUser={false} />)
      case MENUDATA.USER_APPLY_DID:
        return (<DidApply isUser={true} />)
      default:
        return (<div></div>)
    }
  }
}


