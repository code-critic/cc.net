"use strict";
exports.__esModule = true;
var foo_1 = require("./foo");
var process = require('process');
console.log({ foo: foo_1.foo });
var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});
rl.on('line', function (line) {
    for (var i = 0; i < +line; i++)
        console.log('Hello world!');
});
