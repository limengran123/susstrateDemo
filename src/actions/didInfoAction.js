/*
 * @Author: your name
 * @Date: 2020-06-02 14:38:29
 * @LastEditTime: 2020-06-02 14:40:05
 * @LastEditors: Please set LastEditors
 * @Description: action 统一管理
 * @FilePath: \substrate-web\src\actions\menuAction.js
 */ 
import {GET_USER_DID} from './action-types';

export function getUserDidInfoAction(payload){
  return {
    'type':GET_USER_DID,
    'payload':payload
  }
}


