import type { WalletAccount } from '@wallet-standard/base';

/** Name of the feature. */
export const SolanaSignMessage = 'solana:signMessage';

/** TODO: docs */
export type SolanaSignMessageFeature = {
    /** Name of the feature. */
    readonly [SolanaSignMessage]: {
        /** Version of the feature API. */
        readonly version: SolanaSignMessageVersion;

        /** Sign messages (arbitrary bytes) using the account's secret key. */
        readonly signMessage: SolanaSignMessageMethod;
    };
};

/** TODO: docs */
export type SolanaSignMessageVersion = '1.0.0';

/** TODO: docs */
export type SolanaSignMessageMethod = (
    ...inputs: readonly SolanaSignMessageInput[]
) => Promise<readonly SolanaSignMessageOutput[]>;

/** Input for signing a message. */
export interface SolanaSignMessageInput {
    /** Account to use. */
    readonly account: WalletAccount;

    /** Message to sign, as raw bytes. */
    readonly message: Uint8Array;
}

/** Output of signing a message. */
export interface SolanaSignMessageOutput {
    /** TODO: docs */
    readonly signedMessage: Uint8Array;

    /** TODO: docs */
    readonly signature: Uint8Array;
}
