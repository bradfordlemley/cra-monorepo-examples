import React, { Component } from 'react';
import logo from './logo.svg';
import Comp2 from 'comp2';
import TsComp1 from 'tscomp1/tscomp1';
import './App.css';
import IntComp1 from './comp1';

const MyData = {
  a: "A",
  b: "B",
};

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <p>{MyData.a} {MyData.b}</p>
          <IntComp1 />
          <TsComp1 />
          <Comp2 a="myA" b="myB" />
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
