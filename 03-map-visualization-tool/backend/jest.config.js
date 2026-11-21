const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/../data-processing', '<rootDir>/../visualization', '<rootDir>/../tests'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  moduleDirectories: ['node_modules', path.join(__dirname, 'node_modules')],
  moduleFileExtensions: ['ts', 'js', 'json'],
};
