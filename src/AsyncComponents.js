/*
 * @Author: huchongyuan
 * @Date: 2020-06-01 21:56:23
 * @LastEditTime: 2020-06-01 22:05:40
 * @LastEditors: Please set LastEditors
 * @Description: 按需加载组件
 * @FilePath: \substrate-web\src\AsyncComponents.js
 */ 
import React from 'react'

export default function asyncComponents(importComponent){
    return class AsyncComponents extends React.Component{
      constructor(props){
        super(props);
        this.state={
          component:null
        }
      }
      async componentDidMount(){
        const {default:component } = await importComponent();
        this.setState({component})
      }
      render(){
        const C = this.state.component;
        return C ? <C {...this.props} /> : null;
      }
    }
}