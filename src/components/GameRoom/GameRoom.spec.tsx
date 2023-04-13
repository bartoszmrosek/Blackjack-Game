/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { cleanup, fireEvent, screen } from "@testing-library/react";
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
                default:
                    return 1;
            }
        }),
    };
});

const arrOfCards = [deck.deck[8], deck.deck[19], deck.deck[10], deck.deck[1], deck.deck[14]];
describe("GameRoom", () => {
    const BET_VALUES = [100, 25];
    const testingGlobalStore = setupStore({ user: initialUserState });
    beforeEach(() => {
        renderWithProviders(<GameRoom />, { store: testingGlobalStore });
        const joiningBtns = screen.getAllByRole("button", { name: "Join now" });
        fireEvent.click(joiningBtns[4]);
        fireEvent.click(document.getElementById(`bet-${BET_VALUES[0]}`)!);
        fireEvent.click(joiningBtns[1]);
        fireEvent.click(document.getElementById(`bet-${BET_VALUES[1]}`)!);
        return () => {
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
                arrOfCards.forEach((cardId) => {
                    expect(screen.getByAltText(`Card ${cardId}`)).toBeInTheDocument();
                });
            });
            it("should display presenter score properly", () => {
                const presenterSection = screen.getByTestId("presenter-section");
                expect(presenterSection.childNodes[0].childNodes[0]).toHaveProperty("alt", `Card ${arrOfCards[0]}`);
                expect(screen.getByText(`${getCardValues(arrOfCards[0])[0]}`)).toBeInTheDocument();
            });
            it("should display players scores properly", () => {
                expect(screen.getByText(`${getCardValues(arrOfCards[1])[0] + getCardValues(arrOfCards[2])[0]}`)).toBeInTheDocument();
                expect(screen.getByText(`${getCardValues(arrOfCards[3])[0] + getCardValues(arrOfCards[4])[0]}`)).toBeInTheDocument();
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
    });
});
