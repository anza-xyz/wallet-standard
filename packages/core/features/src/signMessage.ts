import type { WalletAccount } from '@wallet-standard/base';

/** TODO: docs */
export type SolanaSignMessageFeature = {
    /** Namespace for the feature. */
    'solana:signMessage': {
        /** Version of the feature API. */
        version: SolanaSignMessageVersion;

        /** Sign messages (arbitrary bytes) using the account's secret key. */
        signMessage: SolanaSignMessageMethod;
    };
};

/** TODO: docs */
export type SolanaSignMessageVersion = '1.0.0';

/** TODO: docs */
export type SolanaSignMessageMethod = (...inputs: SolanaSignMessageInput[]) => Promise<SolanaSignMessageOutput[]>;

/** Input for signing a message. */
export interface SolanaSignMessageInput {
    /** Account to use. */
    account: WalletAccount;

    /** Message to sign, as raw bytes. */
    message: Uint8Array;
}

/** Output of signing a message. */
export interface SolanaSignMessageOutput {
    /** TODO: docs */
    signedMessage: Uint8Array;

    /** TODO: docs */
    signature: Uint8Array;
}
