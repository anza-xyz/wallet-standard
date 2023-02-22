import {
    isWalletAdapterCompatibleStandardWallet,
    type StandardWalletAdapter,
    type WalletAdapterCompatibleStandardWallet,
} from '@solana/wallet-adapter-base';

/**
 * @deprecated Use `StandardWalletAdapter` from `@solana/wallet-adapter-base` instead.
 *
 * @group Deprecated
 */
export type StandardAdapter = StandardWalletAdapter;

/**
 * @deprecated Use `WalletAdapterCompatibleStandardWallet` from `@solana/wallet-adapter-base` instead.
 *
 * @group Deprecated
 */
export type WalletAdapterCompatibleWallet = WalletAdapterCompatibleStandardWallet;

/**
 * @deprecated Use `isWalletAdapterCompatibleStandardWallet` from `@solana/wallet-adapter-base` instead.
 *
 * @group Deprecated
 */
export const isWalletAdapterCompatibleWallet = isWalletAdapterCompatibleStandardWallet;
