import type { Config } from 'jest';

if (!process.env.CONFIG_PATH) {
  // required for e2e tests
  process.env.CONFIG_PATH = '.env.test';
}

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.(spec|e2e-spec)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^test/(.*)$': '<rootDir>/test/$1',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  testEnvironment: 'node',
  testEnvironmentOptions: {
    env: {
      CONFIG_PATH: '.env.test',
    },
  },
};
export default config;
