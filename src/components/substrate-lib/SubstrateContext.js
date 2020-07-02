import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';


const PROVIDER_SOCKET = "ws://10.200.3.12:9944";
const CUSTOM_TYPES = {
  "Address": "AccountId",
  "LookupSource": "AccountId"
}
const RPC = {};
const parsedQuery = queryString.parse(window.location.search);
const connectedSocket = parsedQuery.rpc || PROVIDER_SOCKET;
console.log(`Connected socket: ${connectedSocket}`);


const INIT_STATE = {
  socket: connectedSocket,
  types: CUSTOM_TYPES,
  jsonrpc: { ...jsonrpc, ...RPC },
  keyring: null,
  keyringState: null,
  api: null,
  apiState: null
};

const reducer = (state, action) => {
  let socket = null;

  switch (action.type) {
    case 'RESET_SOCKET':
      socket = action.payload || state.socket;
      return { ...state, socket, api: {}, apiState: 'READY' };

    case 'CONNECT':
      return { ...state, api: action.payload, apiState: 'CONNECTING' };

    case 'CONNECT_SUCCESS':
      return { ...state, apiState: 'READY' };

    case 'CONNECT_ERROR':
      return { ...state, apiState: 'ERROR' };

    case 'SET_KEYRING':
      return { ...state, keyring: action.payload, keyringState: 'READY' };

    case 'KEYRING_ERROR':
      return { ...state, keyring: null, keyringState: 'ERROR' };

    default:
      throw new Error(`Unknown type: ${action.type}`);
  }
};


// 它们的父组件上使用React的Context API，在组件外部建立一个Context。
// SubstrateContext.Provider提供了一个Context对象，这个对象是可以被子组件共享的
const SubstrateContext = React.createContext();

const SubstrateContextProvider = (props) => {
  // filtering props and merge with default param value
  const initState = { ...INIT_STATE };
  const neededPropNames = ['socket', 'types'];
  neededPropNames.forEach(key => {
    initState[key] = (typeof props[key] === 'undefined' ? initState[key] : props[key]);
  });
  const [state, dispatch] = useReducer(reducer, initState);

  return (
    <SubstrateContext.Provider value={[state, dispatch]}>
      {props.children}
    </SubstrateContext.Provider>
  );
};

// prop typechecking
SubstrateContextProvider.propTypes = {
  socket: PropTypes.string,
  types: PropTypes.object
};

export { SubstrateContext, SubstrateContextProvider };
