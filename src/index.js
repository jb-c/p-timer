import React from 'react';
import ReactDOM from 'react-dom';

import Timer from './timer'


// import 'bootstrap/dist/css/bootstrap.css';
// import 'bootstrap/dist/css/bootstrap-theme.css';

ReactDOM.render(
  <Timer initialTime="0"/>
,document.getElementById('timer'));