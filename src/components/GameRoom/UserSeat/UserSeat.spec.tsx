import React from "react";
import { vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { UserSeat } from "./UserSeat";
import { renderWithProviders } from "../../../utils/test-utils";

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
    describe("displays proper text based on props", () => {
        it("Seat is empty and game didn`t start yet", () => {
            const { getByRole } = renderWithProviders(<UserSeat
                seatId={1}
                isEmpty={true}
                isGameStarted={true}
                user={testingUser}
                actions={testingActions}
            />);
            expect(getByRole("button", { name: "Join in next round" })).toBeInTheDocument();
        });
        it("Seat is empty and game already started", () => {
            const { getByRole } = renderWithProviders(<UserSeat
                seatId={1}
                isEmpty={true}
                isGameStarted={false}
                user={testingUser}
                actions={testingActions}
            />);
            expect(getByRole("button", { name: "Join now" })).toBeInTheDocument();
        });
        it("Seat is not empty and it`s not current user", () => {
            const { getByText } = renderWithProviders(<UserSeat
                isEmpty={false}
                seatId={1}
                isGameStarted={false}
                user={testingUser}
                actions={testingActions}
            />);
            expect(getByText(`${testingUser.name}`)).toBeInTheDocument();
        });
        it("Seat is not empty and it`s current user", () => {
            const { getByRole } = renderWithProviders(<UserSeat
                isEmpty={false}
                seatId={1}
                isGameStarted={false}
                user={testingUser}
                actions={testingActions}
            />,
            {
                preloadedState: {
                    user: {
                        id: testingUser.id,
                        name: testingUser.name,
                        balance: 1000,
                    },
                },
            });
            expect(getByRole("button", { name: "X" })).toBeInTheDocument();
        });
    });
    describe("handles user interactions", () => {
        it("user joining game", () => {
            const joinMock = vi.fn();
            const mockedActions = {
                ...testingActions,
                userJoin: joinMock,
            };
            const { getByRole } = renderWithProviders(<UserSeat
                isEmpty={true}
                isGameStarted={false}
                seatId={1}
                user={testingUser}
                actions={mockedActions}
            />);
            fireEvent.click(getByRole("button", { name: "Join now" }));
            expect(joinMock).toHaveBeenCalledWith(1);
        });
        it("user leaving game", () => {
            const leaveMock = vi.fn();
            const mockedActions = {
                ...testingActions,
                userLeave: leaveMock,
            };
            const { getByRole } = renderWithProviders(<UserSeat
                isEmpty={false}
                seatId={1}
                isGameStarted={false}
                user={testingUser}
                actions={mockedActions}
            />, {
                preloadedState: {
                    user: {
                        id: testingUser.id,
                        name: testingUser.name,
                        balance: 1000,
                    },
                },
            });
            fireEvent.click(getByRole("button", { name: "X" }));
            expect(leaveMock).toHaveBeenCalledWith({ ...testingUser, seatNumber: 1 });
        });
    });
});
