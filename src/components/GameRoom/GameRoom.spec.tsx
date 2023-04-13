/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { fireEvent } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import { initialUserState, renderWithProviders } from "../../utils/test-utils";
import { GameRoom } from "./GameRoom";
import deck from "../../cardDeck.json";
import { getCardValues } from "../../utils/getCardValues";
import { setupStore } from "../../mainStore";

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
                    return 0;
            }
        }),
    };
});

const arrOfCards = [deck.deck[8], deck.deck[19], deck.deck[10], deck.deck[1], deck.deck[14]];
describe("GameRoom", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });
    it("displays 5 buttons to join on first view", () => {
        const { getAllByRole } = renderWithProviders(<GameRoom />);
        expect(getAllByRole("button", { name: "Join now" })).toHaveLength(5);
    });

    describe("handles all bets operations before game starts", () => {
        it("handles joining and leaving in not chronological order", () => {
            const { getAllByRole, getByText } = renderWithProviders(<GameRoom />);
            const joiningButtons = getAllByRole("button", { name: "Join now" });
            fireEvent.click(joiningButtons[4]);
            fireEvent.click(document.getElementById("bet-100")!);
            fireEvent.click(joiningButtons[1]);
            fireEvent.click(document.getElementById("bet-25")!);
            expect(getByText((content, element) => {
                return element?.tagName.toLowerCase() === "tspan" && content === "100";
            })).toBeInTheDocument();
            expect(getByText("25")).toBeInTheDocument();
            const leavingButtons = getAllByRole("button", { name: "×" });
            leavingButtons.forEach((btn) => fireEvent.click(btn));
            expect(leavingButtons[0]).not.toBeInTheDocument();
            expect(leavingButtons[1]).not.toBeInTheDocument();
        });
        it("handles bet change on click", () => {
            const { getByText, getAllByRole } = renderWithProviders(<GameRoom />);
            const joiningButtons = getAllByRole("button", { name: "Join now" });
            fireEvent.click(joiningButtons[2]);
            fireEvent.click(document.getElementById("bet-100")!);
            fireEvent.click(getByText((content, element) => {
                return element?.tagName.toLowerCase() === "tspan" && content === "100";
            }));
            fireEvent.click(document.getElementById("bet-25")!);
            expect(getByText((content, element) => {
                return element?.tagName.toLowerCase() === "tspan" && content === "25";
            })).toBeInTheDocument();
            expect(getByText("€ 25")).toBeInTheDocument();
        });
        describe("handles total bets displaying", () => {
            it("displays all placed bets in total bets section", () => {
                const { getAllByRole, getByText } = renderWithProviders(<GameRoom />);
                const joiningBtns = getAllByRole("button", { name: "Join now" });
                fireEvent.click(joiningBtns[0]);
                fireEvent.click(document.getElementById("bet-1")!);
                fireEvent.click(joiningBtns[1]);
                fireEvent.click(document.getElementById("bet-5")!);
                expect(getByText("€ 6")).toBeInTheDocument();
            });
            it("updates total bets section on player leave", () => {
                const { getAllByRole, getByText, getByRole } = renderWithProviders(<GameRoom />);
                const joiningBtns = getAllByRole("button", { name: "Join now" });
                fireEvent.click(joiningBtns[0]);
                fireEvent.click(document.getElementById("bet-1")!);
                expect(getByText("€ 1")).toBeInTheDocument();
                fireEvent.click(getByRole("button", { name: "×" }));
                expect(getByText("€ 0")).toBeInTheDocument();
            });
        });
    });
    describe("handles game flow properly", () => {
        describe("handles starting procedure properly", () => {
            it("draws 2 cards for each player and one for presenter", () => {
                const { getByAltText, getByRole, getAllByRole, getByTestId, getByText } = renderWithProviders(<GameRoom />);
                const joiningBtns = getAllByRole("button", { name: "Join now" });
                fireEvent.click(joiningBtns[0]);
                fireEvent.click(document.getElementById("bet-5")!);
                fireEvent.click(joiningBtns[1]);
                fireEvent.click(document.getElementById("bet-1")!);
                fireEvent.click(getByRole("button", { name: "Start game" }));
                arrOfCards.forEach((cardId) => {
                    expect(getByAltText(`Card ${cardId}`)).toBeInTheDocument();
                });
                const presenterSection = getByTestId("presenter-section");
                expect(presenterSection.childNodes[0].childNodes[0]).toHaveProperty("alt", `Card ${arrOfCards[0]}`);
                // checks if presenter score is properly displayed
                expect(getByText(`${getCardValues(arrOfCards[0])[0]}`)).toBeInTheDocument();
                // check first player score
                expect(getByText(`${getCardValues(arrOfCards[1])[0] + getCardValues(arrOfCards[2])[0]}`)).toBeInTheDocument();
                // check second player score
                expect(getByText(`${getCardValues(arrOfCards[3])[0] + getCardValues(arrOfCards[4])[0]}`)).toBeInTheDocument();
            });

            it("removes bets value from player balance", () => {
                const mockedStore = setupStore({ user: initialUserState });
                const { getAllByRole, getByRole } = renderWithProviders(<GameRoom />, { store: mockedStore });
                fireEvent.click(getAllByRole("button", { name: "Join now" })[0]);
                fireEvent.click(document.getElementById("bet-25")!);
                fireEvent.click(getByRole("button", { name: "Start game" }));
                expect(mockedStore.getState()).toStrictEqual({ user: { ...initialUserState, balance: 975 } });
            });
        });
        describe("implements game functionality properly", () => {
            it("gets another card on hit button and waits for another decision", () => {
                const { getAllByRole, getByRole, getByAltText, getByTestId } = renderWithProviders(<GameRoom />);
                fireEvent.click(getAllByRole("button", { name: "Join now" })[0]);
                fireEvent.click(document.getElementById("bet-25")!);
                fireEvent.click(getByRole("button", { name: "Start game" }));
                const hitBtn = getByRole("button", { name: "+" });
                expect(getByTestId("is-deciding 0 true")).toBeInTheDocument();
                fireEvent.click(hitBtn);
                expect(getByAltText(`Card ${arrOfCards[3]}`)).toBeInTheDocument();
                expect(getByTestId("is-deciding 0 true")).toBeInTheDocument();
                expect(hitBtn).toBeInTheDocument();
            });
            it("on stand doesn`t do anything and goes to next player", () => {
                const { getAllByRole, getByRole, getAllByAltText, getByTestId } = renderWithProviders(<GameRoom />);
                const joiningBtns = getAllByRole("button", { name: "Join now" });
                fireEvent.click(joiningBtns[0]);
                fireEvent.click(document.getElementById("bet-25")!);
                fireEvent.click(joiningBtns[1]);
                fireEvent.click(document.getElementById("bet-5")!);
                fireEvent.click(getByRole("button", { name: "Start game" }));
                const standBtn = getByRole("button", { name: "−" });
                expect(getByTestId("is-deciding 0 true")).toBeInTheDocument();
                fireEvent.click(standBtn);
                expect(getByTestId("is-deciding 0 false")).toBeInTheDocument();
                expect(getByTestId("is-deciding 1 true")).toBeInTheDocument();
                expect(getAllByAltText("Card", { exact: false })).toHaveLength(5);
            });
            it("on double down updates all balance related UI, draws new card and goes to next player", () => {
                const mockedStore = setupStore({ user: initialUserState });
                const {
                    getAllByRole,
                    getByRole,
                    getAllByAltText,
                    getByTestId,
                    getByText,
                } = renderWithProviders(<GameRoom />, { store: mockedStore });
                const joiningBtns = getAllByRole("button", { name: "Join now" });
                fireEvent.click(joiningBtns[0]);
                fireEvent.click(document.getElementById("bet-25")!);
                fireEvent.click(joiningBtns[1]);
                fireEvent.click(document.getElementById("bet-5")!);
                fireEvent.click(getByRole("button", { name: "Start game" }));
                const doubleDownBtn = getByRole("button", { name: "2x" });
                expect(getByTestId("is-deciding 0 true")).toBeInTheDocument();
                fireEvent.click(doubleDownBtn);
                expect(getByTestId("is-deciding 0 false")).toBeInTheDocument();
                expect(getByTestId("is-deciding 1 true")).toBeInTheDocument();
                expect(getAllByAltText("Card", { exact: false })).toHaveLength(6);
                expect(getByText("€ 55")).toBeInTheDocument();
                expect(mockedStore.getState()).toStrictEqual({ user: { ...initialUserState, balance: 945 } });
            });
        });
    });
});
