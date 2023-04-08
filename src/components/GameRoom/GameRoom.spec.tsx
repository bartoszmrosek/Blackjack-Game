import React from "react";
import { renderWithProviders } from "../../utils/test-utils";
import { GameRoom } from "./GameRoom";

describe("GameRoom", () => {
    it("displays 7 buttons to join on first view", () => {
        const { getAllByRole } = renderWithProviders(<GameRoom />);
        expect(getAllByRole("button", { name: "Join now" })).toHaveLength(7);
    });
});
