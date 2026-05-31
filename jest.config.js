module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  testMatch: ["**/*.jest.test.ts", "**/*.jest.test.tsx"],
};
