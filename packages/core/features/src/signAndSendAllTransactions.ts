import type { SolanaTransactionVersion } from './signTransaction.js';
import type {
    SolanaSignAndSendTransactionInput,
    SolanaSignAndSendTransactionOutput,
} from './signAndSendTransaction.js';

/** Name of the feature */
export const SignAndSendAllTransactions = 'solana:signAndSendAllTransactions';

/** TODO: docs */
export type SolanaSignAndSendAllTransactionsFeature = {
    /** Name of the feature. */
    readonly [SignAndSendAllTransactions]: {
        /** Version of the feature API. */
        readonly version: SolanaSignAndSendAllTransactionsVersion;

        /** TODO: docs */
        readonly supportedTransactionVersions: readonly SolanaTransactionVersion[];

        /**
         * Sign transactions using the account's secret key and send them to the chain.
         *
         * @param inputs {SolanaSignAndSendTransactionInput[]} Inputs for signing and sending multiple transactions.
         * @param options {SolanaSignAndSendAllTransactionsOptions} Options for signing and sending transactions.
         *
         * @return Outputs of signing and sending transactions.
         */
        readonly signAndSendAllTransactions: SolanaSignAndSendAllTransactionsMethod;
    };
};

/** Version of the feature. */
export type SolanaSignAndSendAllTransactionsVersion = '1.0.0';

/** TODO: docs */
export type SolanaSignAndSendAllTransactionsMethod = (
    inputs: readonly SolanaSignAndSendTransactionInput[],
    options?: SolanaSignAndSendAllTransactionsOptions
) => Promise<readonly PromiseSettledResult<SolanaSignAndSendTransactionOutput>[]>;

/** Options for signing and sending multiple transactions. */
export type SolanaSignAndSendAllTransactionsOptions = {
    /** Mode for signing and sending transactions. */
    readonly mode?: SolanaSignAndSendAllTransactionsMode;
};

/** Mode for signing and sending transactions. */
export type SolanaSignAndSendAllTransactionsMode = 'parallel' | 'serial';
