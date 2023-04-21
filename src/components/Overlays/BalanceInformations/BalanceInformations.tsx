import React from "react";
import styles from "./BalanceInformations.module.css";

interface BalanceInformationsProps {
    currentBalance: number;
    shouldDisplayBets: boolean;
    totalInBets: number;
}

const BalanceInformations: React.FC<BalanceInformationsProps> = ({ currentBalance, shouldDisplayBets, totalInBets }) => {
    return (
        <section className={styles.balanceInformations}>
            <section className={styles.userBalance} data-testid="user-balance">
                <h1 className={styles.balanceHeading}>BALANCE</h1>
                <p className={styles.balanceContent}>€ {currentBalance}</p>
            </section>
            {shouldDisplayBets && (
                <section className={styles.userAllBets} data-testid="user-totalbets">
                    <h1 className={styles.balanceHeading}>TOTAL BET</h1>
                    <p className={styles.balanceContent}>
                        € {totalInBets}
                    </p>
                </section>
            )}
        </section>
    );
};

export { BalanceInformations };
