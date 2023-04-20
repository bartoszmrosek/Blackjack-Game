import React from "react";
import { GoBackButton } from "../../components/GoBackButton/GoBackButton";
import { StyledMainWrapper } from "../../components/StyledMainWrapper/StyledMainWrapper";
import styles from "./Register.module.css";

const Register: React.FC = () => {
    return (
        <StyledMainWrapper classNames={styles.registerWrapper}>
            <GoBackButton />
        </StyledMainWrapper>
    );
};

export { Register };
