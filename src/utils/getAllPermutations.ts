export function getAllPermutations(firstArr: number[], secondArr: number[]): number[] {
    const res = [];
    for (const firstArrVal of firstArr) {
        for (const secondArrVal of secondArr) {
            res.push(firstArrVal + secondArrVal);
        }
    }
    return res;
}
