import Web3 from 'web3';


const Web3 = require('web3');
async function main() {

    const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
    const loader = setupLoader({ provider: web3 }).web3;

    const account = web3.eth.accounts.create();
    console.log(account);
}
