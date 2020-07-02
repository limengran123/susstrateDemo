
export const LOGIN_SUBMIT = 'LOGIN_SUBMIT';
export const FILED_CHANGE = 'FILED_CHANGE';
export async function request(){
  
}
// 登录表单提交的action;
export const handleSubmit =(payload)=>{
  return {
    type:LOGIN_SUBMIT,
    payload
  }
}
// 双向数据绑定;
export const handleChange =(payload)=>{
  return {
    type:FILED_CHANGE,
    payload
  }
}