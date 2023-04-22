import React from "react";
import { vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { OffLineUserSeat } from "./OfflineUserSeat";
import { renderWithProviders } from "../../../../utils/test-utils";
import deck from "../../../../cardDeck.json";
import { getAllPermutations } from "../../../../utils/getAllPermutations";
import { getCardValues } from "../../../../utils/getCardValues";
import { initialOfflineState } from "../../../../App/offlineUserSlice";

const defaultMock = vi.fn();
describe("UserSeat", () => {
    const testingUser = {
        id: "1",
        name: "mock",
        bet: { currentBet: 5, previousBet: 0 },
        seatNumber: 2,
    };
    const testingActions = {
        userJoin: defaultMock,
        userLeave: defaultMock,
        userChgBet: defaultMock,
    };
    const testingPlayerStatus = {
        cards: [],
        status: "playing" as const,
        scorePermutations: [0],
    };
    describe("displays proper text based on props", () => {
        it("Seat is empty and game didn`t start yet", () => {
            const { getByRole } = renderWithProviders(<OffLineUserSeat
                isCurrentlyDeciding={false}
                seatId={1}
                isEmpty={true}
                isGameStarted={true}
                user={testingUser}
                actions={testingActions}
                playerStatus={testingPlayerStatus}
            />);
            expect(getByRole("button", { name: "Join in next round" })).toBeInTheDocument();
        });
        it("Seat is empty and game already started", () => {
            const { getByRole } = renderWithProviders(<OffLineUserSeat
                isCurrentlyDeciding={true}
                seatId={1}
                isEmpty={true}
                isGameStarted={false}
                user={testingUser}
                actions={testingActions}
                playerStatus={testingPlayerStatus}
            />);
            expect(getByRole("button", { name: "Join now" })).toBeInTheDocument();
        });
        it("Seat is not empty and it`s not current user", () => {
            const { getByText } = renderWithProviders(<OffLineUserSeat
                isCurrentlyDeciding={false}
                isEmpty={false}
                seatId={1}
                isGameStarted={false}
                user={testingUser}
                actions={testingActions}
                playerStatus={testingPlayerStatus}
            />);
            expect(getByText(`${testingUser.name}`)).toBeInTheDocument();
        });
        it("Seat is not empty and it`s current user", () => {
            const { getByRole } = renderWithProviders(<OffLineUserSeat
                isCurrentlyDeciding={true}
                isEmpty={false}
                seatId={1}
                isGameStarted={false}
                user={testingUser}
                actions={testingActions}
                playerStatus={testingPlayerStatus}
            />,
            {
                preloadedState: {
                    offlineUser: {
                        id: testingUser.id,
                        username: testingUser.name,
                        balance: 1000,
                        reservedBalance: 0,
                    },
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
            const { getByRole } = renderWithProviders(<OffLineUserSeat
                isCurrentlyDeciding={false}
                isEmpty={true}
                isGameStarted={false}
                seatId={1}
                user={testingUser}
                actions={mockedActions}
                playerStatus={testingPlayerStatus}
            />);
            fireEvent.click(getByRole("button", { name: "Join now" }));
            expect(joinMock).toHaveBeenCalledWith(1);
        });
        test("user leaving game", () => {
            const leaveMock = vi.fn();
            const mockedActions = {
                ...testingActions,
                userLeave: leaveMock,
            };
            const { getByRole } = renderWithProviders(<OffLineUserSeat
                isCurrentlyDeciding={false}
                isEmpty={false}
                seatId={1}
                isGameStarted={false}
                user={testingUser}
                actions={mockedActions}
                playerStatus={testingPlayerStatus}
            />, {
                preloadedState: {
                    offlineUser: {
                        id: testingUser.id,
                        username: testingUser.name,
                        balance: 1000,
                        reservedBalance: 0,
                    },
                },
            });
            fireEvent.click(getByRole("button", { name: "×" }));
            expect(leaveMock).toHaveBeenCalledWith({ ...testingUser, seatNumber: 1 });
        });
        test("everything is disabled when no funds can be found", () => {
            const { getByRole } = renderWithProviders(<OffLineUserSeat
                isCurrentlyDeciding={false}
                isEmpty={true}
                seatId={1}
                isGameStarted={false}
                user={testingUser}
                actions={testingActions}
                playerStatus={testingPlayerStatus}
            />, {
                preloadedState: {
                    offlineUser: {
                        ...initialOfflineState,
                        balance: 0,
                    },
                },
            });
            expect(getByRole("button", { name: "No funds left" })).toBeDisabled();
        });
        it("displays proper cards and score on proper props", () => {
            const twoPickedCards = [deck.deck[6], deck.deck[9]];
            const playerStatusWithCards = {
                cards: twoPickedCards,
                status: "playing" as const,
                scorePermutations: getAllPermutations(getCardValues(twoPickedCards[0]), getCardValues(twoPickedCards[1])),
            };
            const { getByAltText, getByText } = renderWithProviders(<OffLineUserSeat
                isEmpty={false}
                isGameStarted={true}
                isCurrentlyDeciding={false}
                seatId={1}
                user={testingUser}
                actions={testingActions}
                playerStatus={playerStatusWithCards}
            />);
            expect(getByAltText(`Card ${twoPickedCards[0]}`)).toBeInTheDocument();
            expect(getByAltText(`Card ${twoPickedCards[1]}`)).toBeInTheDocument();
            expect(getByText(`${playerStatusWithCards.scorePermutations.join("/")}`)).toBeInTheDocument();
        });
    });
});
