import type { Transaction, VersionedTransaction } from '@solana/web3.js';

/** @internal */
export function isVersionedTransaction(
    transaction: Transaction | VersionedTransaction
): transaction is VersionedTransaction {
    return 'version' in transaction;
}
