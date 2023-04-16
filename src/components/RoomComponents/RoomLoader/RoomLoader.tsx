import React from "react";
import { PropagateLoader } from "react-spinners";
import styles from "./RoomLoader.module.css";

const RoomLoader: React.FC = () => {
    return (
        <div className={styles.loaderContainer} role="progressbar">
            <h1>Loading the game...</h1>
            <PropagateLoader loading={true} color="var(--textColor)" />
        </div>
    );
};

export { RoomLoader };
