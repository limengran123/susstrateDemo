/*
 * @Author: huchongyuan
 * @Date: 2020-06-01 20:56:39
 * @LastEditTime: 2020-06-02 13:38:05
 * @LastEditors: Please set LastEditors
 * @Description: 路由配置文件
 * @FilePath: \substrate-web\src\router\index.js
 */ 
import asyncComponents from '../AsyncComponents';
const routes=[
  {
    path: '/user',
    component:asyncComponents(()=>import("@/pages/user/UserIndex")),
    children:[
      {
        path:"/user/login",
        name:"login",
        meta:{
          title:"用户登录"
        },
        component:asyncComponents(()=>import("@/pages/user/Login")),
      },
      {
        path:"/user/register",
        meta:{
          title:"用户注册"
        },
        component:asyncComponents(()=>import("@/pages/user/Register")),
      }
    ]
  },
  {
    path:'/police',
    component:asyncComponents(()=>import("@/pages/Home")), 
  },
  {
    path:'/policeUser',
    component:asyncComponents(()=>import("@/pages/Home")), 
  },
  {
    path:'/fintech',
    component:asyncComponents(()=>import("@/pages/Home")), 
  },
  {
    path:'/ccb',
    component:asyncComponents(()=>import("@/pages/Home")), 
  },
  {
    path:'/userLogin',
    component:asyncComponents(()=>import("@/pages/UserLogin")), 
  },
];
export default routes;