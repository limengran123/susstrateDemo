/*
 * @Author: huchongyuan
 * @Date: 2020-06-01 21:05:01
 * @LastEditTime: 2020-06-02 16:51:57
 * @LastEditors: Please set LastEditors
 * @Description: 登录页面,可能暂时不需要
 * @FilePath: \substrate-web\src\pages\Login.js
 */ 
import React from 'react'
import {Button,Form} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {setMenuDataAction} from '@/actions/menuAction';
class Login extends  React.Component{
  constructor(props){
    super(props)
    this.state={
      "username":"",
      "password":""
    };
  }
  handleSubmit=()=>{
    // 获取菜单数据
    const {SET_MENU_DATA,history} = this.props;
    // 调用登录的交易,获取登录后的菜单;
    SET_MENU_DATA({
      "menus":[{"name":"zhangsna1111","age":"1"}],
      "callback":()=>{
          history.push('/');
      }
    })
  }
  handleChange=(e,key)=>{
    this.setState({
      [key]:e.target.value
    })
  }
  render(){
    let {username,password} = this.state;
    return(
      <>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field required={true}>
            <label>用户名称</label>
            <input placeholder='用户名称' value={username} name='username' onChange={(e)=>{this.handleChange(e,'username')}} />
          </Form.Field>
          <Form.Field required={true}>
            <label>用户密码</label>
            <input placeholder='用户密码' value={password} name='password' onChange={(e)=>{this.handleChange(e,'password')}} />
          </Form.Field>
          <Form.Field>
            <Link to="/user/register">注册账号</Link>
          </Form.Field>
          <Button type='submit' primary>提交</Button>
        </Form>  
      </>
    )
  }
}
const mapStateToProps = state=>{
  return state;
}
const mapDispatchToProps=(dispatch) => {
  return {
    'SET_MENU_DATA':(payload)=>{
      dispatch(setMenuDataAction(payload));
    }
  }
}
export default connect(mapStateToProps,mapDispatchToProps)(Login)
