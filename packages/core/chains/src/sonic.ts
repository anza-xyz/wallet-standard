import type { IdentifierString } from '@wallet-standard/base';

/** Sonic Mainnet (beta) cluster, e.g. https://api.mainnet-beta.sonic.com */
export const SONIC_MAINNET_CHAIN = 'sonic:mainnet';

/** Sonic Devnet cluster, e.g. https://api.devnet.sonic.com */
export const SONIC_DEVNET_CHAIN = 'sonic:devnet';

/** Sonic Testnet cluster, e.g. https://api.testnet.sonic.com */
export const SONIC_TESTNET_CHAIN = 'sonic:testnet';

/** Sonic Localnet cluster, e.g. http://localhost:8899 */
export const SONIC_LOCALNET_CHAIN = 'sonic:localnet';

/** Array of all Sonic clusters */
export const SONIC_CHAINS = [
    SONIC_MAINNET_CHAIN,
    SONIC_DEVNET_CHAIN,
    SONIC_TESTNET_CHAIN,
    SONIC_LOCALNET_CHAIN,
] as const;

/** Type of all Sonic clusters */
export type SonicChain = (typeof SONIC_CHAINS)[number];

/**
 * Check if a chain corresponds with one of the Sonic clusters.
 */
export function isSonicChain(chain: IdentifierString): chain is SonicChain {
    return SONIC_CHAINS.includes(chain as SonicChain);
}
