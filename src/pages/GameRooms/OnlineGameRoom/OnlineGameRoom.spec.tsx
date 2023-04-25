/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Mock, vi } from "vitest";
import mockedSocket from "socket.io-client";
import { act, fireEvent, screen, within } from "@testing-library/react";
import { renderWithProviders } from "../../../utils/test-utils";
import { OnlineGameRoom } from "./OnlineGameRoom";
import { SocketContextProvider } from "../../../Contexts/SocketContext";
import { setupStore } from "../../../mainStore";
import { loginOnlineUser } from "../../../App/onlineUserSlice";
import testinServerStatus from "./testingServerStatus.json";

// ALL CLIENT SOCKET ACTS ARE CONSIDERED SERVER RESPONSES INSIDE THIS FILE DUE TO MOCKING

vi.mock("socket.io-client", () => {
    const newSocket = {
        once: vi.fn(),
        emit: vi.fn((eventName: string, ...args: any[]) => {
            switch (eventName) {
                case "joinGameTable":
                    return args[1](200);
            }
        }),
        on: vi.fn(),
        disconnect: vi.fn(),
        removeAllListeners: vi.fn(),
    };
    return {
        io: vi.fn(() => (newSocket)),
        default: newSocket,
    };
});

vi.mock("react-router-dom", async (original) => {
    const mod: object = await original();
    return {
        ...mod,
        useParams: vi.fn(() => ({ roomId: "TEST" })),
    };
});

const LOGGED_USER = {
    id: 4,
    username: "MOCK",
    balance: 1365,
};
const MOCKED_STORE = setupStore({ onlineUser: { ...LOGGED_USER } });
const clientSocket = mockedSocket as unknown as {
    once: Mock<any[], any>;
    emit: Mock;
    on: Mock<any[], any>;
    disconnect: Mock<any[], any>;
    removeAllListeners: Mock<any[], any>;
};
describe("OnlineGameRoom", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        renderWithProviders(<SocketContextProvider><OnlineGameRoom /></SocketContextProvider>, { store: MOCKED_STORE });
        return () => {
            MOCKED_STORE.dispatch(loginOnlineUser(LOGGED_USER));
            vi.useRealTimers();
        };
    });
    describe("handles initial connection requests", () => {
        it("should try joining to room with id from url params", () => {
            expect(clientSocket.emit.mock.lastCall).toContain("TEST");
        });
        it("should navigate to auth error when socket gets connect_error", () => {
            act(() => {
                clientSocket.once.mock.calls[0][1]("error");
            });
            expect(window.location.pathname).toBe("/autherror");
        });
        it("when rooms is not found redirects to /rooms", () => {
            act(() => {
                clientSocket.emit.mock.calls[0][2](404);
            });
            act(() => {
                vi.advanceTimersByTime(6000);
            });
            expect(window.location.pathname).toBe("/rooms");
        });
    });
    describe("handles events of other players", () => {
        const otherPlayer = {
            username: "otherplayer",
            userId: 1,
            seatId: 2,
        };
        beforeEach(() => {
            act(() => {
                clientSocket.on.mock.calls[1][1]({
                    ...otherPlayer,
                    timer: 28000,
                });
            });
        });
        it("should display 4 free seats and one occupied", () => {
            const allJoiningBtns = screen.getAllByRole("button", { name: "Join now" });
            expect(allJoiningBtns).toHaveLength(4);
            expect(screen.getByTestId("active-player")).toBeInTheDocument();
        });
        it("should display proper name of other player", () => {
            expect(screen.getByText(`${otherPlayer.username}`)).toBeInTheDocument();
        });
        it("should not display leave button inside taken seat", () => {
            const otherPlayerSeat = screen.getByTestId("active-player");
            expect(within(otherPlayerSeat).queryByRole("button", { name: "×" })).not.toBeInTheDocument();
        });
        it("updates timer based on event", () => {
            expect(screen.getByRole("timer")).toHaveTextContent("0:28");
        });
        it("on leaving changes seat back to joinable button", () => {
            act(() => {
                clientSocket.on.mock.calls[2][1]({ ...otherPlayer });
            });
            expect(screen.getAllByRole("button", { name: "Join now" })).toHaveLength(5);
        });
    });
    describe("tests seat events of current user", () => {
        beforeEach(() => {
            act(() => {
                clientSocket.on.mock.calls[1][1]({
                    userId: LOGGED_USER.id,
                    username: LOGGED_USER.username,
                    seatId: 1,
                    timer: 28000,
                });
            });
            fireEvent.click(screen.getAllByRole("button", { name: "Join now" })[0]);
        });
        it("sends event on joining click", () => {
            expect(clientSocket.emit.mock.calls[1][1]).toBe(0);
        });
        it("should display leave button next to taken seat", () => {
            const activePlayerSection = screen.getByTestId("active-player");
            expect(within(activePlayerSection).getByRole("button", { name: "×" })).toBeInTheDocument();
        });
        it("should sent leaving event on click button next to taken seat", () => {
            const leavingBtn = screen.getByRole("button", { name: "×" });
            fireEvent.click(leavingBtn);
            expect(clientSocket.emit.mock.calls[2][1]).toBe(1);
        });
        describe("handles bet overlay after joining", () => {
            beforeEach(() => {
                act(() => {
                    clientSocket.emit.mock.calls[1][2](200);
                });
            });
            it("should display bet overlay after joining", () => {
                expect(screen.getByText("UNDO")).toBeInTheDocument();
            });
            it("clicking on any chip fires update bet event", () => {
                fireEvent.click(document.getElementById("bet-5")!);
                expect(clientSocket.emit.mock.calls[2][1]).toBe(5);
                expect(clientSocket.emit.mock.calls[2][2]).toBe(0);
            });
            it("should close after timeout time comes from server", () => {
                act(() => {
                    clientSocket.on.mock.calls[0][1](5000);
                });
                act(() => {
                    vi.advanceTimersByTime(6000);
                });
                expect(document.getElementById("bet-5")!).toBeNull();
            });
            it("after clicking chip and getting response from server closes overlay and updates balance", () => {
                fireEvent.click(document.getElementById("bet-5")!);
                act(() => {
                    clientSocket.emit.mock.calls[2][3](200, 800);
                });
                expect(screen.getByText("€ 800")).toBeInTheDocument();
                expect(document.getElementById("bet-5")).toBeNull();
            });
        });
        it("should displays properly new bet for specific seat", () => {
            act(() => {
                clientSocket.on.mock.calls[3][1](200, 1, 28000);
            });
            const seatSection = screen.getByTestId("active-player");
            expect(within(seatSection).getByTestId("chip-in-betting")).toBeInTheDocument();
        });
    });

    describe("handle game events properly", () => {
        beforeEach(() => {
            act(() => {
                clientSocket.on.mock.calls[4][1](testinServerStatus);
            });
        });
        it("should display player cards properly", () => {
            const userSections = screen.getAllByTestId("active-player");
            expect(within(userSections[0]).getAllByAltText("Card", { exact: false })).toHaveLength(2);
            expect(within(userSections[1]).getAllByAltText("Card", { exact: false })).toHaveLength(2);
        });
        it("should display players score properly", () => {
            const userSections = screen.getAllByTestId("active-player");
            expect(within(userSections[0]).getByText(`${testinServerStatus.activePlayers[0].cardsScore}`)).toBeInTheDocument();
            expect(within(userSections[1]).getByText(`${testinServerStatus.activePlayers[1].cardsScore}`)).toBeInTheDocument();
        });
        it("presenter to have specified card and score", () => {
            const presenterSection = screen.getByTestId("presenter-section");
            expect(within(presenterSection).getByAltText(`Card ${testinServerStatus.presenterState.cards[0]}`)).toBeInTheDocument();
            expect(within(presenterSection).getByText(`${testinServerStatus.presenterState.score}`)).toBeInTheDocument();
        });
        it("should display decision overlay when asked for decision", () => {
            act(() => {
                clientSocket.on.mock.calls[7][1](2, vi.fn());
            });
            expect(screen.getByText("MAKE YOUR DECISION")).toBeInTheDocument();
        });
        it("should call decision callback with proper decision on button click", () => {
            const mockedCallback = vi.fn();
            act(() => {
                clientSocket.on.mock.calls[7][1](2, mockedCallback);
            });
            fireEvent.click(screen.getByRole("button", { name: "+" }));
            expect(mockedCallback).toHaveBeenCalledTimes(1);
        });
    });

    describe("displays arrows to change position on certain sizes", () => {
        it("on small width display arrows", () => {
            expect(screen.getByAltText("Go to next seat")).toBeInTheDocument();
            expect(screen.getByAltText("Go to previous seat")).toBeInTheDocument();
        });
        it("on size over or equal 1320px do not display arrows", () => {
            act(() => {
                window.innerWidth = 1320;
                fireEvent(window, new Event("resize"));
            });
            expect(screen.queryByAltText("Go to next seat")).not.toBeInTheDocument();
            expect(screen.queryByAltText("Go to previous seat")).not.toBeInTheDocument();
        });
    });
    test("should display balance from redux store", () => {
        expect(screen.getByText(`€ ${LOGGED_USER.balance}`)).toBeInTheDocument();
    });
});
