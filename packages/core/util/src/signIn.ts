import type { SolanaSignInInput, SolanaSignInOutput } from '@solana/wallet-standard-features';
import { verifyMessageSignature } from './signMessage.js';
import { arraysEqual } from './util.js';

/**
 * TODO: docs
 */
export function verifySignIn(input: SolanaSignInInput, output: SolanaSignInOutput): boolean {
    const {
        signedMessage,
        signature,
        account: { publicKey },
    } = output;
    const message = deriveSignInMessage(input, output);
    return !!message && verifyMessageSignature({ message, signedMessage, signature, publicKey });
}

/**
 * TODO: docs
 */
export function deriveSignInMessage(input: SolanaSignInInput, output: SolanaSignInOutput): Uint8Array | null {
    const text = deriveSignInMessageText(input, output);
    if (!text) return null;
    return new TextEncoder().encode(text);
}

/**
 * TODO: docs
 */
export function deriveSignInMessageText(input: SolanaSignInInput, output: SolanaSignInOutput): string | null {
    const parsed = parseSignInMessage(output.signedMessage);
    if (!parsed) return null;

    if (input.domain && input.domain !== parsed.domain) return null;
    if (input.address && input.address !== parsed.address) return null;
    if (input.statement !== parsed.statement) return null;
    if (input.uri !== parsed.uri) return null;
    if (input.version !== parsed.version) return null;
    if (input.chainId !== parsed.chainId) return null;
    if (input.nonce !== parsed.nonce) return null;
    if (input.issuedAt !== parsed.issuedAt) return null;
    if (input.expirationTime !== parsed.expirationTime) return null;
    if (input.notBefore !== parsed.notBefore) return null;
    if (input.requestId !== parsed.requestId) return null;
    if (input.resources) {
        if (!parsed.resources) return null;
        if (!arraysEqual(input.resources, parsed.resources)) return null;
    } else if (parsed.resources) return null;

    return createSignInMessageText(parsed);
}

/**
 * TODO: docs
 */
export type SolanaSignInInputWithRequiredFields = SolanaSignInInput &
    Required<Pick<SolanaSignInInput, 'domain' | 'address'>>;

/**
 * TODO: docs
 */
export function parseSignInMessage(message: Uint8Array): SolanaSignInInputWithRequiredFields | null {
    const text = new TextDecoder().decode(message);
    return parseSignInMessageText(text);
}

// TODO: implement https://github.com/solana-labs/solana/blob/master/docs/src/proposals/off-chain-message-signing.md
const DOMAIN = '(?<domain>[^\\n]+?) wants you to sign in with your Solana account:\\n';
const ADDRESS = '(?<address>[^\\n]+)(?:\\n|$)';
const STATEMENT = '(?:\\n(?<statement>[\\S\\s]*?)(?:\\n|$))??';
const URI = '(?:\\nURI: (?<uri>[^\\n]+))?';
const VERSION = '(?:\\nVersion: (?<version>[^\\n]+))?';
const CHAIN_ID = '(?:\\nChain ID: (?<chainId>[^\\n]+))?';
const NONCE = '(?:\\nNonce: (?<nonce>[^\\n]+))?';
const ISSUED_AT = '(?:\\nIssued At: (?<issuedAt>[^\\n]+))?';
const EXPIRATION_TIME = '(?:\\nExpiration Time: (?<expirationTime>[^\\n]+))?';
const NOT_BEFORE = '(?:\\nNot Before: (?<notBefore>[^\\n]+))?';
const REQUEST_ID = '(?:\\nRequest ID: (?<requestId>[^\\n]+))?';
const RESOURCES = '(?:\\nResources:(?<resources>(?:\\n- [^\\n]+)*))?';
const FIELDS = `${URI}${VERSION}${CHAIN_ID}${NONCE}${ISSUED_AT}${EXPIRATION_TIME}${NOT_BEFORE}${REQUEST_ID}${RESOURCES}`;
const MESSAGE = new RegExp(`^${DOMAIN}${ADDRESS}${STATEMENT}${FIELDS}\\n*$`);

/**
 * TODO: docs
 */
export function parseSignInMessageText(text: string): SolanaSignInInputWithRequiredFields | null {
    const match = MESSAGE.exec(text);
    if (!match) return null;
    const groups = match.groups;
    if (!groups) return null;

    return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        domain: groups.domain!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        address: groups.address!,
        statement: groups.statement,
        uri: groups.uri,
        version: groups.version,
        nonce: groups.nonce,
        chainId: groups.chainId,
        issuedAt: groups.issuedAt,
        expirationTime: groups.expirationTime,
        notBefore: groups.notBefore,
        requestId: groups.requestId,
        resources: groups.resources?.split('\n- ').slice(1),
    };
}

/**
 * TODO: docs
 */
export function createSignInMessage(input: SolanaSignInInputWithRequiredFields): Uint8Array {
    const text = createSignInMessageText(input);
    return new TextEncoder().encode(text);
}

/**
 * TODO: docs
 */
export function createSignInMessageText(input: SolanaSignInInputWithRequiredFields): string {
    // ${domain} wants you to sign in with your Solana account:
    // ${address}
    //
    // ${statement}
    //
    // URI: ${uri}
    // Version: ${version}
    // Chain ID: ${chain}
    // Nonce: ${nonce}
    // Issued At: ${issued-at}
    // Expiration Time: ${expiration-time}
    // Not Before: ${not-before}
    // Request ID: ${request-id}
    // Resources:
    // - ${resources[0]}
    // - ${resources[1]}
    // ...
    // - ${resources[n]}

    let message = `${input.domain} wants you to sign in with your Solana account:\n`;
    message += `${input.address}`;

    if (input.statement) {
        message += `\n\n${input.statement}`;
    }

    const fields: string[] = [];
    if (input.uri) {
        fields.push(`URI: ${input.uri}`);
    }
    if (input.version) {
        fields.push(`Version: ${input.version}`);
    }
    if (input.chainId) {
        fields.push(`Chain ID: ${input.chainId}`);
    }
    if (input.nonce) {
        fields.push(`Nonce: ${input.nonce}`);
    }
    if (input.issuedAt) {
        fields.push(`Issued At: ${input.issuedAt}`);
    }
    if (input.expirationTime) {
        fields.push(`Expiration Time: ${input.expirationTime}`);
    }
    if (input.notBefore) {
        fields.push(`Not Before: ${input.notBefore}`);
    }
    if (input.requestId) {
        fields.push(`Request ID: ${input.requestId}`);
    }
    if (input.resources) {
        fields.push(`Resources:`);
        for (const resource of input.resources) {
            fields.push(`- ${resource}`);
        }
    }
    if (fields.length) {
        message += `\n\n${fields.join('\n')}`;
    }

    return message;
}
