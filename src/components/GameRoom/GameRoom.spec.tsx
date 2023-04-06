import React from "react";
import { renderWithProviders } from "../../utils/test-utils";
import { GameRoom } from "./GameRoom";

describe("GameRoom", () => {
    it.todo("Doesn`t start game without player");
    it.todo("Displays place for up to 7 playerfs");
    it.todo("On joining displays overlay with bet options");
    it("displays 8 buttons to join on first view", () => {
        const { getAllByRole } = renderWithProviders(<GameRoom />);
        expect(getAllByRole("button")).toHaveLength(8);
    });
});