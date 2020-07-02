/*
 * @Author: your name
 * @Date: 2020-06-01 16:44:37
 * @LastEditTime: 2020-06-02 12:57:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \substrate-web\src\App.js
 */
import React from 'react';
import { renderRoutes } from 'react-router-config';
import { BrowserRouter, Switch } from 'react-router-dom';
import routes from './router';
import './App.css'


function App() {
  return (
      <div className="App">
        <BrowserRouter>
          <Switch>{renderRoutes(routes)}</Switch>
        </BrowserRouter>
      </div>

  );
}
export default App;
