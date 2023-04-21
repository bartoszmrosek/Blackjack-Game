import React from "react";
import { StyledMainWrapper } from "../../components/StyledMainWrapper/StyledMainWrapper";
import { GoBackButton } from "../../components/Overlays/GoBackButton/GoBackButton";

const Rooms: React.FC = () => {
    return (
        <StyledMainWrapper>

            <GoBackButton />
        </StyledMainWrapper>
    );
};

export { Rooms };
