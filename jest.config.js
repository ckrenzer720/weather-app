module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  transform: { '^.+\\.js$': 'babel-jest' },
  moduleFileExtensions: ['js'],
  collectCoverageFrom: ['lib/**/*.js'],
  coverageDirectory: 'coverage',
};
