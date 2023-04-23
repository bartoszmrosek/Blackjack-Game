import { vi } from "vitest";
import React from "react";
import { fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../../utils/test-utils";
import { OnlineBetOverlay } from "./OnlineBetOverlay";
import styles from "../BetOverlay.module.css";
import { PlayerBets } from "../../../../types/Player.interface";

const defaultMock = vi.fn();
const testingPlayer: PlayerBets = {
    bet: 0,
    previousBet: 0,
    seatId: 1,
};
const mockedOnlineUser = {
    id: 1,
    balance: 1000,
    reservedBalance: 0,
    username: "test",
};
describe("OnlineBetOverlay", () => {
    describe("operations on special buttons", () => {
        it("handles undo button", () => {
            const undoMock = vi.fn();
            const { getByAltText } = renderWithProviders(
                <OnlineBetOverlay playerInformations={testingPlayer} updateBet={defaultMock} undoHandler={undoMock} />);
            fireEvent.click(getByAltText("Undo button"));
            expect(undoMock).toHaveBeenCalledWith(testingPlayer.seatId);
            expect(undoMock).toHaveBeenCalledTimes(1);
        });
        it("handles repeat button", () => {
            const playerWithPreviousBet: PlayerBets = { ...testingPlayer, bet: 0, previousBet: 500 };
            const updateMock = vi.fn();
            const { getByAltText } = renderWithProviders(
                <OnlineBetOverlay playerInformations={playerWithPreviousBet} updateBet={updateMock} undoHandler={defaultMock} />,
                { preloadedState: { onlineUser: mockedOnlineUser } });
            const specialButton = getByAltText("Repeat icon");
            fireEvent.click(specialButton);
            expect(updateMock).toHaveBeenCalledWith(
                playerWithPreviousBet.seatId, playerWithPreviousBet.previousBet,
            );
            expect(updateMock).toHaveBeenCalledTimes(1);
        });
        it("handles 2x button", () => {
            const playerWithCurrentBet: PlayerBets = { ...testingPlayer, bet: 250 };
            const updateMock = vi.fn();
            const { getByText } = renderWithProviders(
                <OnlineBetOverlay playerInformations={playerWithCurrentBet} updateBet={updateMock} undoHandler={defaultMock} />,
                { preloadedState: { onlineUser: mockedOnlineUser } });
            const specialButton = getByText("2x");
            fireEvent.click(specialButton);
            expect(updateMock).toHaveBeenCalledWith(playerWithCurrentBet.seatId, playerWithCurrentBet.bet * 2);
            expect(updateMock).toHaveBeenCalledTimes(1);
        });
        it("blocks repeat button when funds cannot afford it", () => {
            const playerWithPreviousBet: PlayerBets = { ...testingPlayer, previousBet: 500 };
            const { getByAltText } = renderWithProviders(<OnlineBetOverlay
                playerInformations={playerWithPreviousBet}
                updateBet={defaultMock}
                undoHandler={defaultMock}
            />, {
                preloadedState: {
                    onlineUser: {
                        ...mockedOnlineUser,
                        balance: 50,
                    },
                },
            });
            expect(getByAltText("Repeat icon").parentElement).toBeDisabled();
        });
        it("blocks 2x button when funds cannot afford it", () => {
            const playerWithCurrentBet: PlayerBets = { ...testingPlayer, bet: 500 };
            const { getByText } = renderWithProviders(<OnlineBetOverlay
                playerInformations={playerWithCurrentBet}
                updateBet={defaultMock}
                undoHandler={defaultMock}
            />, {
                preloadedState: {
                    onlineUser: {
                        ...mockedOnlineUser,
                        balance: 50,
                    },
                },
            });
            expect(getByText("2x").parentElement).toBeDisabled();
        });
    });
    it("handles all betting options", () => {
        const betPlacingMock = vi.fn();
        renderWithProviders(<OnlineBetOverlay undoHandler={defaultMock} playerInformations={testingPlayer} updateBet={betPlacingMock} />);
        const allBetBtns = document.getElementsByClassName(styles.betButton);
        for (const betBtn of allBetBtns) {
            fireEvent.click(betBtn);
        }
        expect(betPlacingMock).toHaveBeenCalledTimes(6);
    });
});
