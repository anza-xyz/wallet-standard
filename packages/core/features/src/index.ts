import type { WalletWithFeatures } from '@wallet-standard/base';
import type { SolanaSignAndSendTransactionFeature } from './signAndSendTransaction.js';
import type { SolanaSignInFeature } from './signIn.js';
import type { SolanaSignMessageFeature } from './signMessage.js';
import type { SolanaSignTransactionFeature } from './signTransaction.js';
import type { SolanaGetClusterFeature } from './getCluster.js';
import type { SolanaSetClusterFeature } from './setCluster.js';

/** TODO: docs */
export type SolanaFeatures =
    | SolanaSignAndSendTransactionFeature
    | SolanaSignInFeature
    | SolanaSignMessageFeature
    | SolanaSignTransactionFeature
    | SolanaGetClusterFeature
    | SolanaSetClusterFeature;

/** TODO: docs */
export type WalletWithSolanaFeatures = WalletWithFeatures<SolanaFeatures>;

export * from './signAndSendTransaction.js';
export * from './signIn.js';
export * from './signMessage.js';
export * from './signTransaction.js';
export * from './getCluster.js';
export * from './setCluster.js';
