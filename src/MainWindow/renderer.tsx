import { Logger } from './services/Log/Logger';
import { Main } from './components/Main/Main';
import React from 'react';
import ReactDOM from 'react-dom';
import { WebHmiFactory } from './services/WebHmi/RendererComponents/WebHmiFactory';

ReactDOM.render(<Main />, document.getElementById('root'));

new WebHmiFactory(new Logger());
