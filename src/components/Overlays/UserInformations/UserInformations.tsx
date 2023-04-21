import React from "react";
import md5 from "md5";
import { Link } from "react-router-dom";
import styles from "./UserInformations.module.css";
import { transformImgUrl } from "../../../utils/transformImgUrl";

interface UserInformationsProps {
    username: string;
}

const UserInformations: React.FC<UserInformationsProps> = ({ username }) => {
    const preparedUsernameString = username.trim().toLowerCase();
    const gravatarLink = md5(`${preparedUsernameString}@blackjack.com`);
    return (
        <section className={styles.userInformations}>
            <div className={styles.accordion}>
                <section className={styles.accordionItem}>
                    <h1 className={styles.accordionHeader}>
                        {username}<img
                            src={`${transformImgUrl("/Graphics/scrolldown.png")}`}
                            className={styles.scrollIcon}
                        />
                    </h1>
                    <div className={styles.accordionItemContent}>
                        <Link to="/logout" className={styles.logoutLink}>Logout</Link>
                    </div>
                </section>
            </div>
            <img
                src={`https://www.gravatar.com/avatar/${gravatarLink}?d=robohash`}
                className={styles.avatar}
            />
        </section>
    );
};

export { UserInformations };
