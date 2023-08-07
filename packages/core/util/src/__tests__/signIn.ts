import {
    createSignInMessage,
    createSignInMessageText,
    deriveSignInMessage,
    deriveSignInMessageText,
    parseSignInMessage,
    parseSignInMessageText,
    verifySignIn,
} from '../signIn.js';

const signInMessageTests = {
    'with `domain` and `address`': {
        parsed: {
            domain: 'solana.com',
            address: 'A',
        },
        text: 'solana.com wants you to sign in with your Solana account:\nA',
    },
    'with `statement`': {
        parsed: {
            domain: 'solana.com',
            address: 'A',
            statement: 'S',
        },
        text: 'solana.com wants you to sign in with your Solana account:\nA\n\nS',
    },
    'with multi-line `statement`': {
        parsed: {
            domain: 'solana.com',
            address: 'A',
            statement: 'S\n\nS',
        },
        text: 'solana.com wants you to sign in with your Solana account:\nA\n\nS\n\nS',
    },
    'with fields': {
        parsed: {
            domain: 'solana.com',
            address: 'A',
            uri: 'https://solana.com',
        },
        text: 'solana.com wants you to sign in with your Solana account:\nA\n\nURI: https://solana.com',
    },
    'with `statement` and fields': {
        parsed: {
            domain: 'solana.com',
            address: 'A',
            statement: 'S',
            uri: 'https://solana.com',
        },
        text: 'solana.com wants you to sign in with your Solana account:\nA\n\nS\n\nURI: https://solana.com',
    },
    'with multi-line `statement` and fields': {
        parsed: {
            domain: 'solana.com',
            address: 'A',
            statement: 'S\n\nS',
            uri: 'https://solana.com',
        },
        text: 'solana.com wants you to sign in with your Solana account:\nA\n\nS\n\nS\n\nURI: https://solana.com',
    },
};

describe.skip('verifySignIn()', () => {});

describe.skip('deriveSignInMessage()', () => {});

describe.skip('deriveSignInMessageText()', () => {});

describe.skip('parseSignInMessage()', () => {});

describe('parseSignInMessageText()', () => {
    for (const [name, test] of Object.entries(signInMessageTests)) {
        it(name, () => {
            const parsed = parseSignInMessageText(test.text);
            expect(parsed).toEqual(test.parsed);
        });
    }
});

describe.skip('createSignInMessage()', () => {});

describe('createSignInMessageText()', () => {
    for (const [name, test] of Object.entries(signInMessageTests)) {
        it(name, () => {
            const text = createSignInMessageText(test.parsed);
            expect(text).toBe(test.text);
        });
    }
});
