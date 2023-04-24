import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StyledMainWrapper } from "../../../components/StyledMainWrapper/StyledMainWrapper";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { logoutOnlineUser } from "../../../App/onlineUserSlice";
import { useFetch } from "../../../hooks/useFetch";
import styles from "./AuthError.module.css";
import { transformImgUrl } from "../../../utils/transformImgUrl";

const AuthError: React.FC = () => {
    // Just fire logout event on start
    useFetch("/logout/", "POST", true, false, false);
    const [timer, setTimerValue] = useState(8);
    const onlineUserDispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        onlineUserDispatch(logoutOnlineUser());
        const timeout = setTimeout(() => {
            navigate("/", { replace: true });
        }, 8000);
        const interval = setInterval(() => {
            setTimerValue(prev => prev - 1);
        }, 1000);
        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [navigate, onlineUserDispatch]);

    return (
        <StyledMainWrapper classNames={styles.authErrorWrapper}>
            <img
                className={styles.errorImage}
                src={`${transformImgUrl("/Graphics/StatusIcons/bustedIcon.svg")}`}
                alt="Error icon"
            />
            <h1>Authorization failed, please login again!</h1>
            <p>You will be redirected to home page in {timer} seconds</p>
            <Link to="/" className={styles.goBack}>Go back</Link>
        </StyledMainWrapper>
    );
};

export { AuthError };
