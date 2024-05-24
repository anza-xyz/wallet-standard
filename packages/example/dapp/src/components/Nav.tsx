import { Badge, Box, Flex, Heading } from '@radix-ui/themes';
import React, { useContext } from 'react';

import { ChainContext } from '../context/ChainContext';
import { ConnectWalletMenu } from './ConnectWalletMenu';

export function Nav() {
    const { displayName: currentChainName } = useContext(ChainContext);
    return (
        <Box
            style={{
                backgroundColor: 'var(--gray-1)',
                borderBottom: '1px solid var(--gray-a6)',
                zIndex: 1,
            }}
            position="sticky"
            p="3"
            top="0"
        >
            <Flex gap="4" justify="between" align="center">
                <Heading as="h1" size={{ initial: '4', xs: '6' }} truncate>
                    Wallet Standard Demo{' '}
                    <Badge color="gray" style={{ verticalAlign: 'middle' }}>
                        {currentChainName}
                    </Badge>
                </Heading>
                <ConnectWalletMenu>Connect Wallet</ConnectWalletMenu>
            </Flex>
        </Box>
    );
}
