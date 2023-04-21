import React, { PropsWithChildren } from "react";
import styles from "./StyledMainWrapper.module.css";
import { useAppSelector } from "../../hooks/reduxHooks";
import { BalanceInformations } from "../BalanceInformations/BalanceInformations";

interface StyledMainWrapperProps {
    classNames?: string;
}

const StyledMainWrapper: React.FC<PropsWithChildren & StyledMainWrapperProps> = ({ children, classNames }) => {
    const onlineUser = useAppSelector(state => state.onlineUser);
    return (
        <main className={`${styles.mainWrapper} ${classNames}`}>
            {children}
            {onlineUser.id !== -1 && (
                <BalanceInformations
                    currentBalance={onlineUser.balance}
                    shouldDisplayBets={false}
                    totalInBets={0}
                />
            )}
        </main>
    );
};

export { StyledMainWrapper };
