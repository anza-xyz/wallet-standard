import type { IdentifierArray, Wallet, WalletAccount, WalletIcon, WalletVersion } from '@wallet-standard/base';
import type {
    StandardConnectFeature,
    StandardConnectInput,
    StandardDisconnectFeature,
} from '@wallet-standard/features';
import { StandardConnect, StandardDisconnect } from '@wallet-standard/features';
import type { Adapter, WalletName } from '@solana/wallet-adapter-base';
import { SOLANA_CHAINS } from '@solana/wallet-standard-chains';
import type {
    SolanaSignAndSendTransactionFeature,
    SolanaSignAndSendTransactionInput,
    SolanaSignInFeature,
    SolanaSignInInput,
    SolanaSignMessageFeature,
    SolanaSignMessageInput,
    SolanaSignTransactionFeature,
    SolanaSignTransactionInput,
} from '@solana/wallet-standard-features';
import {
    SolanaSignAndSendTransaction,
    SolanaSignIn,
    SolanaSignMessage,
    SolanaSignTransaction,
} from '@solana/wallet-standard-features';
import type { Commitment, SendOptions, TransactionSignature, Connection } from '@solana/web3.js';
import { VersionedTransaction } from '@solana/web3.js';
import base58 from 'bs58';

type RequiredSupportedFeatures = StandardConnectFeature & StandardDisconnectFeature;
type OptionalSupportedFeatures = Partial<
    SolanaSignAndSendTransactionFeature & SolanaSignInFeature & SolanaSignMessageFeature & SolanaSignTransactionFeature
>;
type SupportedFeatures = RequiredSupportedFeatures & OptionalSupportedFeatures;

type BlockhashFetcher = (config?: {
    commitment?: Commitment;
    minContextSlot?: number;
}) => Promise<{ blockhash: string }>;

export interface ConnectionContext {
    commitment?: Commitment;
    getLatestBlockhash: BlockhashFetcher;
    sendRawTransaction(
        rawTransaction: Buffer | Uint8Array | Array<number>,
        options?: SendOptions
    ): Promise<TransactionSignature>;
}

export class SolanaWalletAdapterWallet implements Wallet {
    readonly #adapter: Adapter;
    readonly #connection: ConnectionContext;
    readonly #requiredFeatures: RequiredSupportedFeatures;
    #optionalFeatures: OptionalSupportedFeatures = {};
    #accounts: WalletAccount[] = [];

    constructor(adapter: Adapter, connection: ConnectionContext) {
        this.#adapter = adapter;
        this.#connection = connection;
        this.#requiredFeatures = {
            [StandardConnect]: {
                version: '1.0.0',
                connect: async (input?: StandardConnectInput) => {
                    await this.#adapter.connect();
                    this.memoizeAccountsAndFeatures();
                    return {
                        accounts: this.accounts,
                    };
                },
            },
            [StandardDisconnect]: {
                version: '1.0.0',
                disconnect: async () => {
                    await this.#adapter.disconnect();
                    this.memoizeAccountsAndFeatures();
                },
            },
        };
    }

    private memoizeAccountsAndFeatures() {
        const publicKey = this.#adapter.publicKey;
        if (publicKey) {
            this.#accounts = [
                {
                    address: publicKey.toBase58(),
                    publicKey: publicKey.toBuffer(),
                    chains: this.chains,
                    features: Object.keys(this.features) as (keyof SupportedFeatures)[],
                },
            ];
        } else {
            this.#accounts = [];
        }

        const walletAdapter = this.#adapter;
        this.#optionalFeatures = {
            [SolanaSignAndSendTransaction]:
                'sendTransaction' in walletAdapter
                    ? {
                          version: '1.0.0',
                          supportedTransactionVersions: [0, 'legacy'],
                          signAndSendTransaction: async (...inputs: readonly SolanaSignAndSendTransactionInput[]) => {
                              return Promise.all(
                                  inputs.map(async (input) => {
                                      const transaction = VersionedTransaction.deserialize(input.transaction);

                                      const signature = await walletAdapter.sendTransaction(
                                          transaction,
                                          this.#connection as Connection,
                                          input.options
                                      );
                                      return { signature: base58.decode(signature) };
                                  })
                              );
                          },
                      }
                    : undefined,
            [SolanaSignIn]:
                'signIn' in walletAdapter
                    ? {
                          version: '1.0.0',
                          signIn: async (...inputs: readonly SolanaSignInInput[]) => {
                              return await Promise.all(inputs.map(async (input) => walletAdapter.signIn(input)));
                          },
                      }
                    : undefined,
            [SolanaSignMessage]:
                'signMessage' in walletAdapter
                    ? {
                          version: '1.0.0',
                          signMessage: async (...inputs: readonly SolanaSignMessageInput[]) => {
                              return Promise.all(
                                  inputs.map(async (input) => {
                                      const signature = await walletAdapter.signMessage(input.message);
                                      return {
                                          signature,
                                          signedMessage: input.message,
                                      };
                                  })
                              );
                          },
                      }
                    : undefined,
            [SolanaSignTransaction]:
                'signAllTransactions' in walletAdapter
                    ? {
                          version: '1.0.0',
                          supportedTransactionVersions: [0, 'legacy'],
                          signTransaction: async (...inputs: readonly SolanaSignTransactionInput[]) => {
                              const transactions = inputs.map((input) =>
                                  VersionedTransaction.deserialize(input.transaction)
                              );
                              const signedTransactions = await walletAdapter.signAllTransactions(transactions);
                              return signedTransactions.map((signedTransactions) => ({
                                  signedTransaction: signedTransactions.serialize(),
                              }));
                          },
                      }
                    : undefined,
        };
    }

    // MARK: Required getters for Wallet interface

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
            return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=';
        }
        return this.#adapter.icon as WalletIcon;
    }

    get chains(): IdentifierArray {
        return SOLANA_CHAINS;
    }

    get features(): Readonly<SupportedFeatures> {
        return {
            ...this.#requiredFeatures,
            ...this.#optionalFeatures,
        };
    }

    get accounts(): readonly WalletAccount[] {
        return this.#accounts;
    }
}
