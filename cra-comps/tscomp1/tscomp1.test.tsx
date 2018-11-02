import React from 'react';
import ReactDOM from 'react-dom';
import TsComp1 from './tscomp1';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<TsComp1 />, div);
  ReactDOM.unmountComponentAtNode(div);
});