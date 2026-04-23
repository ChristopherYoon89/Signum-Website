
import React from 'react';
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import RouterApp from './RouterApp';
import { AuthProvider } from './AuthProvider.js';


const root = ReactDOM.createRoot(document.getElementById("home-container"));

root.render(
  <React.StrictMode>
    <ConfigProvider>
      <BrowserRouter>
        <AuthProvider>
          <RouterApp />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);


