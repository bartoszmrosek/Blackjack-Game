import React from "react";
import styles from "./BalanceInformations.module.css";

interface BalanceInformationsProps {
    currentBalance: number;
    totalInBets: number;
}

const BalanceInformations: React.FC<BalanceInformationsProps> = ({ currentBalance, totalInBets }) => {
    return (
        <section className={styles.balanceInformations}>
            <section className={styles.userBalance} data-testid="user-balance">
                <h1 className={styles.balanceHeading}>BALANCE</h1>
                <p className={styles.balanceContent}>€ {currentBalance}</p>
            </section>
            <section className={styles.userAllBets} data-testid="user-totalbets">
                <h1 className={styles.balanceHeading}>TOTAL BET</h1>
                <p className={styles.balanceContent}>
                    € {totalInBets}
                </p>
            </section>
        </section>
    );
};

export { BalanceInformations };
