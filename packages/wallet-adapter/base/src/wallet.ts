import { type Adapter, isVersionedTransaction, WalletReadyState } from '@solana/wallet-adapter-base';
import { isSolanaChain, type SolanaChain } from '@solana/wallet-standard-chains';
import {
    SolanaSignAndSendTransaction,
    type SolanaSignAndSendTransactionFeature,
    type SolanaSignAndSendTransactionMethod,
    type SolanaSignAndSendTransactionOutput,
    SolanaSignIn,
    type SolanaSignInFeature,
    type SolanaSignInMethod,
    type SolanaSignInOutput,
    SolanaSignMessage,
    type SolanaSignMessageFeature,
    type SolanaSignMessageMethod,
    type SolanaSignMessageOutput,
    SolanaSignTransaction,
    type SolanaSignTransactionFeature,
    type SolanaSignTransactionMethod,
    type SolanaSignTransactionOutput,
    type SolanaTransactionVersion,
} from '@solana/wallet-standard-features';
import { getEndpointForChain } from '@solana/wallet-standard-util';
import { Connection, Transaction, VersionedTransaction } from '@solana/web3.js';
import { getWallets } from '@wallet-standard/app';
import type { Wallet, WalletIcon } from '@wallet-standard/base';
import {
    StandardConnect,
    type StandardConnectFeature,
    type StandardConnectMethod,
    StandardDisconnect,
    type StandardDisconnectFeature,
    type StandardDisconnectMethod,
    StandardEvents,
    type StandardEventsFeature,
    type StandardEventsListeners,
    type StandardEventsNames,
    type StandardEventsOnMethod,
} from '@wallet-standard/features';
import { arraysEqual, bytesEqual, ReadonlyWalletAccount } from '@wallet-standard/wallet';
import bs58 from 'bs58';

/** TODO: docs */
export class SolanaWalletAdapterWalletAccount extends ReadonlyWalletAccount {
    // eslint-disable-next-line no-unused-private-class-members
    readonly #adapter: Adapter;

    constructor({
        adapter,
        address,
        publicKey,
        chains,
    }: {
        adapter: Adapter;
        address: string;
        publicKey: Uint8Array;
        chains: readonly SolanaChain[];
    }) {
        const features: (keyof (SolanaSignAndSendTransactionFeature &
            SolanaSignTransactionFeature &
            SolanaSignMessageFeature &
            SolanaSignInFeature))[] = [SolanaSignAndSendTransaction];
        if ('signTransaction' in adapter) {
            features.push(SolanaSignTransaction);
        }
        if ('signMessage' in adapter) {
            features.push(SolanaSignMessage);
        }
        if ('signIn' in adapter) {
            features.push(SolanaSignIn);
        }

        super({ address, publicKey, chains, features });
        if (new.target === SolanaWalletAdapterWalletAccount) {
            Object.freeze(this);
        }

        this.#adapter = adapter;
    }
}

/** TODO: docs */
export class SolanaWalletAdapterWallet implements Wallet {
    readonly #listeners: {
        [E in StandardEventsNames]?: StandardEventsListeners[E][];
    } = {};
    readonly #adapter: Adapter;
    readonly #supportedTransactionVersions: readonly SolanaTransactionVersion[];
    readonly #chain: SolanaChain;
    readonly #endpoint: string | undefined;
    #account: SolanaWalletAdapterWalletAccount | undefined;

    get version() {
        return '1.0.0' as const;
    }

    get name() {
        return this.#adapter.name;
    }

    get icon() {
        return this.#adapter.icon as WalletIcon;
    }

    get chains() {
        return [this.#chain];
    }

    get features(): StandardConnectFeature &
        StandardDisconnectFeature &
        StandardEventsFeature &
        SolanaSignAndSendTransactionFeature &
        Partial<SolanaSignTransactionFeature & SolanaSignMessageFeature & SolanaSignInFeature> {
        const features: StandardConnectFeature &
            StandardDisconnectFeature &
            StandardEventsFeature &
            SolanaSignAndSendTransactionFeature = {
            [StandardConnect]: {
                version: '1.0.0',
                connect: this.#connect,
            },
            [StandardDisconnect]: {
                version: '1.0.0',
                disconnect: this.#disconnect,
            },
            [StandardEvents]: {
                version: '1.0.0',
                on: this.#on,
            },
            [SolanaSignAndSendTransaction]: {
                version: '1.0.0',
                supportedTransactionVersions: this.#supportedTransactionVersions,
                signAndSendTransaction: this.#signAndSendTransaction,
            },
        };

        let signTransactionFeature: SolanaSignTransactionFeature | undefined;
        if ('signTransaction' in this.#adapter) {
            signTransactionFeature = {
                [SolanaSignTransaction]: {
                    version: '1.0.0',
                    supportedTransactionVersions: this.#supportedTransactionVersions,
                    signTransaction: this.#signTransaction,
                },
            };
        }

        let signMessageFeature: SolanaSignMessageFeature | undefined;
        if ('signMessage' in this.#adapter) {
            signMessageFeature = {
                [SolanaSignMessage]: {
                    version: '1.0.0',
                    signMessage: this.#signMessage,
                },
            };
        }

        let signInFeature: SolanaSignInFeature | undefined;
        if ('signIn' in this.#adapter) {
            signInFeature = {
                [SolanaSignIn]: {
                    version: '1.0.0',
                    signIn: this.#signIn,
                },
            };
        }

        return { ...features, ...signTransactionFeature, ...signMessageFeature };
    }

    get accounts() {
        return this.#account ? [this.#account] : [];
    }

    get endpoint() {
        return this.#endpoint;
    }

    constructor(adapter: Adapter, chain: SolanaChain, endpoint?: string) {
        if (new.target === SolanaWalletAdapterWallet) {
            Object.freeze(this);
        }

        const supportedTransactionVersions = [...(adapter.supportedTransactionVersions || ['legacy'])];
        if (!supportedTransactionVersions.length) {
            supportedTransactionVersions.push('legacy');
        }

        this.#adapter = adapter;
        this.#supportedTransactionVersions = supportedTransactionVersions;
        this.#chain = chain;
        this.#endpoint = endpoint;

        adapter.on('connect', this.#connected, this);
        adapter.on('disconnect', this.#disconnected, this);

        this.#connected();
    }

    destroy(): void {
        this.#adapter.off('connect', this.#connected, this);
        this.#adapter.off('disconnect', this.#disconnected, this);
    }

    #connected(): void {
        const publicKey = this.#adapter.publicKey?.toBytes();
        if (publicKey) {
            const address = this.#adapter.publicKey!.toBase58();
            const account = this.#account;
            if (
                !account ||
                account.address !== address ||
                account.chains.includes(this.#chain) ||
                !bytesEqual(account.publicKey, publicKey)
            ) {
                this.#account = new SolanaWalletAdapterWalletAccount({
                    adapter: this.#adapter,
                    address,
                    publicKey,
                    chains: [this.#chain],
                });
                this.#emit('change', { accounts: this.accounts });
            }
        }
    }

    #disconnected(): void {
        if (this.#account) {
            this.#account = undefined;
            this.#emit('change', { accounts: this.accounts });
        }
    }

    #connect: StandardConnectMethod = async ({ silent } = {}) => {
        if (!silent && !this.#adapter.connected) {
            await this.#adapter.connect();
        }

        this.#connected();

        return { accounts: this.accounts };
    };

    #disconnect: StandardDisconnectMethod = async () => {
        await this.#adapter.disconnect();
    };

    #on: StandardEventsOnMethod = (event, listener) => {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    };

    #emit<E extends StandardEventsNames>(event: E, ...args: Parameters<StandardEventsListeners[E]>): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends StandardEventsNames>(event: E, listener: StandardEventsListeners[E]): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }

    #deserializeTransaction(serializedTransaction: Uint8Array): Transaction | VersionedTransaction {
        const transaction = VersionedTransaction.deserialize(serializedTransaction);
        if (!this.#supportedTransactionVersions.includes(transaction.version))
            throw new Error('unsupported transaction version');
        if (transaction.version === 'legacy' && arraysEqual(this.#supportedTransactionVersions, ['legacy']))
            return Transaction.from(serializedTransaction);
        return transaction;
    }

    #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
        const outputs: SolanaSignAndSendTransactionOutput[] = [];

        if (inputs.length === 1) {
            const input = inputs[0]!;
            if (input.account !== this.#account) throw new Error('invalid account');
            if (!isSolanaChain(input.chain)) throw new Error('invalid chain');
            const transaction = this.#deserializeTransaction(input.transaction);
            const { commitment, preflightCommitment, skipPreflight, maxRetries, minContextSlot } = input.options || {};
            const endpoint = getEndpointForChain(input.chain, this.#endpoint);
            const connection = new Connection(endpoint, commitment || 'confirmed');

            const latestBlockhash = commitment
                ? await connection.getLatestBlockhash({
                      commitment: preflightCommitment || commitment,
                      minContextSlot,
                  })
                : undefined;

            const signature = await this.#adapter.sendTransaction(transaction, connection, {
                preflightCommitment,
                skipPreflight,
                maxRetries,
                minContextSlot,
            });

            if (latestBlockhash) {
                await connection.confirmTransaction(
                    {
                        ...latestBlockhash,
                        signature,
                    },
                    commitment || 'confirmed'
                );
            }

            outputs.push({ signature: bs58.decode(signature) });
        } else if (inputs.length > 1) {
            // Adapters have no `sendAllTransactions` method, so just sign and send each transaction in serial.
            for (const input of inputs) {
                outputs.push(...(await this.#signAndSendTransaction(input)));
            }
        }

        return outputs;
    };

    #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
        if (!('signTransaction' in this.#adapter)) throw new Error('signTransaction not implemented by adapter');
        const outputs: SolanaSignTransactionOutput[] = [];

        if (inputs.length === 1) {
            const input = inputs[0]!;
            if (input.account !== this.#account) throw new Error('invalid account');
            if (input.chain && !isSolanaChain(input.chain)) throw new Error('invalid chain');
            const transaction = this.#deserializeTransaction(input.transaction);

            const signedTransaction = await this.#adapter.signTransaction(transaction);

            const serializedTransaction = isVersionedTransaction(signedTransaction)
                ? signedTransaction.serialize()
                : new Uint8Array(
                      signedTransaction.serialize({
                          requireAllSignatures: false,
                          verifySignatures: false,
                      })
                  );

            outputs.push({ signedTransaction: serializedTransaction });
        } else if (inputs.length > 1) {
            for (const input of inputs) {
                if (input.account !== this.#account) throw new Error('invalid account');
                if (input.chain && !isSolanaChain(input.chain)) throw new Error('invalid chain');
            }
            const transactions = inputs.map(({ transaction }) => this.#deserializeTransaction(transaction));

            const signedTransactions = await this.#adapter.signAllTransactions(transactions);

            outputs.push(
                ...signedTransactions.map((signedTransaction) => {
                    const serializedTransaction = isVersionedTransaction(signedTransaction)
                        ? signedTransaction.serialize()
                        : new Uint8Array(
                              signedTransaction.serialize({
                                  requireAllSignatures: false,
                                  verifySignatures: false,
                              })
                          );

                    return { signedTransaction: serializedTransaction };
                })
            );
        }

        return outputs;
    };

    #signMessage: SolanaSignMessageMethod = async (...inputs) => {
        if (!('signMessage' in this.#adapter)) throw new Error('signMessage not implemented by adapter');
        const outputs: SolanaSignMessageOutput[] = [];

        if (inputs.length === 1) {
            const input = inputs[0]!;
            if (input.account !== this.#account) throw new Error('invalid account');

            const signature = await this.#adapter.signMessage(input.message);

            outputs.push({ signedMessage: input.message, signature });
        } else if (inputs.length > 1) {
            // Adapters have no `signAllMessages` method, so just sign each message in serial.
            for (const input of inputs) {
                outputs.push(...(await this.#signMessage(input)));
            }
        }

        return outputs;
    };

    #signIn: SolanaSignInMethod = async (...inputs) => {
        if (!('signIn' in this.#adapter)) throw new Error('signIn not implemented by adapter');

        if (inputs.length > 1) {
            // Adapters don't support `signIn` with multiple inputs, so just sign in with each input in serial.
            const outputs: SolanaSignInOutput[] = [];
            for (const input of inputs) {
                outputs.push(await this.#adapter.signIn(input));
            }
            return outputs;
        } else {
            return [await this.#adapter.signIn(inputs[0])];
        }
    };
}

/** TODO: docs */
export function registerWalletAdapter(
    adapter: Adapter,
    chain: SolanaChain,
    endpoint?: string,
    match: (wallet: Wallet) => boolean = (wallet) => wallet.name === adapter.name
): () => void {
    const { register, get, on } = getWallets();
    const destructors: (() => void)[] = [];

    function destroy(): void {
        destructors.forEach((destroy) => destroy());
        destructors.length = 0;
    }

    function setup(): boolean {
        // If the adapter is unsupported, or a standard wallet that matches it has already been registered, do nothing.
        if (adapter.readyState === WalletReadyState.Unsupported || get().some(match)) return true;

        // If the adapter isn't ready, try again later.
        const ready =
            adapter.readyState === WalletReadyState.Installed || adapter.readyState === WalletReadyState.Loadable;
        if (ready) {
            const wallet = new SolanaWalletAdapterWallet(adapter, chain, endpoint);
            destructors.push(() => wallet.destroy());
            // Register the adapter wrapped as a standard wallet, and receive a function to unregister the adapter.
            destructors.push(register(wallet));
            // Whenever a standard wallet is registered ...
            destructors.push(
                on('register', (...wallets) => {
                    // ... check if it matches the adapter.
                    if (wallets.some(match)) {
                        // If it does, remove the event listener and unregister the adapter.
                        destroy();
                    }
                })
            );
        }
        return ready;
    }

    if (!setup()) {
        function listener(): void {
            if (setup()) {
                adapter.off('readyStateChange', listener);
            }
        }

        adapter.on('readyStateChange', listener);
        destructors.push(() => adapter.off('readyStateChange', listener));
    }

    return destroy;
}
