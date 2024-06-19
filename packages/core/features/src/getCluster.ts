import type { IdentifierString } from '@wallet-standard/base';

/** Name of the feature. */
export const SolanaGetCluster = 'solana:getCluster';

/** Represents the feature for getting the current Solana cluster name. */
export type SolanaGetClusterFeature = {
    /** Name of the feature. */
    readonly [SolanaGetCluster]: {
        /** Version of the feature API. */
        readonly version: SolanaGetClusterVersion;

        /**
         * Method to get the current Solana cluster name.
         * This method interacts with wallet to get currently enabled Solana cluster.
         *
         * @returns {Promise<readonly SolanaGetClusterOutput>} A promise that resolves to Solana cluster name.
         */
        readonly getCluster: SolanaGetClusterMethod;
    };
};

/** Version of the feature API. */
export type SolanaGetClusterVersion = '1.0.0';

/**
 * Method to get the current Solana cluster name.
 * This method returns a promise that resolves to Solana cluster name.
 *
 * @returns {Promise<readonly SolanaGetClusterOutput>} A promise that resolves to Solana cluster name.
 */
export type SolanaGetClusterMethod = () => Promise<SolanaGetClusterOutput>;

/** Output type representing the Solana cluster information. */
export type SolanaGetClusterOutput = IdentifierString;
