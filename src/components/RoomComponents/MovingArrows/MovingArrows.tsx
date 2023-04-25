import React from "react";
import styles from "./MovingArrows.module.css";
import { transformImgUrl } from "../../../utils/transformImgUrl";

interface MovingArrowsProps {
    nextCallback: () => void;
    previousCallback: () => void;
    isNextPossible: boolean;
    isPrevPossible: boolean;
}

const MovingArrows: React.FC<MovingArrowsProps> = ({ nextCallback, previousCallback, isNextPossible, isPrevPossible }) => {
    return (
        <>
            <button onClick={nextCallback} className={styles.nextBtn} disabled={!isNextPossible}>
                <img
                    src={`${transformImgUrl("/Graphics/goLeft.svg")}`}
                    alt="Go to next seat"
                    className={styles.nextImg}
                />
            </button>
            <button onClick={previousCallback} className={styles.previousBtn} disabled={!isPrevPossible}>
                <img
                    src={`${transformImgUrl("/Graphics/goLeft.svg")}`}
                    alt="Go to previous seat"
                    className={styles.prevImg}
                />
            </button>
        </>
    );
};

export { MovingArrows };
