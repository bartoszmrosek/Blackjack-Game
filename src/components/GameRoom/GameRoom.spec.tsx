/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { act, cleanup, fireEvent, screen, within } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import { renderWithProviders } from "../../utils/test-utils";
import { GameRoom } from "./GameRoom";
import deck from "../../cardDeck.json";
import { getCardValues } from "../../utils/getCardValues";
import { setupStore } from "../../mainStore";
import { initialUserState, resetUserSlice } from "../../App/userSlice";

vi.mock("../../utils/getRandomInt", () => {
    return {
        getRandomInt: vi.fn((param: number, param2: number) => {
            switch (param2) {
                case 52:
                    return 9;
                case 51:
                    return 19;
                case 50:
                    return 10;
                case 49:
                    return 2;
                case 48:
                    return 12;
                case 47:
                    return 1;
                default:
                    return 1;
            }
        }),
    };
});

const CARDS_IN_PLAY = [deck.deck[8], deck.deck[19], deck.deck[10], deck.deck[1], deck.deck[14]];
describe("GameRoom", () => {
    const BET_VALUES = [100, 25];
    const testingGlobalStore = setupStore({ user: initialUserState });
    beforeEach(() => {
        vi.useFakeTimers();
        renderWithProviders(<GameRoom />, { store: testingGlobalStore });
        const joiningBtns = screen.getAllByRole("button", { name: "Join now" });
        fireEvent.click(joiningBtns[4]);
        fireEvent.click(document.getElementById(`bet-${BET_VALUES[0]}`)!);
        fireEvent.click(joiningBtns[1]);
        fireEvent.click(document.getElementById(`bet-${BET_VALUES[1]}`)!);
        return () => {
            vi.useRealTimers();
            testingGlobalStore.dispatch(resetUserSlice());
        };
    });
    it("displays 5 buttons to join on first view", () => {
        cleanup();
        const { getAllByRole } = renderWithProviders(<GameRoom />);
        expect(getAllByRole("button", { name: "Join now" })).toHaveLength(5);
    });

    describe("user joining and leaving potential game", () => {
        it("should show bet for 1 seat", () => {
            expect(screen.getByText(`${BET_VALUES[0]}`)).toBeInTheDocument();
        });
        test("should show bet for 4 seats", () => {
            const moreJoiningBtns = screen.getAllByRole("button", { name: "Join now" });
            fireEvent.click(moreJoiningBtns[0]);
            fireEvent.click(document.getElementById("bet-10")!);
            fireEvent.click(moreJoiningBtns[1]);
            fireEvent.click(document.getElementById("bet-5")!);

            [...BET_VALUES, 10, 5].forEach((bet) => {
                expect(screen.getByText(`${bet}`)).toBeInTheDocument();
            });
        });
        it("removes user on leave", () => {
            const leavingBtns = screen.getAllByRole("button", { name: "×" });
            fireEvent.click(leavingBtns[0]);
            expect(leavingBtns[0]).not.toBeInTheDocument();
            expect(leavingBtns[1]).toBeInTheDocument();
        });
    });

    describe("handles all bets operations before game starts", () => {
        test("handles bet change on click", () => {
            fireEvent.click(screen.getByText(`${BET_VALUES[0]}`));
            fireEvent.click(document.getElementById("bet-100")!);
            expect(screen.getByText("100")).toBeInTheDocument();
        });
        describe("handles total bets displaying", () => {
            it("should display total bets placed", () => {
                expect(screen.getByText(`€ ${BET_VALUES[0] + BET_VALUES[1]}`)).toBeInTheDocument();
            });
            it("updates total bets section on player leave", () => {
                fireEvent.click(screen.getAllByRole("button", { name: "×" })[0]);
                expect(screen.getByText(`€ ${BET_VALUES[0]}`)).toBeInTheDocument();
            });
        });
    });

    describe("handles game flow properly", () => {
        beforeEach(() => {
            fireEvent.click(screen.getByRole("button", { name: "Start game" }));
        });
        describe("handles starting procedure properly", () => {
            it("draws 2 cards for each player and one for presenter", () => {
                CARDS_IN_PLAY.forEach((cardId) => {
                    expect(screen.getByAltText(`Card ${cardId}`)).toBeInTheDocument();
                });
            });
            it("should display presenter score properly", () => {
                const presenterCard = within(screen.getByTestId("presenter-section")).getByAltText(`Card ${CARDS_IN_PLAY[0]}`);
                const presenterCardValues = getCardValues(CARDS_IN_PLAY[0]);
                expect(presenterCard).toBeInTheDocument();
                expect(screen.getByText(`${presenterCardValues[0]}`)).toBeInTheDocument();
            });
            it("should display players scores properly", () => {
                const firstPlayerCards = [CARDS_IN_PLAY[1], CARDS_IN_PLAY[2]];
                const secondPlayerCards = [CARDS_IN_PLAY[3], CARDS_IN_PLAY[4]];
                const firstPlayerScore = firstPlayerCards.reduce((acc, card) => {
                    return acc + getCardValues(card)[0];
                }, 0);
                const secondPlayerScore = secondPlayerCards.reduce((acc, card) => {
                    return acc + getCardValues(card)[0];
                }, 0);
                expect(screen.getByText(`${firstPlayerScore}`)).toBeInTheDocument();
                expect(screen.getByText(`${secondPlayerScore}`)).toBeInTheDocument();
            });
            it("removes bets value from player balance", () => {
                expect(testingGlobalStore.getState()).toStrictEqual(
                    { user: { ...initialUserState, balance: initialUserState.balance - BET_VALUES[0] - BET_VALUES[1] } },
                );
            });
        });
        describe("implements game functionality properly", () => {
            it("gets another card on hit button and waits for another decision", () => {
                const hitBtn = screen.getByRole("button", { name: "+" });
                fireEvent.click(hitBtn);
                expect(screen.getByAltText(`Card ${deck.deck[0]}`)).toBeInTheDocument();
                expect(screen.getByTestId("is-deciding 1 true")).toBeInTheDocument();
            });
            it("on stand doesn`t do anything and goes to next player", () => {
                const standBtn = screen.getByRole("button", { name: "−" });
                fireEvent.click(standBtn);
                expect(screen.getByTestId("is-deciding 1 false")).toBeInTheDocument();
                expect(screen.getByTestId("is-deciding 4 true")).toBeInTheDocument();
                expect(screen.getAllByAltText("Card", { exact: false })).toHaveLength(5);
            });
            it("on double down draws new card and goes to next player", () => {
                const doubleDownBtn = screen.getByRole("button", { name: "2x" });
                fireEvent.click(doubleDownBtn);
                expect(screen.getAllByAltText("Card", { exact: false })).toHaveLength(6);
                expect(screen.getByTestId("is-deciding 1 false")).toBeInTheDocument();
                expect(screen.getByTestId("is-deciding 4 true")).toBeInTheDocument();
            });
            it("on double down updates user global balance", () => {
                const doubleDownBtn = screen.getByRole("button", { name: "2x" });
                fireEvent.click(doubleDownBtn);
                const expectedNewTotalBets = BET_VALUES[1] * 2 + BET_VALUES[0];
                expect(screen.getByText(`€ ${expectedNewTotalBets}`)).toBeInTheDocument();
                expect(testingGlobalStore.getState()).toStrictEqual(
                    { user: { ...initialUserState, balance: initialUserState.balance - expectedNewTotalBets } },
                );
            });
        });
        describe("implements game rules properly", () => {
            it("if hit gets over 21 display bust status and go to next player", () => {
                const hitBtn = screen.getByRole("button", { name: "+" });
                fireEvent.click(hitBtn);
                fireEvent.click(hitBtn);
                expect(screen.getByAltText("User bust icon")).toBeInTheDocument();
                expect(screen.getByTestId("is-deciding 4 true"));
            });
            it("if player score > presenter score display win status", () => {
                const hitBtn = screen.getByRole("button", { name: "+" });
                fireEvent.click(hitBtn);
                const standBtn = screen.getByRole("button", { name: "−" });
                fireEvent.click(standBtn);
                fireEvent.click(standBtn);
                expect(screen.getByAltText("User won icon")).toBeInTheDocument();
            });
            it("if player score < presenter score display lost status", () => {
                const hitBtn = screen.getByRole("button", { name: "+" });
                fireEvent.click(hitBtn);
                const standBtn = screen.getByRole("button", { name: "−" });
                fireEvent.click(standBtn);
                fireEvent.click(standBtn);
                expect(screen.getByAltText("User lost icon")).toBeInTheDocument();
            });
            it.todo("if player score === presenter score display push status", () => {

            });
            it.todo("if player score === 21 and has only 2 cards display blackjack", () => {

            });
            it.todo("if presenter has blackjack and player does not display lost");
            it.todo("if player and presenter have blackjack display push");
        });
        describe("handles game ending events", () => {
            beforeEach(() => {
                const standBtn = screen.getByRole("button", { name: "−" });
                fireEvent.click(standBtn);
                fireEvent.click(standBtn);
                act(() => {
                    vi.advanceTimersToNextTimer();
                });
            });
            it("should restart game after some time", () => {
                expect(screen.getByRole("button", { name: "Start game" })).toBeInTheDocument();
            });
            it("takes all players to update bets on reset", () => {
                expect(screen.getByText("REPEAT")).toBeInTheDocument();
            });
        });
    });
});
