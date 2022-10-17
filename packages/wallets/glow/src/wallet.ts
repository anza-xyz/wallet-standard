import type { GlowAdapter, SolanaWindow } from '@glow-xyz/glow-client';
import { Network } from '@glow-xyz/glow-client';
import type {
    SolanaSignAndSendTransactionFeature,
    SolanaSignAndSendTransactionMethod,
    SolanaSignAndSendTransactionOutput,
    SolanaSignTransactionFeature,
    SolanaSignTransactionMethod,
    SolanaSignTransactionOutput,
} from '@solana/wallet-standard-features';
import type { Wallet } from '@wallet-standard/base';
import type {
    ConnectFeature,
    ConnectMethod,
    DisconnectFeature,
    DisconnectMethod,
    EventsFeature,
    EventsListeners,
    EventsNames,
    EventsOnMethod,
    SignMessageFeature,
    SignMessageMethod,
    SignMessageOutput,
} from '@wallet-standard/features';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { GlowWalletAccount } from './account.js';
import { icon } from './icon.js';
import type { SolanaChain } from './solana.js';
import { getNetworkForChain, isSolanaChain, SOLANA_CHAINS } from './solana.js';

declare const window: SolanaWindow;

export type GlowFeature = {
    'glow:': {
        glow: GlowAdapter;
    };
};

export class GlowWallet implements Wallet {
    readonly #listeners: { [E in EventsNames]?: EventsListeners[E][] } = {};
    readonly #version = '1.0.0' as const;
    readonly #name = 'Glow' as const;
    readonly #icon = icon;
    #account: GlowWalletAccount | null = null;

    get version() {
        return this.#version;
    }

    get name() {
        return this.#name;
    }

    get icon() {
        return this.#icon;
    }

    get chains() {
        return SOLANA_CHAINS.slice();
    }

    get features(): ConnectFeature &
        DisconnectFeature &
        EventsFeature &
        SolanaSignAndSendTransactionFeature &
        SolanaSignTransactionFeature &
        SignMessageFeature &
        GlowFeature {
        return {
            'standard:connect': {
                version: '1.0.0',
                connect: this.#connect,
            },
            'standard:disconnect': {
                version: '1.0.0',
                disconnect: this.#disconnect,
            },
            'standard:events': {
                version: '1.0.0',
                on: this.#on,
            },
            'solana:signAndSendTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signAndSendTransaction: this.#signAndSendTransaction,
            },
            'solana:signTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signTransaction: this.#signTransaction,
            },
            'standard:signMessage': {
                version: '1.0.0',
                signMessage: this.#signMessage,
            },
            'glow:': {
                get glow() {
                    return window.glow;
                },
            },
        };
    }

    get accounts() {
        return this.#account ? [this.#account] : [];
    }

    constructor() {
        if (new.target === GlowWallet) {
            Object.freeze(this);
        }

        window.glow.on('connect', this.#connected, this);
        window.glow.on('disconnect', this.#disconnected, this);
        window.glow.on('accountChanged', this.#reconnected, this);

        this.#connected();
    }

    #on: EventsOnMethod = (event, listener) => {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    };

    #emit<E extends EventsNames>(event: E, ...args: Parameters<EventsListeners[E]>): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends EventsNames>(event: E, listener: EventsListeners[E]): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }

    #connected = () => {
        const address = window.glow.address;
        const publicKey = window.glow.publicKey;
        if (address && publicKey) {
            const account = this.#account;
            if (!account || account.address !== address) {
                this.#account = new GlowWalletAccount({
                    address,
                    publicKey: publicKey.toBytes(),
                });
                this.#emit('change', { accounts: this.accounts });
            }
        }
    };

    #disconnected = () => {
        if (this.#account) {
            this.#account = null;
            this.#emit('change', { accounts: this.accounts });
        }
    };

    #reconnected = () => {
        if (window.glow.address && window.glow.publicKey) {
            this.#connected();
        } else {
            this.#disconnected();
        }
    };

    #connect: ConnectMethod = async ({ silent } = {}) => {
        if (!this.#account) {
            await window.glow.connect(silent ? { onlyIfTrusted: true } : undefined);
        }

        this.#connected();

        return { accounts: this.accounts };
    };

    #disconnect: DisconnectMethod = async () => {
        await window.glow.disconnect();
    };

    #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
        if (!this.#account) {
            throw new Error('not connected');
        }

        const outputs: SolanaSignAndSendTransactionOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { transaction, account, chain, options } = inputs[0]!;
            const { commitment } = options || {};
            if (account !== this.#account) {
                throw new Error('invalid account');
            }
            if (!isSolanaChain(chain)) {
                throw new Error('invalid chain');
            }

            const { signature } = await window.glow.signAndSendTransaction({
                transactionBase64: Buffer.from(transaction).toString('base64'),
                network: getNetworkForChain(chain),
                waitForConfirmation: Boolean(commitment),
            });

            outputs.push({ signature: bs58.decode(signature) });
        } else if (inputs.length > 1) {
            for (const input of inputs) {
                outputs.push(...(await this.#signAndSendTransaction(input)));
            }
        }

        return outputs;
    };

    #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
        if (!this.#account) {
            throw new Error('not connected');
        }

        const outputs: SolanaSignTransactionOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { transaction, account, chain } = inputs[0]!;
            if (account !== this.#account) {
                throw new Error('invalid account');
            }
            if (chain && !isSolanaChain(chain)) {
                throw new Error('invalid chain');
            }

            const { signedTransactionBase64 } = await window.glow.signTransaction({
                transactionBase64: Buffer.from(transaction).toString('base64'),
                network: chain ? getNetworkForChain(chain) : Network.Mainnet,
            });

            outputs.push({
                signedTransaction: new Uint8Array(Buffer.from(signedTransactionBase64, 'base64')),
            });
        } else if (inputs.length > 1) {
            let chain: SolanaChain | undefined = undefined;
            for (const input of inputs) {
                if (input.account !== this.#account) {
                    throw new Error('invalid account');
                }
                if (input.chain) {
                    if (!isSolanaChain(input.chain)) {
                        throw new Error('invalid chain');
                    }
                    if (chain) {
                        if (input.chain !== chain) {
                            throw new Error('conflicting chain');
                        }
                    } else {
                        chain = input.chain;
                    }
                }
            }

            const transactionsBase64 = inputs.map(({ transaction }) => Buffer.from(transaction).toString('base64'));

            const { signedTransactionsBase64 } = await window.glow.signAllTransactions({
                transactionsBase64,
                network: chain ? getNetworkForChain(chain) : Network.Mainnet,
            });

            outputs.push(
                ...signedTransactionsBase64.map((signedTransactionBase64) => ({
                    signedTransaction: new Uint8Array(Buffer.from(signedTransactionBase64, 'base64')),
                }))
            );
        }

        return outputs;
    };

    #signMessage: SignMessageMethod = async (...inputs) => {
        if (!this.#account) {
            throw new Error('not connected');
        }

        const outputs: SignMessageOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { message, account } = inputs[0]!;
            if (account !== this.#account) {
                throw new Error('invalid account');
            }

            const { signedMessageBase64 } = await window.glow.signMessage({
                messageBase64: Buffer.from(message).toString('base64'),
            });

            const signature = new Uint8Array(Buffer.from(signedMessageBase64, 'base64'));

            outputs.push({ signedMessage: message, signature });
        } else if (inputs.length > 1) {
            for (const input of inputs) {
                outputs.push(...(await this.#signMessage(input)));
            }
        }

        return outputs;
    };
}
