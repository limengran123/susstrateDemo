/*
 * @Author: your name
 * @Date: 2020-06-01 16:44:37
 * @LastEditTime: 2020-06-02 14:13:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \substrate-web\src\index.js
 */ 
import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
// 日志中间件;
// import createLogger from 'redux-logger';
// 异步action中间件;
// import thunk from 'redux-thunk'; //导入thunk
// 全量的自定义reducer;
import reducers from '@/reducers';

import App from './App';
// import * as serviceWorker from './serviceWorker';
import 'semantic-ui-css/semantic.min.css';
// redux 日志
// const logger = createLogger();

// const store = createStore(reducers,applyMiddleware(thunk,logger));
const store =createStore(reducers);

ReactDOM.render(
  <Provider store={store}>
      <App />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
