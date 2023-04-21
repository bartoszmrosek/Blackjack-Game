import React from "react";
import styles from "./Login.module.css";
import { StyledMainWrapper } from "../../components/StyledMainWrapper/StyledMainWrapper";
import { FormTempalate } from "../../components/FormTemplate/FormTemplate";
import { GoBackButton } from "../../components/GoBackButton/GoBackButton";

const Login: React.FC = () => {
    return (
        <StyledMainWrapper classNames={styles.loginWrapper}>
            <FormTempalate
                header="Login"
                pathForRequest="/login/"
            />
            <GoBackButton />
        </StyledMainWrapper>
    );
};

export { Login };
