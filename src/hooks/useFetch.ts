import { useState } from "react";

type UseFetchTypeReturn<T> = Readonly<[boolean, number, T | null, (requestBody: unknown) => void]>;

const useFetch = <T>(url: string,
    method: "GET" | "POST",
    shouldFireImmedietly: boolean, defaultBody: unknown): UseFetchTypeReturn<T> => {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(0);
    const [data, setData] = useState<T | null>(null);

    const makeRequest = (requestBody: unknown) => {
        setIsLoading(true);
        fetch(url, {
            method,
            credentials: "include",
            body: JSON.stringify(requestBody),
        }).then((response) => {
            if (response.ok) {
                response.json().then((resource: T) => {
                    setData(resource);
                }, () => {
                    setStatus(1);
                });
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

    return [
        isLoading,
        status,
        data,
        makeRequest,
    ] as const;
};

export { useFetch };
