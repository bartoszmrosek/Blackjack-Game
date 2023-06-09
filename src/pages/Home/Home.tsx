import React from "react";
import { Link } from "react-router-dom";
import { StyledMainWrapper } from "../../components/StyledMainWrapper/StyledMainWrapper";
import styles from "./Home.module.css";

const Home: React.FC = () => {
    return (
        <StyledMainWrapper classNames={styles.homeWrapper}>
            <h1 className={styles.title}>Black<span className={styles.titleJack}>Jack</span></h1>
            <section className={styles.userActions}>
                <Link to="/register" className={styles.links}>Register</Link>
                <Link to="/login" className={styles.links}>Login</Link>
            </section>
            <Link to="/rooms" className={styles.links}>Browse game rooms</Link>
            <Link to="rooms/offline" className={styles.links}>Start offline game</Link>
            <Link to="credits" className={styles.links}>Credits</Link>
        </StyledMainWrapper>
    );
};

export { Home };
