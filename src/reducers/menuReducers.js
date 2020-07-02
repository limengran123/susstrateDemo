/*
 * @Author: your name
 * @Date: 2020-06-02 13:57:55
 * @LastEditTime: 2020-06-02 15:01:23
 * @LastEditors: Please set LastEditors
 * @Description:左侧菜单数据
 * @FilePath: \substrate-web\src\reducers\menuReducers.js
 */
import {SET_MENU_DATA, GET_MENU_DATA, GET_USER_DID} from '@/actions/action-types';
const initState={
  menus:sessionStorage.getItem("menus")?JSON.parse(sessionStorage.getItem("menus")):[]
};
// 设置菜单数据的方法;
export default (state=initState,action)=>{
  switch(action.type){
    case SET_MENU_DATA:
      // 持久化存储:
      sessionStorage.setItem("menus",JSON.stringify(action.payload.menus));
      // 执行回调函数:
      if(action.payload && action.payload.callback && typeof action.payload.callback==="function"){
        action.payload.callback();
      }
      return{
        ...state,
        menus:action.payload.menus
      }
    case GET_MENU_DATA:
      return{
        ...state,
        menus:action.payload
      }
      case GET_USER_DID:
      return{
        ...state,
        userDid:action.payload
      }
    default:
      return state  
  }
}

