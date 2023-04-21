export type Player = {
    id: string;
    name: string;
    bet: {
        currentBet: number;
        previousBet: number;
    };
    seatNumber: number;
};
