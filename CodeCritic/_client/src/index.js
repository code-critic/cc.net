import 'font-awesome/css/font-awesome.min.css';
import 'react-notifications/lib/notifications.css';
import './styles/index.css';
import './styles/table.css';
import './styles/diff.css';
import './styles/highlight.css';
import './styles/code-editor.css';
import './styles/solution-result-view.css';

import App from './App';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './_old/registerServiceWorker';

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const rootElement = document.getElementById('root');

ReactDOM.render(
  <BrowserRouter basename={baseUrl}>
    <App />
  </BrowserRouter>,
  rootElement);

registerServiceWorker();

