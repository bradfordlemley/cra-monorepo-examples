import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import {Add, Subtract} from 'comp1';
import Comp2 from 'comp2';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">CRA-App3</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <Add a={1} b={1} />
        <Subtract a={1} b={1} />
        <Comp2 a={1} b={1} />
      </div>
    );
  }
}

export default App;
