import React, { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./GoBackButton.module.css";
import { transformImgUrl } from "../../../utils/transformImgUrl";

const GoBackButton: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBtn = useCallback(() => {
        if (location.key !== "default") {
            navigate(-1);
        } else {
            navigate("/");
        }
    }, [location.key, navigate]);

    return (
        <button className={styles.goBackBtn} onClick={handleBtn}>
            <img src={`${transformImgUrl("/Graphics/undo.svg")}`} alt="Go back button" />
        </button>
    );
};

export { GoBackButton };
