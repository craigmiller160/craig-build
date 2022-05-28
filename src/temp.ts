/* eslint-disable */
import fs from 'fs';
import path from 'path';

const thePath = path.join('/Users', 'craigmiller', 'hello.txt');
fs.writeFileSync(thePath, 'Hello World');