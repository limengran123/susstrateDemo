/*
 * @Author: your name
 * @Date: 2020-06-02 13:17:35
 * @LastEditTime: 2020-06-02 13:33:44
 * @LastEditors: Please set LastEditors
 * @Description:登录页面和注册页面的公共页面.
 * @FilePath: \substrate-web\src\pages\user\UserIndex.js
 */ 
import React from 'react';
import { renderRoutes } from 'react-router-config'
export default class UserIndex extends React.Component{
  constructor(props){
    super(props)
    this.state={};
  }
  render(){
    return(
      <>
        {renderRoutes(this.props.route.children)}
      </>
    )
  }
}