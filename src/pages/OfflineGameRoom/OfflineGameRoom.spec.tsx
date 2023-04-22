/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { act, cleanup, fireEvent, screen, within } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import { advanceTimerTimes, renderWithProviders } from "../../utils/test-utils";
import { OfflineGameRoom } from "./OfflineGameRoom";
import deck from "../../cardDeck.json";
import { getCardValues } from "../../utils/getCardValues";
import { setupStore } from "../../mainStore";
import { initialOfflineState, resetOfflineUserSlice } from "../../App/offlineUserSlice";
import * as randomInt from "../../utils/getRandomInt";
import { getAllPermutations } from "../../utils/getAllPermutations";

vi.mock("../../utils/getRandomInt", () => {
    return {
        getRandomInt: vi.fn((param: number, param2: number) => {
            switch (param2) {
                case 52:
                    return 10;
                case 51:
                    return 22;
                case 50:
                    return 11;
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

const CARDS_IN_PLAY = [deck.deck[9], deck.deck[22], deck.deck[11], deck.deck[1], deck.deck[14]];
describe("GameRoom", () => {
    const BET_VALUES = [100, 25];
    const testingGlobalStore = setupStore({ offlineUser: initialOfflineState });
    beforeEach(() => {
        vi.useFakeTimers();
        renderWithProviders(<OfflineGameRoom />, { store: testingGlobalStore });
        act(() => {
            window.innerWidth = 1366;
            window.innerHeight = 1024;
            global.dispatchEvent(new Event("resize"));
        });
        const joiningBtns = screen.getAllByRole("button", { name: "Join now" });
        fireEvent.click(joiningBtns[4]);
        fireEvent.click(document.getElementById(`bet-${BET_VALUES[0]}`)!);
        fireEvent.click(joiningBtns[1]);
        const bettingChips = screen.getAllByTestId("chip-in-betting");
        fireEvent.click(bettingChips[0]);
        fireEvent.click(document.getElementById(`bet-${BET_VALUES[1]}`)!);
        return () => {
            vi.useRealTimers();
            testingGlobalStore.dispatch(resetOfflineUserSlice());
        };
    });

    describe("displays properly on diffrent devices", () => {
        it("displays 5 buttons to join on first view on desktop", () => {
            cleanup();
            act(() => {
                window.innerWidth = 1366;
                window.innerHeight = 1024;
                global.dispatchEvent(new Event("resize"));
            });
            global.dispatchEvent(new Event("resize"));
            const { getAllByRole } = renderWithProviders(<OfflineGameRoom />);
            expect(getAllByRole("button", { name: "Join now" })).toHaveLength(5);
        });
        it("displays message that mobile devices are not supported", () => {
            cleanup();
            act(() => {
                window.innerWidth = 100;
                window.innerHeight = 100;
                global.dispatchEvent(new Event("resize"));
            });
            const { getByText } = renderWithProviders(<OfflineGameRoom />);
            expect(getByText("Too small device")).toBeInTheDocument();
        });
    });

    describe("user joining and leaving potential game", () => {
        it("should show bet for 1 seat", () => {
            expect(screen.getByText(`${BET_VALUES[0]}`)).toBeInTheDocument();
        });
        test("should show bet for 4 seats", () => {
            const moreJoiningBtns = screen.getAllByRole("button", { name: "Join now" });
            fireEvent.click(moreJoiningBtns[0]);
            fireEvent.click(moreJoiningBtns[1]);
            expect(screen.getByText(`${BET_VALUES[0]}`)).toBeInTheDocument();
            expect(screen.getAllByText(`${BET_VALUES[1]}`)).toHaveLength(3);
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
                expect(screen.getByText(`${presenterCardValues.join("/")}`)).toBeInTheDocument();
            });
            it("should display players scores properly", () => {
                const firstPlayerCardsValues = [getCardValues(CARDS_IN_PLAY[1]), getCardValues(CARDS_IN_PLAY[2])];
                const secondPlayerCards = [CARDS_IN_PLAY[3], CARDS_IN_PLAY[4]];
                const firstPlayerScore = getAllPermutations(firstPlayerCardsValues[0], firstPlayerCardsValues[1]);
                const secondPlayerScore = secondPlayerCards.reduce((acc, card) => {
                    return acc + getCardValues(card)[0];
                }, 0);
                expect(screen.getByText(`${firstPlayerScore.join("/")}`)).toBeInTheDocument();
                expect(screen.getByText(`${secondPlayerScore}`)).toBeInTheDocument();
            });
            it("removes bets value from player balance", () => {
                expect(testingGlobalStore.getState()).toMatchObject(
                    { offlineUser: { ...initialOfflineState, balance: initialOfflineState.balance - BET_VALUES[0] - BET_VALUES[1] } },
                );
            });
        });
        describe("implements game functionality properly", () => {
            it("on stand doesn`t do anything and player cannot decide again", () => {
                const standBtn = screen.getByRole("button", { name: "−" });
                fireEvent.click(standBtn);
                expect(screen.getByTestId("is-deciding 4 false")).toBeInTheDocument();
                expect(screen.getAllByAltText("Card", { exact: false })).toHaveLength(5);
            });
            it("on hit draws another card and can decide again", () => {
                const hitBtn = screen.getByRole("button", { name: "+" });
                fireEvent.click(hitBtn);
                expect(screen.getByAltText(`Card ${deck.deck[0]}`)).toBeInTheDocument();
                expect(screen.getByTestId("is-deciding 4 true")).toBeInTheDocument();
            });
            it("on double down draws new card and player cannot decide again", () => {
                const doubleDownBtn = screen.getByRole("button", { name: "2x" });
                fireEvent.click(doubleDownBtn);
                expect(screen.getByTestId("is-deciding 4 false")).toBeInTheDocument();
                expect(screen.getAllByAltText("Card", { exact: false })).toHaveLength(6);
            });
            it("on double down updates user global balance", () => {
                const doubleDownBtn = screen.getByRole("button", { name: "2x" });
                fireEvent.click(doubleDownBtn);
                const expectedNewTotalBets = BET_VALUES[1] + BET_VALUES[0] * 2;
                expect(screen.getByText(`€ ${expectedNewTotalBets}`)).toBeInTheDocument();
            });
        });
        describe("implements game rules properly", () => {
            it("if hit gets over 21 display bust status and go to next player", () => {
                vi.spyOn(randomInt, "getRandomInt").mockReturnValue(6);
                const hitBtn = screen.getByRole("button", { name: "+" });
                fireEvent.click(hitBtn);
                fireEvent.click(hitBtn);
                expect(screen.getByAltText("User bust icon")).toBeInTheDocument();
                expect(screen.getByTestId("is-deciding 4 false"));
            });
            it("if player score > presenter score display win status", () => {
                const hitBtn = screen.getByRole("button", { name: "+" });
                fireEvent.click(hitBtn);
                const standBtn = screen.getByRole("button", { name: "−" });
                fireEvent.click(standBtn);
                fireEvent.click(standBtn);
                advanceTimerTimes(4);
                expect(screen.getByAltText("User won icon")).toBeInTheDocument();
            });
            it("if player score < presenter score display lost status", () => {
                const hitBtn = screen.getByRole("button", { name: "+" });
                fireEvent.click(hitBtn);
                vi.spyOn(randomInt, "getRandomInt").mockReturnValue(6);
                const standBtn = screen.getByRole("button", { name: "−" });
                fireEvent.click(standBtn);
                fireEvent.click(standBtn);
                advanceTimerTimes(2);
                expect(screen.getByAltText("User lost icon")).toBeInTheDocument();
            });
            it("if player score === presenter score display push status", () => {
                vi.spyOn(randomInt, "getRandomInt").mockReturnValue(3);
                const hitBtn = screen.getByRole("button", { name: "+" });
                fireEvent.click(hitBtn);
                fireEvent.click(hitBtn);
                vi.spyOn(randomInt, "getRandomInt").mockReturnValueOnce(25).mockReturnValueOnce(15);
                const standBtn = screen.getByRole("button", { name: "−" });
                fireEvent.click(standBtn);
                advanceTimerTimes(2);
                expect(screen.getByAltText("User push icon")).toBeInTheDocument();
            });
            it("if player score === 21 and has only 2 cards display blackjack", () => {
                const cardsWrapper = screen.getByTestId("cards-for-1");
                const blackjackCards = within(cardsWrapper).getAllByAltText("Card", { exact: false });
                expect(blackjackCards).toHaveLength(2);
                expect(screen.getByAltText("User blackjack icon")).toBeInTheDocument();
            });
            it("if presenter has blackjack and player does not display lost", () => {
                const standBtn = screen.getByRole("button", { name: "−" });
                vi.spyOn(randomInt, "getRandomInt").mockReturnValueOnce(20);
                fireEvent.click(standBtn);
                fireEvent.click(standBtn);
                advanceTimerTimes(1);
                const presenterSection = screen.getByTestId("presenter-section");
                const presenterCards = within(presenterSection).getAllByAltText("Card", { exact: false });
                expect(presenterCards).toHaveLength(2);
                expect(screen.getByAltText("User lost icon")).toBeInTheDocument();
            });
            it("if player and presenter have blackjack display push", () => {
                const standBtn = screen.getByRole("button", { name: "−" });
                vi.spyOn(randomInt, "getRandomInt").mockReturnValueOnce(20);
                fireEvent.click(standBtn);
                fireEvent.click(standBtn);
                advanceTimerTimes(1);
                const presenterSection = screen.getByTestId("presenter-section");
                const presenterCards = within(presenterSection).getAllByAltText("Card", { exact: false });
                const userSection = screen.getByTestId("cards-for-1");
                const userCards = within(userSection).getAllByAltText("Card", { exact: false });
                expect(userCards).toHaveLength(2);
                expect(presenterCards).toHaveLength(2);
                expect(screen.getByAltText("User push icon")).toBeInTheDocument();
            });
        });
        describe("handles game ending events", () => {
            beforeEach(() => {
                const standBtn = screen.getByRole("button", { name: "−" });
                fireEvent.click(standBtn);
                fireEvent.click(standBtn);
            });
            it("should update user balance if met winning conditions", () => {
                advanceTimerTimes(4);
                expect(testingGlobalStore.getState()).toMatchObject(
                    { offlineUser: { ...initialOfflineState, balance: 1000 + BET_VALUES[1] - BET_VALUES[0] } },
                );
            });
            it("should restart game after some time", () => {
                advanceTimerTimes(5);
                expect(screen.getByRole("button", { name: "Start game" })).toBeInTheDocument();
            });
            it("takes all players to update bets on reset", () => {
                advanceTimerTimes(5);
                expect(screen.getByText("REPEAT")).toBeInTheDocument();
            });
        });
    });
});
