export function transformImgUrl(url: string): string {
    if (import.meta.env.PROD) {
        return `/Blackjack-Game${url}`;
    }
    return url;
}
