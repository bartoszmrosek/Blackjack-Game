import { useEffect, useState } from "react";

const useSize = (): { width: number; height: number; } => {
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);

    useEffect(() => {
        const updateSizes = () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        };
        window.addEventListener("resize", updateSizes);
        return () => window.removeEventListener("resize", updateSizes);
    }, []);

    return { width, height };
};

export { useSize };
