import React, { useState, useEffect, useCallback, FormEvent, useRef } from "react";
import { BeatLoader } from "react-spinners";
import { useFetch } from "../../hooks/useFetch";
import styles from "./FormTemplate.module.css";

interface FormTemplateProps {
    header: string;
    pathForRequest: string;
    shouldRepeatPassword?: boolean;
}

const FormTempalate: React.FC<FormTemplateProps> = ({ header, pathForRequest, shouldRepeatPassword }) => {
    const [arePasswordTheSame, setArePasswordTheSame] = useState(true);
    const controller = new AbortController();
    const [isLoading, status,,sendForm] = useFetch(`${pathForRequest}`, "POST", false, controller.signal, false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form as HTMLFormElement);
        if (formData.get("password") === formData.get("confirm-password") || !shouldRepeatPassword) {
            setArePasswordTheSame(true);
            sendForm({
                username: formData.get("username"),
                password: formData.get("password"),
            });
        } else {
            setArePasswordTheSame(false);
        }
    }, [sendForm, shouldRepeatPassword]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => () => controller.abort(), []);
    useEffect(() => {
        if (status === 200 && formRef.current) {
            formRef.current.reset();
        }
    }, [status]);
    return (
        <>
            <h1 className={styles.header}>{header} <span className={styles.headerForm}>Form</span></h1>
            <form className={styles.formStyles} onSubmit={handleSubmit} ref={formRef}>
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
                {shouldRepeatPassword && (
                    <input
                        name="confirm-password"
                        id="register-password-repeat"
                        placeholder="Confirm password"
                        className={styles.input}
                        required={true}
                        type="password"
                        autoComplete="new-password"
                    />
                )}
                {(!arePasswordTheSame
                ) && (
                    <p className={styles.errorMessage}>
                        <span>{
                            !arePasswordTheSame && "Passwords do not match"
                        }
                        </span>
                    </p>
                )}
                {(status !== 0 && status !== 200) && (
                    <p className={styles.errorMessage}>
                        <span>{
                            status === 500 ? "Username taken" : "Request failed"
                        }
                        </span>
                    </p>
                )}
                <button
                    type="submit"
                    className={`${styles.sendBtn} ${status === 200 && styles.submitSuccess}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <BeatLoader
                            loading={true}
                            role="progressbar"
                            speedMultiplier={0.5}
                            color="var(--positiveColor)"
                        />
                    ) :
                        status === 200 ? (
                            <img
                                src="/Graphics/success.svg"
                                className={styles.successImg}
                                alt="Success icon"
                            />
                        ) : "Submit"
                    }
                </button>
            </form>
        </>
    );
};

export { FormTempalate };
