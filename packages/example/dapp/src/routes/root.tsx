import { Box, Code, Container, DataList, Flex, Heading, Spinner, Text } from '@radix-ui/themes';
import React, { useContext } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { Balance } from '../components/Balance';
import { ExperimentalSignMessageFeaturePanel } from '../components/ExperimentalSignMessageFeaturePanel';
import { FeatureNotSupportedCallout } from '../components/FeatureNotSupportedCallout';
import { FeaturePanel } from '../components/FeaturePanel';
import { SolanaSignAndSendTransactionFeaturePanel } from '../components/SolanaSignAndSendTransactionFeaturePanel';
import { SolanaSignMessageFeaturePanel } from '../components/SolanaSignMessageFeaturePanel';
import { WalletAccountIcon } from '../components/WalletAccountIcon';
import { SelectedWalletAccountContext } from '../context/SelectedWalletAccountContext';

export function Root() {
    const [selectedWalletAccount] = useContext(SelectedWalletAccountContext);
    return (
        <Container mx={{ initial: '3', xs: '6' }}>
            {selectedWalletAccount ? (
                <Flex gap="6" direction="column">
                    <Flex gap="2">
                        <Flex align="center" gap="3" flexGrow="1">
                            <WalletAccountIcon account={selectedWalletAccount} height="48" width="48" />
                            <Box>
                                <Heading as="h4" size="3">
                                    {selectedWalletAccount.label ?? 'Unlabeled Account'}
                                </Heading>
                                <Code variant="outline" truncate size={{ initial: '1', xs: '2' }}>
                                    {selectedWalletAccount.address}
                                </Code>
                            </Box>
                        </Flex>
                        <Flex direction="column" align="start">
                            <Heading as="h4" size="3">
                                Balance
                            </Heading>
                            <React.Suspense
                                fallback={
                                    <Spinner loading>
                                        <Balance account={selectedWalletAccount} />
                                    </Spinner>
                                }
                            >
                                <Balance account={selectedWalletAccount} />
                            </React.Suspense>
                        </Flex>
                    </Flex>
                    <DataList.Root orientation={{ initial: 'vertical', sm: 'horizontal' }} size="3">
                        <FeaturePanel label="Sign Message (Solana)">
                            <ErrorBoundary FallbackComponent={FeatureNotSupportedCallout}>
                                <SolanaSignMessageFeaturePanel account={selectedWalletAccount} />
                            </ErrorBoundary>
                        </FeaturePanel>
                        <FeaturePanel label="Sign And Send Transaction (Solana)">
                            <ErrorBoundary FallbackComponent={FeatureNotSupportedCallout}>
                                <SolanaSignAndSendTransactionFeaturePanel account={selectedWalletAccount} />
                            </ErrorBoundary>
                        </FeaturePanel>
                        <FeaturePanel label="Sign Message (Experimental)">
                            <ErrorBoundary FallbackComponent={FeatureNotSupportedCallout}>
                                <ExperimentalSignMessageFeaturePanel account={selectedWalletAccount} />
                            </ErrorBoundary>
                        </FeaturePanel>
                    </DataList.Root>
                </Flex>
            ) : (
                <Text as="p">Click “Connect Wallet” to get started.</Text>
            )}
        </Container>
    );
}
