import React, { useCallback, useEffect } from "react";
import { SyncLoader } from "react-spinners";
import { StyledMainWrapper } from "../../components/StyledMainWrapper/StyledMainWrapper";
import { GoBackButton } from "../../components/Overlays/GoBackButton/GoBackButton";
import styles from "./Rooms.module.css";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useFetch } from "../../hooks/useFetch";
import { JoinBtnSubcomponent } from "./JoinBtnSubcomponent";
import { transformImgUrl } from "../../utils/transformImgUrl";

const Rooms: React.FC = () => {
    const [isGettingRooms, roomsReqStatus, allGameRooms, getRooms]
    = useFetch<{ id: string; playersNum: number; }[]>("/rooms/", "GET", true, true, true);
    const [isCreatingRoom, creatingStatus, newRoomId, createRoom]
    = useFetch<{ id: string; }>("/rooms/create/", "POST", false, true, false);
    const isUserLogged = useAppSelector(state => state.onlineUser.id) !== -1;

    const refreshRooms = useCallback(() => {
        getRooms();
    }, [getRooms]);

    const handleCreateBtn = useCallback(() => {
        if (isUserLogged) {
            createRoom();
        }
    }, [createRoom, isUserLogged]);

    useEffect(() => {
        if (newRoomId !== null) {
            // for now console log
            console.log(newRoomId);
        }
    }, [newRoomId]);

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
                                <th className={`${styles.tableTh} ${styles.refreshTh}`}>
                                    <button className={styles.refreshBtn} onClick={refreshRooms}>
                                        <img
                                            src={transformImgUrl("/Graphics/refresh.svg")}
                                            alt="Refresh icon"
                                        />
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className={styles.mobileOptions}>
                                <td className={styles.begginingTableTd}>
                                    <button className={styles.inGameTableBtn} onClick={refreshRooms}>Refresh</button>
                                </td>
                                {isUserLogged && (
                                    <td className={styles.begginingTableTd}>
                                        <button className={styles.inGameTableBtn} disabled={isCreatingRoom} onClick={handleCreateBtn}>
                                            {isCreatingRoom ? "Creating..." :
                                                creatingStatus !== 0 ? "Failed to create. Please retry" :
                                                    "Create & join room"
                                            }
                                        </button>
                                    </td>
                                )}
                            </tr>
                            {
                                !isGettingRooms && roomsReqStatus === 200 && allGameRooms !== null ? (
                                    <>
                                        {allGameRooms.length > 0 ?
                                            allGameRooms.map((gameRoom) => (
                                                <tr key={gameRoom.id}>
                                                    <td data-cell="Game id: " className={styles.tableTd}>{gameRoom.id}</td>
                                                    <td data-cell="No. of players: " className={styles.tableTd}>{gameRoom.playersNum}/5</td>
                                                    {isUserLogged && (
                                                        <JoinBtnSubcomponent roomId={gameRoom.id} />
                                                    )}
                                                </tr>
                                            ))
                                            : (
                                                <tr>
                                                    <td colSpan={3} className={styles.extraInformations}>
                                                        Oops, there aren`t any game rooms available.
                                                        Maybe {!isUserLogged && "login and"} create one?
                                                    </td>
                                                </tr>
                                            )}
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan={3} className={styles.extraInformations}>
                                            {isGettingRooms ? (
                                                <div>
                                                    <SyncLoader
                                                        color="var(--positiveColor)"
                                                        loading={true}
                                                        speedMultiplier={0.5}
                                                        role="progressbar"
                                                    />
                                                </div>
                                            )
                                                : "Error while getting informations. Please refresh"}
                                        </td>
                                    </tr>
                                )
                            }
                            {isUserLogged && (
                                <tr className={styles.createGameEnd}>
                                    <td colSpan={3}>
                                        <button
                                            className={styles.inGameTableBtn}
                                            disabled={isCreatingRoom}
                                            onClick={handleCreateBtn}
                                        >
                                            {
                                            isCreatingRoom ? "Creating..." :
                                                creatingStatus !== 0 ? "Error while creating, please retry"
                                                    : "Create & join room"
                                            }
                                        </button>
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
