/*
 * @Author: your name
 * @Date: 2020-06-02 14:38:29
 * @LastEditTime: 2020-06-02 14:40:05
 * @LastEditors: Please set LastEditors
 * @Description: action 统一管理
 * @FilePath: \substrate-web\src\actions\menuAction.js
 */ 
import {SET_MENU_DATA, GET_MENU_DATA } from './action-types';
export function setMenuDataAction(payload){
  return {
    'type':SET_MENU_DATA,
    'payload':payload
  }
}

export function getMenuDataAction(payload){
  return {
    'type':GET_MENU_DATA,
    'payload':payload
  }
}



