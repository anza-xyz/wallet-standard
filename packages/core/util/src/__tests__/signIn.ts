import { createSignInMessageText, parseSignInMessageText } from '../signIn.js';

const signInMessage = {
    withDomainAndAddress: {
        object: {
            domain: 'solana.com',
            address: 'A',
        },
        text: 'solana.com wants you to sign in with your Solana account:\nA',
    },
    withStatement: {
        object: {
            domain: 'solana.com',
            address: 'A',
            statement: 'S',
        },
        text: 'solana.com wants you to sign in with your Solana account:\nA\n\nS',
    },
};

describe('createSignInMessageText()', () => {
    it('creates sign in message with `domain` and `address`', () => {
        const text = createSignInMessageText(signInMessage.withDomainAndAddress.object);
        expect(text).toBe(signInMessage.withDomainAndAddress.text);
    });
    it('creates sign in message with `statement`', () => {
        const text = createSignInMessageText(signInMessage.withStatement.object);
        expect(text).toBe(signInMessage.withStatement.text);
    });
});

describe('parseSignInMessageText()', () => {
    it('parses sign in message with `domain` and `address`', () => {
        const parsed = parseSignInMessageText(signInMessage.withDomainAndAddress.text);
        expect(parsed).toEqual(signInMessage.withDomainAndAddress.object);
    });
    it('parses sign in message with `statement`', () => {
        const parsed = parseSignInMessageText(signInMessage.withStatement.text);
        expect(parsed).toEqual(signInMessage.withStatement.object);
    });
});
