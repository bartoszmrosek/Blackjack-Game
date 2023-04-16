import React from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";

const Home: React.FC = () => {
    return (
        <main className={styles.homeBackground}>
            <h1 className={styles.title}>Black<span className={styles.titleJack}>Jack</span></h1>
            <Link to="room" className={styles.links}>Join random lobby</Link>
            <Link to="credits" className={styles.links}>Credits</Link>
        </main>
    );
};

export { Home };
