import React from "react";
import { StyledMainWrapper } from "../../components/StyledMainWrapper/StyledMainWrapper";
import { GoBackButton } from "../../components/Overlays/GoBackButton/GoBackButton";
import styles from "./Rooms.module.css";

const Rooms: React.FC = () => {
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
                                <th className={styles.tableTh} />
                            </tr>
                        </thead>
                        <tbody>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((el) => (
                                <tr key={el}>
                                    <td data-cell="Game id: " className={styles.tableTd}>ABCD</td>
                                    <td data-cell="No. of players: " className={styles.tableTd}>2/5</td>
                                    <td className={styles.tableTd}>Placeholder</td>
                                </tr>
                            ))
                    }
                        </tbody>
                    </table>
                </div>
            </div>
            <GoBackButton />
        </StyledMainWrapper>
    );
};

export { Rooms };
