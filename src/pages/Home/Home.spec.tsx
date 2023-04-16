import { fireEvent, screen } from "@testing-library/react";
import React from "react";
import { renderWithProviders } from "../../utils/test-utils";
import { Home } from "./Home";

describe("Home", () => {
    beforeEach(() => {
        renderWithProviders(<Home />);
    });
    it("should change path to room on join lobby button click", () => {
        fireEvent.click(screen.getByText("Join random lobby"));
        expect(window.location.pathname).toBe("/room");
    });
    it("should change path to credits on credits button click", () => {
        fireEvent.click(screen.getByText("Credits"));
        expect(window.location.pathname).toBe("/credits");
    });
});
