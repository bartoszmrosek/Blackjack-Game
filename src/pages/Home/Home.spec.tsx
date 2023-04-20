import { fireEvent, screen } from "@testing-library/react";
import React from "react";
import { renderWithProviders } from "../../utils/test-utils";
import { Home } from "./Home";

describe("Home", () => {
    beforeEach(() => {
        renderWithProviders(<Home />);
    });
    it("should navigate path to room on join lobby button click", () => {
        fireEvent.click(screen.getByText("Start offline game"));
        expect(window.location.pathname).toBe("/rooms/offline");
    });
    it("should navigate path to credits on credits button click", () => {
        fireEvent.click(screen.getByText("Credits"));
        expect(window.location.pathname).toBe("/credits");
    });
    it("should navigate to register on register button click", () => {
        fireEvent.click(screen.getByText("Register"));
        expect(window.location.pathname).toBe("/register");
    });
    it("should navigate to login on logic button click", () => {
        fireEvent.click(screen.getByText("Login"));
        expect(window.location.pathname).toBe("/login");
    });
    it("should navigate to game rooms on browsing button", () => {
        fireEvent.click(screen.getByText("Browse game rooms"));
        expect(window.location.pathname).toBe("/rooms");
    });
});
