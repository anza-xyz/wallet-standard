import type { IdentifierString, WalletAccount } from '@wallet-standard/base';

/** TODO: docs */
export type SolanaSignTransactionFeature = {
    /** Namespace for the feature. */
    'solana:signTransaction': {
        /** Version of the feature API. */
        version: SolanaSignTransactionVersion;

        /** TODO: docs */
        supportedTransactionVersions: ReadonlyArray<SolanaTransactionVersion>;

        /**
         * Sign transactions using the account's secret key.
         *
         * @param inputs Inputs for signing transactions.
         *
         * @return Outputs of signing transactions.
         */
        signTransaction: SolanaSignTransactionMethod;
    };
};

/** TODO: docs */
export type SolanaSignTransactionVersion = '1.0.0';

/** TODO: docs */
export type SolanaTransactionVersion = 'legacy' | 0;

/** TODO: docs */
export type SolanaSignTransactionMethod = (
    ...inputs: SolanaSignTransactionInput[]
) => Promise<SolanaSignTransactionOutput[]>;

/** Input for signing a transaction. */
export interface SolanaSignTransactionInput {
    /** Account to use. */
    account: WalletAccount;

    /** Serialized transaction, as raw bytes. */
    transaction: Uint8Array;

    /** Chain to use. */
    chain?: IdentifierString;

    /** TODO: docs */
    options?: SolanaSignTransactionOptions;
}

/** Output of signing a transaction. */
export interface SolanaSignTransactionOutput {
    /**
     * Signed, serialized transaction, as raw bytes.
     * Returning a transaction rather than signatures allows multisig wallets, program wallets, and other wallets that
     * use meta-transactions to return a modified, signed transaction.
     */
    signedTransaction: Uint8Array;
}

/** Options for signing a transaction. */
export type SolanaSignTransactionOptions = {
    /** Preflight commitment level. */
    preflightCommitment?: SolanaTransactionCommitment;
    /** The minimum slot that the request can be evaluated at. */
    minContextSlot?: number;
};

/** Commitment level for transactions. */
export type SolanaTransactionCommitment = 'processed' | 'confirmed' | 'finalized';
