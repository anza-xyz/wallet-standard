/**
 * @internal
 *
 * Type with a numeric `length` and numerically indexed elements of a generic type `T`.
 *
 * For example, `Array<T>` and `Uint8Array`.
 *
 * @group Internal
 */
export interface Indexed<T> {
    length: number;
    [index: number]: T;
}

/**
 * @internal
 *
 * Efficiently compare {@link Indexed} arrays (e.g. `Array` and `Uint8Array`).
 *
 * @param a An array.
 * @param b Another array.
 *
 * @return `true` if the arrays have the same length and elements, `false` otherwise.
 *
 * @group Internal
 */
export function arraysEqual<T>(a: Indexed<T>, b: Indexed<T>): boolean {
    if (a === b) return true;

    const length = a.length;
    if (length !== b.length) return false;

    for (let i = 0; i < length; i++) {
        if (a[i] !== b[i]) return false;
    }

    return true;
}

/**
 * @internal
 *
 * Efficiently compare byte arrays, using {@link arraysEqual}.
 *
 * @param a A byte array.
 * @param b Another byte array.
 *
 * @return `true` if the byte arrays have the same length and bytes, `false` otherwise.
 *
 * @group Internal
 */
export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
    return arraysEqual(a, b);
}
