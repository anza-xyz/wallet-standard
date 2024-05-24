import type { ClusterUrl } from '@solana/web3.js-experimental';
import { devnet } from '@solana/web3.js-experimental';
import type { IdentifierString } from '@wallet-standard/core';
import { createContext } from 'react';

export const ChainContext = createContext<{
    chain: IdentifierString;
    displayName: string;
    solanaExplorerClusterName: 'devnet';
    solanaRpcUrl: ClusterUrl;
    solanaRpcSubscriptionsUrl: ClusterUrl;
}>({
    chain: 'solana:devnet',
    displayName: 'Devnet',
    solanaExplorerClusterName: 'devnet',
    solanaRpcSubscriptionsUrl: devnet('wss://api.devnet.solana.com'),
    solanaRpcUrl: devnet('https://api.devnet.solana.com'),
});
