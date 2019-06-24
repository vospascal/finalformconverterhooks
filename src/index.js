import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import FinalFormConverterHook from './FinalFormConverterHook';

function App() {
  const test = {
    product1: {
      test: '123',
      color: 'red',
      accountd: {
        accountNumber: '',
      },
    },
    product2: {
      test: '123',
      color: 'green',
      account: {
        accountNumber: '',
      },
      list: [{ name: 'test' }, { name: 'case' }, { name: 'array' }],
    },
  };
  const [mainObj, setMainObj] = useState(test);

  const FinalFormConverterSchema = [
    {
      key: 'accountNumber',
      references: [
        'product1.accountd.accountNumber',
        'product2.account.accountNumber',
        'product3.account.accountNumber',
      ],
    },
    {
      key: 'test',
      references: ['product1.test'],
    },
    {
      key: 'list',
      references: ['product2.list'],
    },
  ];

  const [converted, convertedCallback] = FinalFormConverterHook({
    stateOriginal: mainObj,
    context: mainObj,
    callback: ({ formObject }) => {
      console.log('submitHandler pressed', formObject);
      setMainObj(formObject);
    },
    type: 'aanvraag',
    schema: FinalFormConverterSchema,
  });

  return (
    <div className="App">
      <pre>{JSON.stringify(mainObj, null, 2)}</pre>
      <hr />
      <pre>{JSON.stringify(converted, null, 2)}</pre>
      <p>{converted.accountNumber}</p>
      <p>{converted.test}</p>
      <button
        onClick={e => {
          convertedCallback({
            ...converted,
            list: [{ name: 'a' }, ...converted.list.slice(1)],
          });
        }}
      >
        click1
      </button>
      <button
        onClick={e => {
          convertedCallback({
            ...converted,
            accountNumber: '123456',
            test: 'case',
          });
        }}
      >
        click2
      </button>
      <button
        onClick={e => {
          convertedCallback({
            accountNumber: '7890',
            test: 'array',
            list: [{ name: 'some' }, ...converted.list.slice(1)],
          });
        }}
      >
        click3
      </button>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
