import React, { CSSProperties, useCallback } from "react";

interface CardsSpriteLoaderProps {
    cardId: string;
    classNames?: string;
    styles?: CSSProperties;
}

const CardsSpriteLoader: React.FC<CardsSpriteLoaderProps> = ({ cardId, classNames, styles }) => {
    const pickImgFromSprite = useCallback((): CSSProperties => {
        const splitedCardId = cardId.split("-");
        let xOffset = "0";
        let yOffset = "0";
        switch (splitedCardId[0]) {
            case "H":
                yOffset = "0px";
                break;
            case "D":
                yOffset = "33%";
                break;
            case "C":
                yOffset = "66%";
                break;
            case "S":
                yOffset = "100%";
                break;
        }
        switch (splitedCardId[1]) {
            case "A":
                xOffset = "0%";
                break;
            case "J":
                xOffset = "83.33%";
                break;
            case "Q":
                xOffset = "91.66%";
                break;
            case "K":
                xOffset = "100%";
                break;
            default:
                xOffset = `${(parseFloat(splitedCardId[1]) - 1) * 8.33}%`;
                break;
        }
        return {
            width: "100%",
            height: "100%",
            background: `url(./Graphics/cardsBitmap.png) ${xOffset} ${yOffset}`,
            backgroundSize: "1400%",
            outline: 0,
        };
    }, [cardId]);

    return (
        <div
            style={{ width: "100px", height: "150px", ...styles }}
            className={classNames}
        >
            <img
                style={pickImgFromSprite()}
                alt={`Card ${cardId}`}
                src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
            />
        </div>
    );
};

export { CardsSpriteLoader };
