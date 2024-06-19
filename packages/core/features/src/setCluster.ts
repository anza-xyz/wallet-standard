import type { IdentifierString } from '@wallet-standard/base';

/** Name of the setCluster feature. */
export const SolanaSetCluster = 'solana:setCluster';

/** Represents the feature for setting the current Solana cluster. */
export type SolanaSetClusterFeature = {
    /** Name of the setCluster feature. */
    readonly [SolanaSetCluster]: {
        /** Version of the setCluster feature API. */
        readonly version: SolanaSetClusterVersion;

        /**
         * Method to set the current Solana cluster.
         * This method interacts with the wallet to set the currently enabled Solana cluster.
         *
         * @param clusterName - The name of the Solana cluster to set.
         * @returns {Promise<void>} A promise that resolves when the cluster has been set.
         */
        readonly setCluster: SolanaSetClusterMethod;
    };
};

/** Version of the setCluster feature API. */
export type SolanaSetClusterVersion = '1.0.0';

/**
 * Method to set the current Solana cluster.
 * This method returns a promise that resolves when the cluster has been set.
 *
 * @param clusterName - The name of the Solana cluster to set.
 * @returns {Promise<void>} A promise that resolves when the cluster has been set.
 */
export type SolanaSetClusterMethod = (clusterName: SolanaClusterInput) => Promise<void>;

/** Input type representing the Solana cluster to be set. */
export type SolanaClusterInput = IdentifierString;
