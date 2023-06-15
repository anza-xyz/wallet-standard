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
    /**
     * Optional EIP-4361 Domain.
     * If not provided, the wallet must determine the Domain to use.
     */
    readonly domain?: string;

    /**
     * Optional account to use, used to determine EIP-4361 Address.
     * If not provided, the wallet must determine the Address to use.
     */
    readonly address?: string;

    /** Optional EIP-4361 Statement. */
    readonly statement?: string;

    /** Optional EIP-4361 URI. */
    readonly uri?: string;

    /** Optional EIP-4361 Version. */
    readonly version?: string;

    /**
     * Optional Chain, as defined by the Wallet Standard.
     * Used instead of EIP-4361 Chain ID.
     */
    readonly chainId?: string;

    /** Optional EIP-4361 Nonce. */
    readonly nonce?: string;

    /** Optional EIP-4361 Issued At. */
    readonly issuedAt?: string;

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
