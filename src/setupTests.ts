// jest-dom adds custom Jest matchers.
import '@testing-library/jest-dom';

import { TextDecoder, TextEncoder } from 'util';

// Provide Web Encoding APIs required by React Router 7 in Jest/JSDOM.
Object.defineProperty(globalThis, 'TextEncoder', {
  configurable: true,
  writable: true,
  value: TextEncoder,
});

Object.defineProperty(globalThis, 'TextDecoder', {
  configurable: true,
  writable: true,
  value: TextDecoder,
});