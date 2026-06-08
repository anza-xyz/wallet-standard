import type { ReadonlyUint8Array, WalletAccount } from '@wallet-standard/base';

/** Name of the feature. */
export const SolanaSignOffchainMessage = 'solana:signOffchainMessage';

/**
 * `solana:signOffchainMessage` is a feature that may be implemented by a {@link "@wallet-standard/base".Wallet}
 * to allow a dapp to request the wallet to sign offchain messages conforming to the Solana offchain message
 * signing specification (https://github.com/solana-foundation/SRFCs/discussions/3).
 */
export type SolanaSignOffchainMessageFeature = {
    /** Name of the feature. */
    readonly [SolanaSignOffchainMessage]: {
        /** Version of the feature API. */
        readonly version: SolanaSignOffchainMessageVersion;

        /**
         * Offchain message specification versions this wallet can serialize and sign.
         * See https://github.com/solana-foundation/SRFCs/discussions/3.
         */
        readonly supportedMessageVersions: readonly SolanaOffchainMessageVersion[];

        /**
         * Sign offchain messages using the account's secret key, conforming to the Solana offchain
         * message signing specification (https://github.com/solana-foundation/SRFCs/discussions/3).
         *
         * @param inputs Offchain messages to sign.
         *
         * @return Results of signing offchain messages. For each message this includes the full
         * bytes the wallet constructed and signed along with the resulting signature.
         */
        readonly signOffchainMessage: SolanaSignOffchainMessageMethod;
    };
};

/** Version of the feature. */
export type SolanaSignOffchainMessageVersion = '1.0.0';

/** Offchain message specification version. */
export type SolanaOffchainMessageVersion = 1;

/**
 * Signs one or more offchain messages, returning for each the full bytes the wallet constructed and signed
 * along with the resulting signature.
 *
 * @param inputs Offchain messages to sign.
 *
 * @return Results of signing offchain messages.
 */
export type SolanaSignOffchainMessageMethod = (
    ...inputs: readonly SolanaSignOffchainMessageInput[]
) => Promise<readonly SolanaSignOffchainMessageOutput[]>;

/**
 * Input for signing an offchain message.
 * Discriminated on `messageVersion` to enforce version-specific fields at the type level.
 */
export type SolanaSignOffchainMessageInput = SolanaSignOffchainMessageInputV1;

/** Input for signing a version 1 offchain message. */
export interface SolanaSignOffchainMessageInputV1 {
    /** Offchain message specification version. */
    readonly messageVersion: 1;

    /**
     * Account to use.
     * Its public key must appear in `requiredSigners`.
     */
    readonly account: WalletAccount;

    /**
     * UTF-8 message body, as string.
     * The wallet must encode this as UTF-8 using the [WHATWG TextEncoder Standard](https://encoding.spec.whatwg.org/#interface-textencoder)
     */
    readonly message: string;

    /**
     * Required signer public keys, 32 bytes each.
     * The wallet sorts these lexicographically and rejects duplicates internally to produce the
     * canonical preamble required by the specification.
     * Must be non-empty and must contain the public key of `account`.
     */
    readonly requiredSigners: readonly WalletAccount['publicKey'][];
}

/** Output of signing an offchain message. */
export interface SolanaSignOffchainMessageOutput {
    /**
     * Full preamble and body bytes that the wallet constructed and signed.
     * Returned verbatim so the verifier can validate the signature without rebuilding the preamble.
     */
    readonly signedOffchainMessage: ReadonlyUint8Array;

    /**
     * Message signature produced.
     * If the signature type is provided, the signature must be Ed25519.
     */
    readonly signature: ReadonlyUint8Array;

    /**
     * Optional type of the message signature produced.
     * If not provided, the signature must be Ed25519.
     */
    readonly signatureType?: 'ed25519';
}
