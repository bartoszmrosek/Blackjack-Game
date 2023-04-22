import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RiseLoader } from "react-spinners";
import styles from "./Logout.module.css";
import { StyledMainWrapper } from "../../../components/StyledMainWrapper/StyledMainWrapper";
import { useFetch } from "../../../hooks/useFetch";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { logoutOnlineUser } from "../../../App/onlineUserSlice";

const Logout: React.FC = () => {
    const [, status,,makeRequest] = useFetch("/logout/", "POST", true, false);
    const navigate = useNavigate();
    const onlineUserDispatch = useAppDispatch();

    useEffect(() => {
        onlineUserDispatch(logoutOnlineUser());
        let timer: NodeJS.Timeout;
        if (status !== 0 && status !== 200) {
            timer = setTimeout(() => {
                makeRequest();
            }, 1000);
        } else if (status === 200) {
            navigate("/");
        }
        return () => clearTimeout(timer);
    }, [makeRequest, navigate, onlineUserDispatch, status]);
    return (
        <StyledMainWrapper classNames={styles.logoutWrapper}>
            <RiseLoader color="var(--mainColor)" />
            <p>Logging out safely...</p>
        </StyledMainWrapper>
    );
};

export { Logout };
