module.exports = {
  preset: "jest-expo",
  moduleDirectories: ["node_modules", "node_modules/expo/node_modules"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  testMatch: ["**/*.jest.test.ts", "**/*.jest.test.tsx"],
};
