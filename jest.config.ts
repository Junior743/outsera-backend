import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/src/**/*.test.ts"],
  clearMocks: true,
  setupFilesAfterEnv: [],
  moduleNameMapper: {},
  transform: { "^.+\\.(ts|tsx)$": ["ts-jest", {}] },
}

export default config
