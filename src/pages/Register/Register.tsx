import React, { FormEvent, useCallback, useState } from "react";
import { GoBackButton } from "../../components/GoBackButton/GoBackButton";
import { StyledMainWrapper } from "../../components/StyledMainWrapper/StyledMainWrapper";
import styles from "./Register.module.css";

const Register: React.FC = () => {
    const [arePasswordTheSame, setArePasswordTheSame] = useState(true);
    const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form as HTMLFormElement);
        if (formData.get("password") === formData.get("confirm-password")) {
            setArePasswordTheSame(true);
            console.log(formData);
        } else {
            setArePasswordTheSame(false);
        }
    }, []);

    return (
        <StyledMainWrapper classNames={styles.registerWrapper}>
            <h1 className={styles.header}>Registration <span className={styles.headerForm}>Form</span></h1>
            <form className={styles.formStyles} onSubmit={handleSubmit}>
                <input
                    name="username"
                    id="register-username"
                    placeholder="Username"
                    className={styles.input}
                    required={true}
                    autoComplete="username"
                />
                <input
                    name="password"
                    id="register-password"
                    placeholder="Password"
                    className={styles.input}
                    required={true}
                    type="password"
                    autoComplete="new-password"
                />
                <input
                    name="confirm-password"
                    id="register-password-repeat"
                    placeholder="Confirm password"
                    className={styles.input}
                    required={true}
                    type="password"
                    autoComplete="new-password"
                />
                {!arePasswordTheSame && <span className={styles.passwordMismatch}>Passwords do not match</span>}
                <button type="submit" className={styles.sendBtn}>Submit</button>
            </form>
            <GoBackButton />
        </StyledMainWrapper>
    );
};

export { Register };
