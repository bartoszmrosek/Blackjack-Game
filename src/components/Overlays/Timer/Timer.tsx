import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./Timer.module.css";

interface TimerProps {
    maxTime: number;
    descriptionOverwrite?: string;
}

function formatTimeLeft(time: number) {
    const minutes = Math.floor(time / 60);
    let seconds: number | string = time % 60;
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
}

function calculateTimeFraction(timeLeft: number, totalTime: number) {
    const rawTimeFraction = timeLeft / totalTime;
    return rawTimeFraction - (1 / totalTime) * (1 - rawTimeFraction);
}

const Timer: React.FC<TimerProps> = ({ maxTime, descriptionOverwrite }) => {
    const [timeLeft, setTimeLeft] = useState(maxTime);
    const pathRef = useRef<SVGPathElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setTimeLeft(maxTime);
    }, [maxTime]);

    const COLOR_CODES = useMemo(() => ({
        info: {
            color: styles.green,
        },
        warning: {
            color: styles.orange,
            threshold: maxTime / 2,
        },
        alert: {
            color: styles.red,
            threshold: maxTime / 4,
        },
    }), [maxTime]);
    const FULL_DASH_ARRAY = pathRef.current ? pathRef.current.getTotalLength() : 0;
    const updatedDashArray = `${(calculateTimeFraction(timeLeft, maxTime) * FULL_DASH_ARRAY).toFixed(0)} ${FULL_DASH_ARRAY}`;

    const pickColor = useCallback(() => {
        if (timeLeft <= COLOR_CODES.alert.threshold) {
            return COLOR_CODES.alert.color;
        } if (timeLeft <= COLOR_CODES.warning.threshold) {
            return COLOR_CODES.warning.color;
        }
        return COLOR_CODES.info.color;
    }, [COLOR_CODES, timeLeft]);

    if (timeLeft > 0) {
        return (
            <div className={styles.wrapper}>
                <h1>{descriptionOverwrite || "Time for action:"}</h1>
                <div className={styles.baseTimer}>
                    <svg className={styles.baseTimerSvg} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <g className={styles.baseTimerCircle}>
                            <circle className={styles.baseTimerPathElapsed} cx="50" cy="50" r="45" />
                            <path
                                id="base-timer-path-remaining"
                                strokeDasharray={`${updatedDashArray}`}
                                className={`${styles.baseTimerPathRemaining} ${pickColor()}`}
                                d="M 50, 50 m -45, 0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0"
                                ref={pathRef}
                            />
                        </g>
                    </svg>
                    <span id="base-timer-label" className={styles.baseTimerLabel}>
                        {formatTimeLeft(timeLeft)}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export { Timer };
