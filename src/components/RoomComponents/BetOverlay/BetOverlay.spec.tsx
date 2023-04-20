import { vi } from "vitest";
import React from "react";
import { fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../utils/test-utils";
import { Player } from "../../../types/Player";
import { BetOverlay } from "./BetOverlay";
import styles from "./BetOverlay.module.css";
import { initialOfflineState } from "../../../App/offlineUserSlice";

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
    describe("operations on special buttons", () => {
        it("handles undo button", () => {
            const undoMock = vi.fn();
            const { getByAltText } = renderWithProviders(
                <BetOverlay playerInformations={testingPlayer} updateBet={defaultMock} undoHandler={undoMock} />);
            fireEvent.click(getByAltText("Undo button"));
            expect(undoMock).toHaveBeenCalledWith(testingPlayer);
            expect(undoMock).toHaveBeenCalledTimes(1);
        });
        it("handles repeat button", () => {
            const playerWithPreviousBet: Player = { ...testingPlayer, bet: { currentBet: 0, previousBet: 500 } };
            const updateMock = vi.fn();
            const { getByAltText } = renderWithProviders(
                <BetOverlay playerInformations={playerWithPreviousBet} updateBet={updateMock} undoHandler={defaultMock} />);
            const specialButton = getByAltText("Repeat icon");
            fireEvent.click(specialButton);
            expect(updateMock).toHaveBeenCalledWith(
                { ...playerWithPreviousBet, bet: { currentBet: playerWithPreviousBet.bet.previousBet, previousBet: 0 } },
            );
            expect(updateMock).toHaveBeenCalledTimes(1);
        });
        it("handles 2x button", () => {
            const playerWithCurrentBet: Player = { ...testingPlayer, bet: { currentBet: 250, previousBet: 0 } };
            const updateMock = vi.fn();
            const { getByText } = renderWithProviders(
                <BetOverlay playerInformations={playerWithCurrentBet} updateBet={updateMock} undoHandler={defaultMock} />);
            const specialButton = getByText("2x");
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
        it("blocks repeat button when funds cannot afford it", () => {
            const playerWithPreviousBet: Player = { ...testingPlayer, bet: { ...testingPlayer.bet, previousBet: 500 } };
            const { getByAltText } = renderWithProviders(<BetOverlay
                playerInformations={playerWithPreviousBet}
                updateBet={defaultMock}
                undoHandler={defaultMock}
            />, {
                preloadedState: {
                    user: {
                        ...initialOfflineState,
                        balance: 50,
                    },
                },
            });
            expect(getByAltText("Repeat icon").parentElement).toBeDisabled();
        });
        it("blocks 2x button when funds cannot afford it", () => {
            const playerWithCurrentBet: Player = { ...testingPlayer, bet: { ...testingPlayer.bet, currentBet: 500 } };
            const { getByText } = renderWithProviders(<BetOverlay
                playerInformations={playerWithCurrentBet}
                updateBet={defaultMock}
                undoHandler={defaultMock}
            />, {
                preloadedState: {
                    user: {
                        ...initialOfflineState,
                        balance: 50,
                    },
                },
            });
            expect(getByText("2x").parentElement).toBeDisabled();
        });
    });
    it("handles all betting options", () => {
        const betPlacingMock = vi.fn();
        renderWithProviders(<BetOverlay undoHandler={defaultMock} playerInformations={testingPlayer} updateBet={betPlacingMock} />);
        const allBetBtns = document.getElementsByClassName(styles.betButton);
        for (const betBtn of allBetBtns) {
            fireEvent.click(betBtn);
        }
        expect(betPlacingMock).toHaveBeenCalledTimes(6);
    });
});

export {};
