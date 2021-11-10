import { foo } from './foo';
const process = require('process');

console.log({ foo });

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
    for (let i = 0; i < +line; i++) console.log('Hello world!')
})