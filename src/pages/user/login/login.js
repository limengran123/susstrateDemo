import React from 'react';
import {Button,Form} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {handleSubmit,handleChange} from './action';
class Login extends React.Component{
   render(){
     const {
       username,
       password,
       handleChange,
       handleSubmit
      } = this.props;
     return(
      <Form onSubmit={handleSubmit}>
      <Form.Field required={true}>
        <label>用户名称</label>
        <input placeholder='用户名称' value={username} name='username' onChange={(e)=>{handleChange('username',e.target.value)}} />
      </Form.Field>
      <Form.Field required={true}>
        <label>用户密码</label>
        <input placeholder='用户密码' value={password} name='password' onChange={(e)=>{handleChange('password',e.target.value)}} />
      </Form.Field>
      <Form.Field>
        <Link to="/user/register">注册账号</Link>
      </Form.Field>
      <Button type='submit' primary>提交</Button>
    </Form> 
     )
   }
}
const mapStateToProps = state => {
  return {
    ...state
  }
}
const mapDispatchToProps = dispatch => {
  return{
    "handleSubmit":()=>{
      dispatch(handleSubmit())
    },
    "handleChange":(key,value)=>{
      dispatch(handleChange({key,value}))
    }
  }
}
export default connect(mapStateToProps,mapDispatchToProps)(Login);