import type { WalletWithFeatures } from '@wallet-standard/base';
import type { SolanaSignAndSendTransactionFeature } from './signAndSendTransaction.js';
import type { SolanaSignInFeature } from './signIn.js';
import type { SolanaSignMessageFeature } from './signMessage.js';
import type { SolanaSignTransactionFeature } from './signTransaction.js';
import type { SolanaSignAndSendAllTransactionsFeature } from './signAndSendAllTransactions.js';
import type { SolanaSignOffchainMessageFeature } from './signOffchainMessage.js';

/** TODO: docs */
export type SolanaFeatures =
    | SolanaSignAndSendTransactionFeature
    | SolanaSignInFeature
    | SolanaSignMessageFeature
    | SolanaSignTransactionFeature
    | SolanaSignAndSendAllTransactionsFeature
    | SolanaSignOffchainMessageFeature;

/** TODO: docs */
export type WalletWithSolanaFeatures = WalletWithFeatures<SolanaFeatures>;

export * from './signAndSendTransaction.js';
export * from './signIn.js';
export * from './signMessage.js';
export * from './signTransaction.js';
export * from './signAndSendAllTransactions.js';
export * from './signOffchainMessage.js';
