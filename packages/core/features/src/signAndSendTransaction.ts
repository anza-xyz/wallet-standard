import type { IdentifierString } from '@wallet-standard/base';
import type {
    SolanaSignTransactionInput,
    SolanaSignTransactionOptions,
    SolanaTransactionCommitment,
    SolanaTransactionVersion,
} from './signTransaction.js';

/** TODO: docs */
export type SolanaSignAndSendTransactionFeature = {
    /** Namespace for the feature. */
    'solana:signAndSendTransaction': {
        /** Version of the feature API. */
        version: SolanaSignAndSendTransactionVersion;

        /** TODO: docs */
        supportedTransactionVersions: ReadonlyArray<SolanaTransactionVersion>;

        /**
         * Sign transactions using the account's secret key and send them to the chain.
         *
         * @param inputs Inputs for signing and sending transactions.
         *
         * @return Outputs of signing and sending transactions.
         */
        signAndSendTransaction: SolanaSignAndSendTransactionMethod;
    };
};

/** TODO: docs */
export type SolanaSignAndSendTransactionVersion = '1.0.0';

/** TODO: docs */
export type SolanaSignAndSendTransactionMethod = (
    ...inputs: SolanaSignAndSendTransactionInput[]
) => Promise<SolanaSignAndSendTransactionOutput[]>;

/** Input for signing and sending a transaction. */
export interface SolanaSignAndSendTransactionInput extends SolanaSignTransactionInput {
    /** Chain to use. */
    chain: IdentifierString;

    /** TODO: docs */
    options?: SolanaSignAndSendTransactionOptions;
}

/** Output of signing and sending a transaction. */
export interface SolanaSignAndSendTransactionOutput {
    /** Transaction signature, as raw bytes. */
    signature: Uint8Array;
}

/** Options for signing and sending a transaction. */
export type SolanaSignAndSendTransactionOptions = SolanaSignTransactionOptions & {
    /** Desired commitment level. If provided, confirm the transaction after sending. */
    commitment?: SolanaTransactionCommitment;
    /** Disable transaction verification at the RPC. */
    skipPreflight?: boolean;
    /** Maximum number of times for the RPC node to retry sending the transaction to the leader. */
    maxRetries?: number;
};
