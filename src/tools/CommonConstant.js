import { u8aToHex } from '@polkadot/util';
const _utilCrypto = require("@polkadot/util-crypto");

const testKeyring = require('@polkadot/keyring/testing');
const keyring = testKeyring.default();

export const ORG_TO_USERNAME = {
    "police": '公安部',
    "ccb": '建设银行办公室',
    "fintech": "建信金科",
}

export const menuItemObj = {
    "police": ["申请授权"],
    "ccb": ["申请审核"],
    "fintech": ["调阅审批", "档案上传"],
    "policeUser": ["申请调用", "调用结果", "授权书管理"],
}

export const URL_TO_NAME = {
    "police": "consumer/dids/",
    "ccb": "producer/dids/",
    "fintech": "admin/dids/",
    "policeUser": "consumer/dids/",
}


export const ACCOUNT_TO_USER = {
    "police": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", //ALICE
    "ccb": "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y", //CHARLIE
    "fintech": "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy", //DAVE
}

export const ACCOUNT_SECONDARY = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"; //BOB 

export const USER_TYPE = {
    "police": "档案使用方",
    "ccb": "档案生产方",
    "fintech": "档案运营方",
}


export const getallPairs = (seed) => {
    const keypair = {
        ecdsa: () => (0, _utilCrypto.secp256k1KeypairFromSeed)(seed),
        ed25519: () => (0, _utilCrypto.naclKeypairFromSeed)(seed),
        sr25519: () => (0, _utilCrypto.schnorrkelKeypairFromSeed)(seed)
    }["ed25519"]();
    return keypair;
}

//签名
const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });
const signature = alice.sign(alice.publicKey);
console.log(u8aToHex(signature));