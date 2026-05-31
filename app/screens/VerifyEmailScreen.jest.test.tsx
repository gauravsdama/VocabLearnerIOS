import React from "react";
import { render, screen } from "@testing-library/react-native";
import VerifyEmailScreen from "./VerifyEmailScreen";

jest.mock("../components/ScreenContainer", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const verifyEmailTokenMock = jest.fn();
const mockUseAuth = jest.fn(() => ({
  verifyEmailToken: verifyEmailTokenMock,
  token: null,
}));

jest.mock("../auth/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("VerifyEmailScreen", () => {
  beforeEach(() => {
    verifyEmailTokenMock.mockReset();
  });

  it("fails safely when the deep link token is missing", async () => {
    render(
      <VerifyEmailScreen
        navigation={{ navigate: jest.fn() } as any}
        route={{ key: "VerifyEmail", name: "VerifyEmail", params: undefined } as any}
      />,
    );

    expect(
      await screen.findByText("This verification link is missing a token."),
    ).toBeTruthy();
    expect(verifyEmailTokenMock).not.toHaveBeenCalled();
  });
});
