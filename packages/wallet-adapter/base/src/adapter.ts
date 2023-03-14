import {
    BaseWalletAdapter,
    isVersionedTransaction,
    type SendTransactionOptions,
    type StandardWalletAdapter as StandardWalletAdapterType,
    type SupportedTransactionVersions,
    WalletAccountError,
    type WalletAdapterCompatibleStandardWallet,
    WalletConfigError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    type WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSendTransactionError,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import {
    SolanaSignAndSendTransaction,
    type SolanaSignAndSendTransactionFeature,
    SolanaSignMessage,
    SolanaSignTransaction,
    type SolanaSignTransactionFeature,
} from '@solana/wallet-standard-features';
import { getChainForEndpoint, getCommitment } from '@solana/wallet-standard-util';
import type { Connection, TransactionSignature } from '@solana/web3.js';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import type { WalletAccount } from '@wallet-standard/base';
import {
    StandardConnect,
    StandardDisconnect,
    StandardEvents,
    type StandardEventsListeners,
} from '@wallet-standard/features';
import { arraysEqual } from '@wallet-standard/wallet';
import bs58 from 'bs58';

/** TODO: docs */
export interface StandardWalletAdapterConfig {
    wallet: WalletAdapterCompatibleStandardWallet;
}

/** TODO: docs */
export class StandardWalletAdapter extends BaseWalletAdapter implements StandardWalletAdapterType {
    #account: WalletAccount | null;
    #publicKey: PublicKey | null;
    #connecting: boolean;
    #disconnecting: boolean;
    #off: (() => void) | undefined;
    readonly #wallet: WalletAdapterCompatibleStandardWallet;
    readonly #supportedTransactionVersions: SupportedTransactionVersions;
    readonly #readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.Installed;

    get supportedTransactionVersions() {
        return this.#supportedTransactionVersions;
    }

    get name() {
        return this.#wallet.name as WalletName;
    }

    get icon() {
        return this.#wallet.icon;
    }

    get url() {
        return 'https://github.com/solana-labs/wallet-standard';
    }

    get publicKey() {
        return this.#publicKey;
    }

    get connecting() {
        return this.#connecting;
    }

    get readyState() {
        return this.#readyState;
    }

    get wallet(): WalletAdapterCompatibleStandardWallet {
        return this.#wallet;
    }

    get standard() {
        return true as const;
    }

    constructor({ wallet }: StandardWalletAdapterConfig) {
        super();
        this.#wallet = wallet;

        const supportedTransactionVersions =
            SolanaSignAndSendTransaction in wallet.features
                ? wallet.features[SolanaSignAndSendTransaction].supportedTransactionVersions
                : wallet.features[SolanaSignTransaction].supportedTransactionVersions;
        this.#supportedTransactionVersions = arraysEqual(supportedTransactionVersions, ['legacy'])
            ? null
            : new Set(supportedTransactionVersions);

        this.#account = null;
        this.#publicKey = null;
        this.#connecting = false;
        this.#disconnecting = false;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this.#readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this.#connecting = true;

            if (!this.#wallet.accounts.length) {
                try {
                    await this.#wallet.features[StandardConnect].connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            if (!this.#wallet.accounts.length) throw new WalletAccountError();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const account = this.#wallet.accounts[0]!;

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(account.publicKey);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            this.#off = this.#wallet.features[StandardEvents].on('change', this.#changed);
            this.#connected(account, publicKey);
            this.emit('connect', publicKey);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this.#connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        if (StandardDisconnect in this.#wallet.features) {
            try {
                this.#disconnecting = true;
                await this.#wallet.features[StandardDisconnect].disconnect();
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            } finally {
                this.#disconnecting = false;
            }
        }

        this.#disconnected();
        this.emit('disconnect');
    }

    #connected(account: WalletAccount, publicKey: PublicKey): void;
    #connected(account: null, publicKey: null): void;
    #connected(account: WalletAccount | null, publicKey: PublicKey | null) {
        this.#account = account;
        this.#publicKey = publicKey;

        if (account?.features.includes(SolanaSignTransaction)) {
            this.signTransaction = this.#signTransaction;
            this.signAllTransactions = this.#signAllTransactions;
        } else {
            delete this.signTransaction;
            delete this.signAllTransactions;
        }

        if (account?.features.includes(SolanaSignMessage)) {
            this.signMessage = this.#signMessage;
        } else {
            delete this.signMessage;
        }
    }

    #disconnected(): void {
        const off = this.#off;
        if (off) {
            this.#off = undefined;
            off();
        }

        this.#connected(null, null);
    }

    #changed: StandardEventsListeners['change'] = (properties) => {
        // If the adapter is disconnecting, or isn't connected, or the change doesn't include accounts, do nothing.
        if (this.#disconnecting || !this.#account || !this.#publicKey || !('accounts' in properties)) return;

        const account = this.#wallet.accounts[0];
        // If there's no connected account, disconnect the adapter.
        if (!account) {
            this.#disconnected();
            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
            return;
        }

        // If the account hasn't actually changed, do nothing.
        if (account === this.#account) return;

        let publicKey: PublicKey;
        // If the account public key isn't valid, disconnect the adapter.
        try {
            publicKey = new PublicKey(account.publicKey);
        } catch (error: any) {
            this.#disconnected();
            this.emit('error', new WalletPublicKeyError(error?.message));
            this.emit('disconnect');
            return;
        }

        // Change the adapter's account and public key and emit an event.
        this.#connected(account, publicKey);
        this.emit('connect', publicKey);
    };

    async sendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            const account = this.#account;
            if (!account) throw new WalletNotConnectedError();

            let feature: typeof SolanaSignAndSendTransaction | typeof SolanaSignTransaction;
            if (SolanaSignAndSendTransaction in this.#wallet.features) {
                if (account.features.includes(SolanaSignAndSendTransaction)) {
                    feature = SolanaSignAndSendTransaction;
                } else if (
                    SolanaSignTransaction in this.#wallet.features &&
                    account.features.includes(SolanaSignTransaction)
                ) {
                    feature = SolanaSignTransaction;
                } else {
                    throw new WalletAccountError();
                }
            } else if (SolanaSignTransaction in this.#wallet.features) {
                if (!account.features.includes(SolanaSignTransaction)) throw new WalletAccountError();
                feature = SolanaSignTransaction;
            } else {
                throw new WalletConfigError();
            }

            const chain = getChainForEndpoint(connection.rpcEndpoint);
            if (!account.chains.includes(chain)) throw new WalletSendTransactionError();

            try {
                const { signers, ...sendOptions } = options;

                let serializedTransaction: Uint8Array;
                if (isVersionedTransaction(transaction)) {
                    signers?.length && transaction.sign(signers);
                    serializedTransaction = transaction.serialize();
                } else {
                    transaction = (await this.prepareTransaction(transaction, connection, sendOptions)) as T;
                    signers?.length && (transaction as Transaction).partialSign(...signers);
                    serializedTransaction = new Uint8Array(
                        (transaction as Transaction).serialize({
                            requireAllSignatures: false,
                            verifySignatures: false,
                        })
                    );
                }

                if (feature === SolanaSignAndSendTransaction) {
                    const [output] = await (this.#wallet.features as SolanaSignAndSendTransactionFeature)[
                        SolanaSignAndSendTransaction
                    ].signAndSendTransaction({
                        account,
                        chain,
                        transaction: serializedTransaction,
                        options: {
                            preflightCommitment: getCommitment(
                                sendOptions.preflightCommitment || connection.commitment
                            ),
                            skipPreflight: sendOptions.skipPreflight,
                            maxRetries: sendOptions.maxRetries,
                            minContextSlot: sendOptions.minContextSlot,
                        },
                    });

                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    return bs58.encode(output!.signature);
                } else {
                    const [output] = await (this.#wallet.features as SolanaSignTransactionFeature)[
                        SolanaSignTransaction
                    ].signTransaction({
                        account,
                        chain,
                        transaction: serializedTransaction,
                        options: {
                            preflightCommitment: getCommitment(
                                sendOptions.preflightCommitment || connection.commitment
                            ),
                            minContextSlot: sendOptions.minContextSlot,
                        },
                    });

                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    return await connection.sendRawTransaction(output!.signedTransaction, {
                        ...sendOptions,
                        preflightCommitment: getCommitment(sendOptions.preflightCommitment || connection.commitment),
                    });
                }
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    signTransaction: (<T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>) | undefined;
    async #signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        try {
            const account = this.#account;
            if (!account) throw new WalletNotConnectedError();

            if (!(SolanaSignTransaction in this.#wallet.features)) throw new WalletConfigError();
            if (!account.features.includes(SolanaSignTransaction)) throw new WalletAccountError();

            try {
                const signedTransactions = await this.#wallet.features[SolanaSignTransaction].signTransaction({
                    account,
                    transaction: isVersionedTransaction(transaction)
                        ? transaction.serialize()
                        : new Uint8Array(
                              transaction.serialize({
                                  requireAllSignatures: false,
                                  verifySignatures: false,
                              })
                          ),
                });

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const serializedTransaction = signedTransactions[0]!.signedTransaction;

                return (
                    isVersionedTransaction(transaction)
                        ? VersionedTransaction.deserialize(serializedTransaction)
                        : Transaction.from(serializedTransaction)
                ) as T;
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    signAllTransactions: (<T extends Transaction | VersionedTransaction>(transaction: T[]) => Promise<T[]>) | undefined;
    async #signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
        try {
            const account = this.#account;
            if (!account) throw new WalletNotConnectedError();

            if (!(SolanaSignTransaction in this.#wallet.features)) throw new WalletConfigError();
            if (!account.features.includes(SolanaSignTransaction)) throw new WalletSignTransactionError();

            try {
                const signedTransactions = await this.#wallet.features[SolanaSignTransaction].signTransaction(
                    ...transactions.map((transaction) => ({
                        account,
                        transaction: isVersionedTransaction(transaction)
                            ? transaction.serialize()
                            : new Uint8Array(
                                  transaction.serialize({
                                      requireAllSignatures: false,
                                      verifySignatures: false,
                                  })
                              ),
                    }))
                );

                return transactions.map((transaction, index) => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const signedTransaction = signedTransactions[index]!.signedTransaction;

                    return (
                        isVersionedTransaction(transaction)
                            ? VersionedTransaction.deserialize(signedTransaction)
                            : Transaction.from(signedTransaction)
                    ) as T;
                });
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | undefined;
    async #signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            const account = this.#account;
            if (!account) throw new WalletNotConnectedError();

            if (!(SolanaSignMessage in this.#wallet.features)) throw new WalletConfigError();
            if (!account.features.includes(SolanaSignMessage)) throw new WalletSignMessageError();

            try {
                const signedMessages = await this.#wallet.features[SolanaSignMessage].signMessage({
                    account,
                    message,
                });

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return signedMessages[0]!.signature;
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
