import React from "react";
import { vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { OnlineUserSeat } from "./OnlineUserSeat";
import { renderWithProviders } from "../../../../utils/test-utils";
import deck from "../../../../cardDeck.json";
import { getAllPermutations } from "../../../../utils/getAllPermutations";
import { getCardValues } from "../../../../utils/getCardValues";
import { OnlineActivePlayer, OnlinePendingPlayer } from "../../../../types/Player.interface";
import { initialOnlineUserState } from "../../../../App/onlineUserSlice";

const defaultMock = vi.fn();
describe("OnlineUserSeat", () => {
    const pendingTestingPlayer: OnlinePendingPlayer = {
        userId: 1,
        username: "mock",
        bet: 5,
        previousBet: 0,
        seatId: 2,
    };
    const globalOnlinePlayer = {
        id: pendingTestingPlayer.userId,
        username: pendingTestingPlayer.username,
        balance: 1000,
        reservedBalance: 0,
    };
    const testingActions = {
        userJoin: defaultMock,
        userLeave: defaultMock,
        userChgBet: defaultMock,
    };
    describe("displays proper text based on props", () => {
        it("Seat is empty and game didn`t start yet", () => {
            const { getByRole } = renderWithProviders(<OnlineUserSeat
                isCurrentlyDeciding={false}
                seatId={1}
                isEmpty={true}
                isGameStarted={true}
                user={pendingTestingPlayer}
                actions={testingActions}
            />, { preloadedState: { onlineUser: globalOnlinePlayer } });
            expect(getByRole("button", { name: "Join in next round" })).toBeInTheDocument();
        });
        it("Seat is empty and game already started", () => {
            const { getByRole } = renderWithProviders(<OnlineUserSeat
                isCurrentlyDeciding={true}
                seatId={1}
                isEmpty={true}
                isGameStarted={false}
                user={pendingTestingPlayer}
                actions={testingActions}
            />, { preloadedState: { onlineUser: globalOnlinePlayer } });
            expect(getByRole("button", { name: "Join now" })).toBeInTheDocument();
        });
        it("Seat is not empty and it`s not current user", () => {
            const { getByText } = renderWithProviders(<OnlineUserSeat
                isCurrentlyDeciding={false}
                isEmpty={false}
                seatId={1}
                isGameStarted={false}
                user={pendingTestingPlayer}
                actions={testingActions}
            />);
            expect(getByText(`${pendingTestingPlayer.username}`)).toBeInTheDocument();
        });
        it("Seat is not empty and it`s current user", () => {
            const { getByRole } = renderWithProviders(<OnlineUserSeat
                isCurrentlyDeciding={true}
                isEmpty={false}
                seatId={1}
                isGameStarted={false}
                user={pendingTestingPlayer}
                actions={testingActions}
            />,
            {
                preloadedState: {
                    onlineUser: { ...globalOnlinePlayer },
                },
            });
            expect(getByRole("button", { name: "×" })).toBeInTheDocument();
        });
    });
    describe("handles user interactions", () => {
        test("user joining game", () => {
            const joinMock = vi.fn();
            const mockedActions = {
                ...testingActions,
                userJoin: joinMock,
            };
            const { getByRole } = renderWithProviders(<OnlineUserSeat
                isCurrentlyDeciding={false}
                isEmpty={true}
                isGameStarted={false}
                seatId={1}
                user={pendingTestingPlayer}
                actions={mockedActions}
            />, { preloadedState: { onlineUser: globalOnlinePlayer } });
            fireEvent.click(getByRole("button", { name: "Join now" }));
            expect(joinMock).toHaveBeenCalledWith(1);
        });
        test("user leaving game", () => {
            const leaveMock = vi.fn();
            const mockedActions = {
                ...testingActions,
                userLeave: leaveMock,
            };
            const { getByRole } = renderWithProviders(<OnlineUserSeat
                isCurrentlyDeciding={false}
                isEmpty={false}
                seatId={1}
                isGameStarted={false}
                user={pendingTestingPlayer}
                actions={mockedActions}
            />, {
                preloadedState: {
                    onlineUser: globalOnlinePlayer,
                },
            });
            fireEvent.click(getByRole("button", { name: "×" }));
            expect(leaveMock).toHaveBeenCalledWith(2);
        });
        test("everything is disabled when no funds can be found", () => {
            const { getByRole } = renderWithProviders(<OnlineUserSeat
                isCurrentlyDeciding={false}
                isEmpty={true}
                seatId={1}
                isGameStarted={false}
                user={pendingTestingPlayer}
                actions={testingActions}
            />, {
                preloadedState: {
                    onlineUser: {
                        ...initialOnlineUserState,
                        balance: 0,
                    },
                },
            });
            expect(getByRole("button", { name: "No funds left" })).toBeDisabled();
        });
        it("displays proper cards and score on proper props", () => {
            const twoPickedCards = [deck.deck[6], deck.deck[9]];
            const mockedActivePlayer: OnlineActivePlayer = {
                ...pendingTestingPlayer,
                hasMadeFinalDecision: false,
                decision: null,
                status: "playing" as const,
                cards: twoPickedCards,
                cardsScore: getAllPermutations(getCardValues(twoPickedCards[0]), getCardValues(twoPickedCards[1])),
            };
            const { getByAltText, getByText } = renderWithProviders(<OnlineUserSeat
                isEmpty={false}
                isGameStarted={true}
                isCurrentlyDeciding={false}
                seatId={1}
                user={mockedActivePlayer}
                actions={testingActions}
            />);
            expect(getByAltText(`Card ${twoPickedCards[0]}`)).toBeInTheDocument();
            expect(getByAltText(`Card ${twoPickedCards[1]}`)).toBeInTheDocument();
            expect(getByText(`${mockedActivePlayer.cardsScore.join("/")}`)).toBeInTheDocument();
        });
    });
});
