import { matchers as decodeMatchers } from '@relmify/jest-fp-ts/dist/decodeMatchers/index.js';
import { matchers as eitherMatchers } from '@relmify/jest-fp-ts/dist/eitherMatchers/index.js';
import { matchers as optionMatchers } from '@relmify/jest-fp-ts/dist/optionMatchers/index.js';
import { matchers as theseMatchers } from '@relmify/jest-fp-ts/dist/theseMatchers/index.js';
import { matchers as eitherOrTheseMatchers } from '@relmify/jest-fp-ts/dist/eitherOrTheseMatchers/index.js';
import { expect } from 'vitest';

expect.extend(decodeMatchers);
expect.extend(eitherMatchers);
expect.extend(optionMatchers);
expect.extend(theseMatchers);
expect.extend(eitherOrTheseMatchers);
