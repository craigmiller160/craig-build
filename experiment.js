/* eslint-disable */
const fs = require('fs');
const path = require('path');

const thePath = path.join('/Users', 'craigmiller', 'hello2.txt');
fs.writeFileSync(thePath, 'Hello World ' + new Date().toISOString());