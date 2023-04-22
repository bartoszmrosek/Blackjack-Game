export function updateArrAt<T>(array: T[], at: number, item: T): T[] {
    return [
        ...array.slice(0, at),
        item,
        ...array.slice(at + 1),
    ];
}
