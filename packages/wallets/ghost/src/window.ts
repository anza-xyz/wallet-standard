import type { PublicKey, SendOptions, Transaction, TransactionSignature, VersionedTransaction } from '@solana/web3.js';

export interface GhostEvent {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
    accountChanged(...args: unknown[]): unknown;
}

export interface GhostEventEmitter {
    on<E extends keyof GhostEvent>(event: E, listener: GhostEvent[E], context?: any): void;
    off<E extends keyof GhostEvent>(event: E, listener: GhostEvent[E], context?: any): void;
}

export interface Ghost extends GhostEventEmitter {
    publicKey: PublicKey | null;
    connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }>;
    disconnect(): Promise<void>;
    signAndSendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }>;
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
}
