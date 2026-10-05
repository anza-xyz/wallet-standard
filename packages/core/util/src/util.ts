import { getAddressDecoder } from '@solana/addresses';

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

/**
 * @internal
 *
 * Check that an address is the base58 encoding of a public key.
 *
 * @param address An address.
 * @param publicKey A public key.
 *
 * @return `true` if the public key is 32 bytes and its encoding matches the address, `false` otherwise.
 *
 * @group Internal
 */
export function addressMatchesPublicKey(address: string, publicKey: Uint8Array): boolean {
    // The decoder reads only the first 32 bytes and throws on fewer, so check the length explicitly.
    if (publicKey.length !== 32) return false;
    return getAddressDecoder().decode(publicKey) === address;
}

/**
 * @internal
 *
 * Copy bytes provided by a wallet, so they're read exactly once. A wallet can provide a `Proxy` or other object that
 * returns different bytes on each read, so the bytes that are checked and the bytes that are verified must be the same
 * copy.
 *
 * @param bytes Bytes provided by a wallet.
 *
 * @return A copy of the bytes, or `null` if they aren't a `Uint8Array`.
 *
 * @group Internal
 */
export function copyBytes(bytes: unknown): Uint8Array | null {
    // Accept a `Uint8Array` from another realm, the same way `@noble/curves` does.
    if (!(bytes instanceof Uint8Array || (ArrayBuffer.isView(bytes) && bytes.constructor.name === 'Uint8Array'))) {
        return null;
    }
    return Uint8Array.from(bytes as Uint8Array);
}
