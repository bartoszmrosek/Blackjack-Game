import React from "react";
import styles from "./ImportantMessage.module.css";

interface ImportantMessageProps {
    message: string;
}

const ImportantMessage: React.FC<ImportantMessageProps> = ({ message }) => {
    return (
        <div className={styles.messageWrapper}>
            <div className={styles.message}>
                <h1>{message}</h1>
            </div>
        </div>
    );
};

export { ImportantMessage };
