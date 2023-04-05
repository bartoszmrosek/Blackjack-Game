import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { App } from "./App/App";
import "./index.css";
import { setupStore } from "./mainStore";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <Provider store={setupStore()}>
            <App />
        </Provider>
    </React.StrictMode>,
);
