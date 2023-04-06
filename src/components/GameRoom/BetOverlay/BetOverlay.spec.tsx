import { vi } from "vitest";
import React from "react";
import { fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../utils/test-utils";
import { Player } from "../gameRoomReducer";
import { BetOverlay } from "./BetOverlay";

it.todo("Soltution for innerText inside jsdom");

// Due to beeing not implemented in jsdom, my solution for BetOverlay wouldn`t work with tests.

const defaultMock = vi.fn();
const testingPlayer: Player = {
    id: "1",
    name: "mock",
    bet: {
        currentBet: 0,
        previousBet: 0,
    },
    seatNumber: 1,
};
describe("BetOverlay", () => {
    describe("operations if there are funds", () => {
        it("handles undo button", () => {
            const undoMock = vi.fn();
            const { getByRole } = renderWithProviders(
                <BetOverlay playerInformations={[testingPlayer]} updateBet={defaultMock} undoHandler={undoMock} />);
            fireEvent.click(getByRole("button", { name: "Undo" }));
            expect(undoMock).toHaveBeenCalledWith(testingPlayer);
            expect(undoMock).toHaveBeenCalledTimes(1);
        });
        it("handles repeat button", () => {
            const playerWithPreviousBet: Player = { ...testingPlayer, bet: { currentBet: 0, previousBet: 500 } };
            const updateMock = vi.fn();
            const { getByRole } = renderWithProviders(
                <BetOverlay playerInformations={[playerWithPreviousBet]} updateBet={updateMock} undoHandler={defaultMock} />);
            const specialButton = getByRole("button", { name: "Repeat" });
            fireEvent.click(specialButton);
            expect(updateMock).toHaveBeenCalledWith(
                { ...playerWithPreviousBet, bet: { currentBet: playerWithPreviousBet.bet.previousBet, previousBet: 0 } },
            );
            expect(updateMock).toHaveBeenCalledTimes(1);
            expect(specialButton).toHaveTextContent("2x");
        });
        it("handles 2x button", () => {
            const playerWithCurrentBet: Player = { ...testingPlayer, bet: { currentBet: 250, previousBet: 0 } };
            const updateMock = vi.fn();
            const { getByRole } = renderWithProviders(
                <BetOverlay playerInformations={[playerWithCurrentBet]} updateBet={updateMock} undoHandler={defaultMock} />);
            const specialButton = getByRole("button", { name: "2x" });
            fireEvent.click(specialButton);
            expect(updateMock).toHaveBeenCalledWith(
                {
                    ...playerWithCurrentBet,
                    bet:
                    { currentBet: 2 * playerWithCurrentBet.bet.currentBet, previousBet: playerWithCurrentBet.bet.currentBet },
                },
            );
            expect(updateMock).toHaveBeenCalledTimes(1);
        });
    });
    it("if no founds display proper message", () => {
        const { getByText } = renderWithProviders(
            <BetOverlay playerInformations={[testingPlayer]} updateBet={defaultMock} undoHandler={defaultMock} />,
            {
                preloadedState: {
                    user: {
                        id: "1",
                        name: "name",
                        balance: 0,
                        reservedBalance: 0,
                    },
                },
            });
        expect(getByText("No funds left"));
    });
});

export {};
