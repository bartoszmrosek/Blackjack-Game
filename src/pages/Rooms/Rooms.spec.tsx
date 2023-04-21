import React from "react";

import { setupServer } from "msw/node";
import { rest } from "msw";
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { setupStore } from "../../mainStore";
import { renderWithProviders } from "../../utils/test-utils";
import { Rooms } from "./Rooms";
import { initialOnlineUserState } from "../../App/onlineUserSlice";

const TESTING_GET_ROUTE = "http://localhost:5678/api/rooms/";
const TESTING_POST_ROUTE = "http://localhost:5678/api/rooms/create/";
const restServer = setupServer(
    rest.get(TESTING_GET_ROUTE, (req, res, ctx) => {
        return res(ctx.delay(50), ctx.status(200), ctx.json([{ id: "testingId", playersNum: 1 }]));
    }),
    rest.post(TESTING_POST_ROUTE, (req, res, ctx) => {
        return res(ctx.delay(50), ctx.status(200), ctx.json({ id: "testingId" }));
    }),
);

beforeAll(() => restServer.listen());
beforeEach(() => restServer.resetHandlers());
afterAll(() => restServer.close());

const GLOBAL_STORE_WITH_LOGGED_USER = setupStore({ onlineUser: { id: 1, username: "a", reservedBalance: 0, balance: 1000 } });
describe("Rooms", () => {
    beforeEach(() => {
        renderWithProviders(<Rooms />, { store: GLOBAL_STORE_WITH_LOGGED_USER });
    });
    test("does display game rooms from initial request", async () => {
        expect(await screen.findByText("testingId")).toBeInTheDocument();
        expect(await screen.findByText("1/5")).toBeInTheDocument();
    });
    describe("displays properly with user logged in", () => {
        it("should display creating room btns", () => {
            expect(screen.getAllByRole("button", { name: "Create & join room" })).toHaveLength(2);
        });
        it("should display joining button next to room on list", async () => {
            expect(await screen.findByRole("button", { name: "Join" })).toBeInTheDocument();
        });
    });
    describe("displays properly without user logged in", () => {
        beforeEach(() => {
            cleanup();
            renderWithProviders(<Rooms />, { preloadedState: { onlineUser: initialOnlineUserState } });
        });
        it("should alter message slihtly if games list is empty", async () => {
            restServer.use(rest.get(TESTING_GET_ROUTE, (req, res, ctx) => res(ctx.status(200), ctx.json([]))));
            fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
            expect(await screen.findByText("login and", { exact: false })).toBeInTheDocument();
        });
        it("should not display creating rooms btns", () => {
            expect(screen.queryAllByText("Create & join room")).toHaveLength(0);
        });
        it("should not display joining button next to room on list", async () => {
            // to not wait 5000 until timeout would fire just check when list updates
            await screen.findByText("testingId");
            expect(screen.queryByRole("button", { name: "Join" })).not.toBeInTheDocument();
        });
    });
    describe("handles getting rooms list request properly", () => {
        it("should display loader when clicked on any refresh", () => {
            fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
            expect(screen.getByRole("progressbar")).toBeInTheDocument();
        });
        it("should display proper message when request goes wrong", async () => {
            restServer.use(rest.get(TESTING_GET_ROUTE, (req, res, ctx) => res(ctx.status(500))));
            fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
            expect(await screen.findByText("Error while getting informations. Please refresh")).toBeInTheDocument();
        });
        it("should display proper message if server returns empty game list", async () => {
            restServer.use(rest.get(TESTING_GET_ROUTE, (req, res, ctx) => res(ctx.status(200), ctx.json([]))));
            fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
            expect(await screen.findByText("Maybe create one?", { exact: false })).toBeInTheDocument();
        });
    });
    describe("handles creating room request status properly", () => {
        it.todo("handling routing to new location on success");
        it("should display creating message while waiting for response", async () => {
            restServer.use(rest.post(TESTING_POST_ROUTE, (req, res, ctx) => res(ctx.delay(500))));
            fireEvent.click(screen.getAllByRole("button", { name: "Create & join room" })[0]);
            expect(await screen.findAllByText("Creating...")).toHaveLength(2);
        });
        it("on error display proper message", async () => {
            restServer.use(rest.post(TESTING_POST_ROUTE, (req, res, ctx) => res(ctx.delay(401))));
            fireEvent.click(screen.getAllByRole("button", { name: "Create & join room" })[0]);
            expect(await screen.findByText("Failed to create. Please retry")).toBeInTheDocument();
            expect(await screen.findByText("Error while creating, please retry")).toBeInTheDocument();
        });
    });
});
