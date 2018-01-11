import React from 'react';

import {Add} from 'comp1';

import answer from '../oops';

const Comp2 = ({a, b}) =>
  <div>
    Comp2: <Add a={a} b={b} />
    Answer: {answer}
  </div>

export default Comp2;
