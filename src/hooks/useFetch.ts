import { useEffect, useState } from "react";

type UseFetchTypeReturn<T> = Readonly<[boolean, number, T | null, (requestBody: unknown) => void]>;

const useFetch = <T>(path: string,
    method: "GET" | "POST",
    shouldFireImmedietly: boolean,
    signal: AbortSignal,
    expectReturn: boolean,
    defaultBody?: unknown,
): UseFetchTypeReturn<T> => {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(0);
    const [data, setData] = useState<T | null>(null);

    const makeRequest = (requestBody: unknown) => {
        setIsLoading(true);
        fetch(
            import.meta.env.PROD
                ? `https://blackjackapi-rpoa.onrender.com/api${path}` :
            `http://localhost:5678/api${path}`,
            {
                method,
                credentials: "include",
                signal,
                body: JSON.stringify(requestBody),
                headers: {
                    "Content-type": "application/json",
                },
            }).then((response) => {
                if (response.ok) {
                    setStatus(response.status);
                    if (expectReturn) {
                        response.json().then((resource: T) => {
                            setData(resource);
                        }, () => {
                            setStatus(1);
                        });
                    }
                } else {
                    setStatus(response.status);
                }
            }).catch(() => {
                setStatus(1);
            }).finally(() => {
                setIsLoading(false);
            });
    };
    if (shouldFireImmedietly) {
        makeRequest(defaultBody);
    }

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status !== 0) {
            setTimeout(() => {
                setData(null);
                setStatus(0);
            }, 10000);
        }
        return () => clearTimeout(timer);
    }, [status, data]);

    return [
        isLoading,
        status,
        data,
        makeRequest,
    ] as const;
};

export { useFetch };
