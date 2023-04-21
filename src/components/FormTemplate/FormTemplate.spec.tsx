/* eslint-disable @typescript-eslint/require-await */
import React from "react";
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { setupServer } from "msw/node";
import { rest } from "msw";
import { vi } from "vitest";
import { act } from "react-dom/test-utils";
import { FormTempalate } from "./FormTemplate";
import { renderWithProviders } from "../../utils/test-utils";

const restServer = setupServer(
    rest.post("http://localhost:5678/api/testing", (req, res, ctx) => {
        return res(ctx.status(200));
    }),
);

beforeAll(() => restServer.listen());
beforeEach(() => restServer.resetHandlers());
afterAll(() => restServer.close());

describe("FormTemplate", () => {
    beforeEach(() => {
        renderWithProviders(<FormTempalate
            header="Testing"
            pathForRequest="/testing"
            shouldRepeatPassword={false}
        />);
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
            await act(async () => {
                fireEvent.click(screen.getByText("Submit"));
            });
            return () => vi.useRealTimers();
        });
        describe("handles successful request", () => {
            it("displays success img", async () => {
                expect(await screen.findByAltText("Success icon")).toBeInTheDocument();
            });
        });
    });
});
