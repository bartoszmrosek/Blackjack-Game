import React, { PropsWithChildren } from "react";
import styles from "./StyledMainWrapper.module.css";

interface StyledMainWrapperProps {
    classNames?: string;
}

const StyledMainWrapper: React.FC<PropsWithChildren & StyledMainWrapperProps> = ({ children, classNames }) => {
    return (
        <main className={`${styles.mainWrapper} ${classNames}`}>
            {children}
        </main>
    );
};

export { StyledMainWrapper };
