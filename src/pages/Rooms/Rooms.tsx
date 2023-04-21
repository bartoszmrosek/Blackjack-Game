import React from "react";
import { StyledMainWrapper } from "../../components/StyledMainWrapper/StyledMainWrapper";
import { GoBackButton } from "../../components/Overlays/GoBackButton/GoBackButton";
import styles from "./Rooms.module.css";
import { useAppSelector } from "../../hooks/reduxHooks";

const Rooms: React.FC = () => {
    const isUserLogged = useAppSelector(state => state.onlineUser.id) !== -1;
    return (
        <StyledMainWrapper classNames={styles.roomsWrapper}>
            <h1 className={styles.tableCaption}>All current game rooms</h1>
            <div className={styles.tableWrapper}>
                <div className={styles.tableContainer}>
                    <table className={styles.mainTable}>
                        <thead className={styles.tableHeaders}>
                            <tr>
                                <th className={styles.tableTh}>Game id</th>
                                <th className={styles.tableTh}>No. of players</th>
                                {isUserLogged && (
                                    <th className={`${styles.tableTh} ${styles.refreshTh}`}>
                                        <button className={styles.refreshBtn}>
                                            <img
                                                src="/Graphics/refresh.svg"
                                            />
                                        </button>
                                    </th>
                                )}

                            </tr>
                        </thead>
                        <tbody>
                            <tr className={styles.mobileOptions}>
                                <td className={styles.begginingTableTd}>
                                    <button className={styles.inGameTableBtn}>Refresh</button>
                                </td>
                                {isUserLogged && (
                                    <td className={styles.begginingTableTd}>
                                        <button className={styles.inGameTableBtn}>Create & Join</button>
                                    </td>
                                )}
                            </tr>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((el) => (
                                <tr key={el}>
                                    <td data-cell="Game id: " className={styles.tableTd}>ABCD</td>
                                    <td data-cell="No. of players: " className={styles.tableTd}>2/5</td>
                                    {isUserLogged && (
                                        <td className={styles.tableTd}>
                                            <button className={styles.joinGameBtn}>Join</button>
                                        </td>
                                    )}
                                </tr>
                            ))
                    }
                            {isUserLogged && (
                                <tr className={styles.createGameEnd}>
                                    <td colSpan={3}>
                                        <button className={styles.inGameTableBtn}>Create & join game</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <GoBackButton />
        </StyledMainWrapper>
    );
};

export { Rooms };
