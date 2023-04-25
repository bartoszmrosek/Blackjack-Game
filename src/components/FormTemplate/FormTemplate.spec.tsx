/* eslint-disable @typescript-eslint/require-await */
import React from "react";
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { setupServer } from "msw/node";
import { rest } from "msw";
import { vi } from "vitest";
import { act } from "react-dom/test-utils";
import { FormTempalate } from "./FormTemplate";
import { renderWithProviders } from "../../utils/test-utils";
import { setupStore } from "../../mainStore";
import { initialOnlineUserState } from "../../App/onlineUserSlice";

const newUser = {
    username: "test",
    id: 4,
    balance: 1001,
};

const TESTING_ROUTE = "http://localhost:5678/api/register/";
const restServer = setupServer(
    rest.post(TESTING_ROUTE, (req, res, ctx) => {
        return res(ctx.delay(50), ctx.json(newUser));
    }),
);

beforeAll(() => restServer.listen());
beforeEach(() => restServer.resetHandlers());
afterAll(() => restServer.close());

describe("FormTemplate", () => {
    const TESTING_GLOBAL_STORE = setupStore({ onlineUser: initialOnlineUserState });
    beforeEach(() => {
        renderWithProviders(<FormTempalate
            header="Testing"
            pathForRequest="/register/"
            shouldRepeatPassword={false}
        />, { store: TESTING_GLOBAL_STORE });
    });
    describe("Displays properly based on props", () => {
        it("Displays proper header", () => {
            const formHeader = screen.getByRole("heading");
            expect(within(formHeader).getByText("Testing")).toBeInTheDocument();
        });
        it("Displays only two fields when repeating is not needed", () => {
            expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
            expect(screen.queryByPlaceholderText("Confirm password")).not.toBeInTheDocument();
        });
        it("Display confirm password field when repeating is set", () => {
        });
        describe("Handles form with confirm password set to true", () => {
            beforeEach(() => {
                cleanup();
                renderWithProviders(<FormTempalate
                    header=""
                    pathForRequest=""
                    shouldRepeatPassword={true}
                />);
            });
            it("displays secondary filed for password confirmation", () => {
                expect(screen.getByPlaceholderText("Confirm password")).toBeInTheDocument();
            });
            it("Displays message when trying to submit with mismatching passwords", () => {
                fireEvent.input(screen.getByPlaceholderText("Username"), { target: { value: "Test" } });
                fireEvent.input(screen.getByPlaceholderText("Password"), { target: { value: "aa" } });
                fireEvent.input(screen.getByPlaceholderText("Confirm password"), { target: { value: "a" } });
                fireEvent.click(screen.getByText("Submit"));

                expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
            });
        });
    });
    describe("Handles form events properly", () => {
        beforeEach(async () => {
            vi.useFakeTimers();
            fireEvent.input(screen.getByPlaceholderText("Username"), { target: { value: "Test" } });
            fireEvent.input(screen.getByPlaceholderText("Password"), { target: { value: "a" } });
            return () => vi.useRealTimers();
        });
        it("displas loader after submit", async () => {
            await act(async () => {
                fireEvent.click(screen.getByText("Submit"));
            });
            expect(screen.getByRole("progressbar")).toBeInTheDocument();
        });
        describe("handles successful request", () => {
            it("displays success img", async () => {
                fireEvent.click(screen.getByText("Submit"));
                expect(await screen.findByAltText("Success icon")).toBeInTheDocument();
            });
            it("should revert to submit text after time", async () => {
                fireEvent.click(screen.getByText("Submit"));
                const successIcon = await screen.findByAltText("Success icon");
                act(() => {
                    vi.advanceTimersByTime(15000);
                });
                expect(successIcon).not.toBeInTheDocument();
                expect(screen.getByText("Submit")).toBeInTheDocument();
            });
            it("should clear input fields", async () => {
                fireEvent.click(screen.getByText("Submit"));
                await screen.findByAltText("Success icon");
                act(() => {
                    vi.advanceTimersByTime(15000);
                });
                expect(screen.getByPlaceholderText("Username")).toHaveValue("");
            });
        });
        describe("handles unsuccessful request", () => {
            it("on server code 500 and /register/ route display username taken", async () => {
                restServer.use(
                    rest.post(TESTING_ROUTE, (req, res, ctx) => {
                        return res(ctx.status(500));
                    }),
                );
                fireEvent.click(screen.getByText("Submit"));
                expect(await screen.findByText("Username taken")).toBeInTheDocument();
            });
            it("on unknown error display failed message", async () => {
                restServer.use(
                    rest.post(TESTING_ROUTE, (req, res, ctx) => {
                        return res(ctx.status(1));
                    }),
                );
                fireEvent.click(screen.getByText("Submit"));
                expect(await screen.findByText("Bad request. Try again")).toBeInTheDocument();
            });
        });
        describe("handles register request properly", () => {
            it("should login user after successfull registration", async () => {
                fireEvent.click(screen.getByText("Submit"));
                await waitFor(() => {
                    expect(TESTING_GLOBAL_STORE.getState().onlineUser).toMatchObject(newUser);
                });
            });
        });
        describe("handles login request properly", () => {
            beforeEach(() => {
                cleanup();
                renderWithProviders(<FormTempalate header="" pathForRequest="/login/" />, { store: TESTING_GLOBAL_STORE });
                fireEvent.input(screen.getByPlaceholderText("Username"), { target: { value: "Test" } });
                fireEvent.input(screen.getByPlaceholderText("Password"), { target: { value: "a" } });
            });
            it("handles successful request", async () => {
                const newUser = {
                    id: 2,
                    username: "Abcd",
                    balance: 1000,
                };
                restServer.use(
                    rest.post("http://localhost:5678/api/login/", (req, res, ctx) => {
                        return res(ctx.status(200), ctx.json(newUser));
                    }),
                );
                fireEvent.click(screen.getByText("Submit"));
                await waitFor(() => {
                    expect(TESTING_GLOBAL_STORE.getState()).toMatchObject({ onlineUser: newUser });
                });
            });
        });
    });
});
