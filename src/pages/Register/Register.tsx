import React from "react";
import { GoBackButton } from "../../components/GoBackButton/GoBackButton";
import { StyledMainWrapper } from "../../components/StyledMainWrapper/StyledMainWrapper";
import styles from "./Register.module.css";
import { FormTempalate } from "../../components/FormTemplate/FormTemplate";

const Register: React.FC = () => {
    return (
        <StyledMainWrapper classNames={styles.registerWrapper}>
            <FormTempalate
                header="Registration"
                pathForRequest="/register/"
                shouldRepeatPassword={true}
            />
            <GoBackButton />
        </StyledMainWrapper>
    );
};

export { Register };
