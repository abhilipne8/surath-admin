import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import store from './store/store.js';
import { Provider } from 'react-redux';
import { HMSRoomProvider } from '@100mslive/react-sdk';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <HMSRoomProvider>
        <App />
      </HMSRoomProvider>
    </Provider>
  </BrowserRouter>
);
