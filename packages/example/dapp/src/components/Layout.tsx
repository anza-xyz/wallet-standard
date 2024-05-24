import { Flex, Section, Theme } from '@radix-ui/themes';
import React from 'react';
import { Outlet } from 'react-router-dom';

import { RpcContextProvider } from '../context/RpcContext';
import { SelectedWalletAccountContextProvider } from '../context/SelectedWalletAccountContext';
import { Nav } from './Nav';

import '@radix-ui/themes/styles.css';

export function Layout() {
    return (
        <Theme>
            <Flex direction="column">
                <SelectedWalletAccountContextProvider>
                    <RpcContextProvider>
                        <Nav />
                        <Section>
                            <Outlet />
                        </Section>
                    </RpcContextProvider>
                </SelectedWalletAccountContextProvider>
            </Flex>
        </Theme>
    );
}
