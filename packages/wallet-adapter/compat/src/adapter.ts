import type { IdentifierArray, Wallet, WalletAccount, WalletIcon, WalletVersion } from '@wallet-standard/base';
import type { StandardConnectFeature, StandardConnectInput, StandardDisconnectFeature } from '@wallet-standard/features';
import { StandardConnect, StandardDisconnect } from '@wallet-standard/features';
import type { Adapter, WalletName } from '@solana/wallet-adapter-base';
import { SOLANA_CHAINS } from '@solana/wallet-standard-chains';
import type { SolanaSignAndSendTransactionFeature, SolanaSignAndSendTransactionInput, SolanaSignInFeature, SolanaSignInInput, SolanaSignMessageFeature, SolanaSignMessageInput, SolanaSignTransactionFeature, SolanaSignTransactionInput } from '@solana/wallet-standard-features';
import {
    SolanaSignAndSendTransaction,
    SolanaSignIn,
    SolanaSignMessage,
    SolanaSignTransaction,
} from '@solana/wallet-standard-features';
import { Connection, Transaction, VersionedTransaction } from '@solana/web3.js';
import base58 from 'bs58';

type PartialSolanaFeatures = Partial<
    & SolanaSignAndSendTransactionFeature
    & SolanaSignInFeature
    & SolanaSignMessageFeature
    & SolanaSignTransactionFeature
>;
type SupportedFeatures = StandardConnectFeature & StandardDisconnectFeature & PartialSolanaFeatures;

export class SolanaWalletAdapterWallet implements Wallet {
    readonly #adapter: Adapter;

    constructor(adapter: Adapter) {
        this.#adapter = adapter;
    }

    get version(): WalletVersion {
        return '1.0.0';
    }

    get name(): WalletName<string> {
        return this.#adapter.name;
    }

    get icon(): WalletIcon {
        // In Adapter, icon is a string and not constraint to static base64 image.
        // If icon is not a base64 image, return a 1px x 1px transparent gif.
        if (!this.#adapter.icon.startsWith('data:image')) {
            return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        }
        return this.#adapter.icon as WalletIcon;
    }

    get chains(): IdentifierArray {
        return SOLANA_CHAINS;
    }

    get features(): Readonly<SupportedFeatures> {
        const walletAdapter = this.#adapter;
        return {
            [StandardConnect]: {
                version: '1.0.0',
                connect: async (input?: StandardConnectInput) => {
                    await walletAdapter.connect()
                    return {
                        accounts: this.accounts
                    }
                },
            },
            [StandardDisconnect]: {
                version: '1.0.0',
                disconnect: async () => {
                    await walletAdapter.disconnect()
                },
            },
            [SolanaSignAndSendTransaction]: 'sendTransaction' in walletAdapter ? {
                version: '1.0.0',
                supportedTransactionVersions: [0, 'legacy'],
                signAndSendTransaction: async (...inputs: readonly SolanaSignAndSendTransactionInput[]) => {
                    const transactions = inputs.map((input) => {
                        try {
                            return VersionedTransaction.deserialize(input.transaction);
                        } catch {
                            return Transaction.from(input.transaction);
                        }
                    });
                    const connections = inputs.map((input) => new Connection(input.chain, input.options?.commitment ?? 'confirmed'));
                    const signatures = await Promise.all(inputs.map(async (input, index) =>
                        walletAdapter.sendTransaction(transactions[index]!, connections[index]!, input.options)
                    ));
                    return signatures.map((signature) => ({
                        signature: base58.decode(signature),
                    }));
                },
            } : undefined,
            [SolanaSignIn]: 'signIn' in walletAdapter ? {
                version: '1.0.0',
                signIn: async (...inputs: readonly SolanaSignInInput[]) => {
                    return await Promise.all(inputs.map(async (input) => walletAdapter.signIn(input)));
                },
            } : undefined,
            [SolanaSignMessage]: 'signMessage' in walletAdapter ? {
                version: '1.0.0',
                signMessage: async (...inputs: readonly SolanaSignMessageInput[]) => {
                    const signatures = await Promise.all(inputs.map(async (input) => walletAdapter.signMessage(input.message)));
                    return signatures.map((signature, index) => ({
                        signature,
                        signedMessage: inputs[index]!.message,
                    }));
                },
            } : undefined,
            [SolanaSignTransaction]: 'signAllTransactions' in walletAdapter ? {
                version: '1.0.0',
                supportedTransactionVersions: [0, 'legacy'],
                signTransaction: async (...inputs: readonly SolanaSignTransactionInput[]) => {
                    const transactions = inputs.map((input) => {
                        try {
                            return VersionedTransaction.deserialize(input.transaction);
                        } catch {
                            return Transaction.from(input.transaction);
                        }
                    });
                    const signedTransactions = await walletAdapter.signAllTransactions(transactions);
                    return signedTransactions.map(signedTransactions => ({
                        signedTransaction: signedTransactions.serialize({
                            requireAllSignatures: false,
                            verifySignatures: false
                        })
                    }));
                },
            } : undefined,
        };
    }

    get accounts(): readonly WalletAccount[] {
        const publicKey = this.#adapter.publicKey;
        if (!publicKey) return [];
        return [
            {
                address: publicKey.toBase58(),
                publicKey: publicKey.toBuffer(),
                chains: this.chains,
                features: Object.keys(this.features) as (keyof SupportedFeatures)[],
            },
        ];
    }
}
