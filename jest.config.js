module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  "testMatch": [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  "moduleNameMapper": {
    "^@domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@infra/(.*)$": "<rootDir>/src/infra/$1",
    "^@util/(.*)$": "<rootDir>/src/util/$1",
  }
}