import queryString from 'query-string';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';

const PROVIDER_SOCKET = "ws://10.200.3.12:9944";
const CUSTOM_TYPES = {
    "Address": "AccountId", 
    "LookupSource": "AccountId",
    "Did": "Vec<u8>",
    "ArchId": "Vec<u8>",
    "DocHash": "Vec<u8>",
    "DocUrl": "Vec<u8>",
    "Data": "Vec<u8>",
    "DocState": {
        "_enum": [
            "UnVerified",
            "Authentic",
            "Fake"
        ]
    },
    "AuthState": "u8",
    "UserRole": "u8"
}
const RPC = {};
const parsedQuery = queryString.parse(window.location.search);
const connectedSocket = parsedQuery.rpc || PROVIDER_SOCKET;
const newJsonrpc = { ...jsonrpc, ...RPC };

var useSubstrateApi = ((callback) => {
    const provider = new WsProvider(connectedSocket);
    const api = new ApiPromise({ provider, types: CUSTOM_TYPES, rpc: newJsonrpc });
    api.on('connected', () => {
        api.isReady.then((api) => {
            try {
                callback(api);
            } catch (error) {
                console.error('Unable to load chain', error);
            }
        });
    });
});



var useKeyring = ((callback) => {
    try {
        web3Enable("substrate-front-end-tutorial");
        let allAccounts = web3Accounts();
        allAccounts = allAccounts.map(({ address, meta }) =>
            ({ address, meta: { ...meta, name: `${meta.name} (${meta.source})` } }));

        keyring.loadAll({ isDevelopment: true }, allAccounts);
        callback(keyring);
    } catch (e) {
        console.error(e);
        callback(keyring);
    }

})

export default { useSubstrateApi, useKeyring };