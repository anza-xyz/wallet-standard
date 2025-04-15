/** Name of the feature. */
export const SolanaGetEphemeralSigners = 'solana:getEphemeralSigners' as const;

/**
 * Provides a secure way to request ephemeral signer addresses from the wallet.
 * Ephemeral Signers are the addresses that can be used to sign a specific transaction once
 * and be discarded after that.
 * The wallet is responsible for:
 * 1. secure generation and keeping track of the addresses;
 * 2. making sure that the addresses sign the transactions where they are mentioned as signers;
 */
export type SolanaGetEphemeralSignersFeature = {
    /** Name of the feature. */
    readonly [SolanaGetEphemeralSigners]: {
        /** Version of the feature API. */
        readonly version: SolanaGetEphemeralSignersVersion;

        /** Get any number of ephemeral signer addresses. */
        readonly getEphemeralSigners: SolanaGetEphemeralSignersMethod;
    };
};

/** Version of the feature. */
export type SolanaGetEphemeralSignersVersion = '1.0.0';

/** Get any number of ephemeral signer addresses. */
export type SolanaGetEphemeralSignersMethod = (numberOfSigners: number) => Promise<readonly string[]>;
