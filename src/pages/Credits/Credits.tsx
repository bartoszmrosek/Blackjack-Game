import React from "react";
import { GoBackButton } from "../../components/GoBackButton/GoBackButton";
import styles from "./Credits.module.css";

const Credits: React.FC = () => {
    return (
        <main className={styles.creditsContainer}>
            <h1 className={styles.creditsHeader}>This couldn`t have been created if not for:</h1>
            <section className={styles.credits}>
                <p>
                    <a
                        href="https://www.freepik.com/free-vector/nine-colorful-poker-chips_1175565.htm"
                        referrerPolicy="no-referrer"
                        className={styles.refLink}
                    >Chips by brgfx
                    </a> on Freepik
                </p>
                <p>Altered image content by me:</p>
                <ul className={styles.changesList}>
                    <li>Added text to all chips</li>
                    <li>Removed 3 chips at the bottom of image</li>
                </ul>
            </section>
            <section className={styles.credits}>
                <p>
                    <a
                        href="https://www.iconfinder.com/search?q=blackjack&price=free"
                        referrerPolicy="no-referrer"
                        className={styles.refLink}
                    >Blackjack icon
                    </a>
                    by
                    <a
                        href="https://www.iconfinder.com/bitfreak86"
                        referrerPolicy="no-referrer"
                        className={styles.refLink}
                    >Wishforge Games
                    </a>
                </p>
            </section>
            <GoBackButton />
        </main>
    );
};

export { Credits };
