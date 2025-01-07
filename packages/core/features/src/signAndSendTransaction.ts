import type { IdentifierString } from '@wallet-standard/base';
import type {
    SolanaSignTransactionInput,
    SolanaSignTransactionOptions,
    SolanaTransactionCommitment,
    SolanaTransactionVersion,
} from './signTransaction.js';

/** Name of the feature. */
export const SolanaSignAndSendTransaction = 'solana:signAndSendTransaction';

/** TODO: docs */
export type SolanaSignAndSendTransactionFeature = {
    /** Name of the feature. */
    readonly [SolanaSignAndSendTransaction]: {
        /** Version of the feature API. */
        readonly version: SolanaSignAndSendTransactionVersion;

        /** TODO: docs */
        readonly supportedTransactionVersions: readonly SolanaTransactionVersion[];

        /**
         * Sign transactions using the account's secret key and send them to the chain.
         *
         * @param inputs Inputs for signing and sending transactions.
         *
         * @return Outputs of signing and sending transactions.
         */
        readonly signAndSendTransaction: SolanaSignAndSendTransactionMethod;
    };
};

/** Version of the feature. */
export type SolanaSignAndSendTransactionVersion = '1.0.0';

/** TODO: docs */
export type SolanaSignAndSendTransactionMethod = (
    ...inputs: readonly SolanaSignAndSendTransactionInput[]
) => Promise<readonly SolanaSignAndSendTransactionOutput[]>;

/** Input for signing and sending a transaction. */
export interface SolanaSignAndSendTransactionInput extends SolanaSignTransactionInput {
    /** Chain to use. */
    readonly chain: IdentifierString;

    /** TODO: docs */
    readonly options?: SolanaSignAndSendTransactionOptions;
}

/** Output of signing and sending a transaction. */
export interface SolanaSignAndSendTransactionOutput {
    /** Transaction signature, as raw bytes. */
    readonly signature: Uint8Array;
}

/** Options for signing and sending a transaction. */
export type SolanaSignAndSendTransactionOptions = SolanaSignTransactionOptions & {
    /** Desired commitment level. If provided, confirm the transaction after sending. */
    readonly commitment?: SolanaTransactionCommitment;

    /** Disable transaction verification at the RPC. */
    readonly skipPreflight?: boolean;

    /** Maximum number of times for the RPC node to retry sending the transaction to the leader. */
    readonly maxRetries?: number;
};
