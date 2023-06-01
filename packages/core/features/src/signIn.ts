import type { IdentifierString, WalletAccount } from '@wallet-standard/base';

/** Name of the feature. */
export const SolanaSignIn = 'solana:signIn';

/** TODO: docs */
export type SolanaSignInFeature = {
    /** Name of the feature. */
    readonly [SolanaSignIn]: {
        /** Version of the feature API. */
        readonly version: SolanaSignInVersion;

        /** Sign In With Solana (based on https://eips.ethereum.org/EIPS/eip-4361 and https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-122.md). */
        readonly signIn: SolanaSignInMethod;
    };
};

/** Version of the feature. */
export type SolanaSignInVersion = '1.0.0';

/** TODO: docs */
export type SolanaSignInMethod = (...inputs: readonly SolanaSignInInput[]) => Promise<readonly SolanaSignInOutput[]>;

/** Input for signing in. */
export interface SolanaSignInInput {
    /** EIP-4361 Domain. */
    readonly domain: string;

    /**
     * Optional account to use. If not provided, the wallet must determine the account to use.
     * Used to determine EIP-4361 Address.
     */
    readonly account?: WalletAccount;

    /** Optional EIP-4361 Statement. */
    readonly statement?: string;

    /** EIP-4361 URI. */
    readonly uri: string;

    /** EIP-4361 Version. */
    readonly version: '1';

    /**
     * Chain, as defined by the Wallet Standard.
     * Used instead of EIP-4361 Chain ID.
     */
    readonly chain: IdentifierString;

    /** EIP-4361 Nonce. */
    readonly nonce: string;

    /** EIP-4361 Issued At. */
    readonly issuedAt: string;

    /** Optional EIP-4361 Expiration Time. */
    readonly expirationTime?: string;

    /** Optional EIP-4361 Not Before. */
    readonly notBefore?: string;

    /** Optional EIP-4361 Request ID. */
    readonly requestId?: string;

    /** Optional EIP-4361 Resources. */
    readonly resources?: readonly string[];
}

/** Output of signing in. */
export interface SolanaSignInOutput {
    /** TODO: docs */
    readonly account: WalletAccount;

    /** TODO: docs */
    readonly signedMessage: Uint8Array;

    /** TODO: docs */
    readonly signature: Uint8Array;

    /** TODO: docs */
    readonly signatureType?: string;
}
