import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "../LoginPage";
import { MemoryRouter } from "react-router-dom";

describe("App Component", () => {
  it("renders correctly", () => {
    const { getAllByText } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(getAllByText("Login")[0]).toBeInTheDocument();
  });
});
