import type { WalletAccount } from '@wallet-standard/base';

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
export type SolanaOffchainMessageVersion = 0 | 1;

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
export type SolanaSignOffchainMessageInput = SolanaSignOffchainMessageInputV0 | SolanaSignOffchainMessageInputV1;

/** Input for signing a version 0 offchain message. */
export interface SolanaSignOffchainMessageInputV0 {
    /** Offchain message specification version. */
    readonly messageVersion: 0;

    /**
     * Account to use.
     * Its public key must appear in `requiredSigners`.
     */
    readonly account: WalletAccount;

    /**
     * 32-byte application identifier.
     * Wallets should render this to the user as a base58 string.
     */
    readonly applicationDomain: Uint8Array;

    /**
     * Body encoding and length variant:
     * - `0` — restricted ASCII (`0x20..=0x7e`), at most 1232 bytes of preamble and body combined.
     * - `1` — UTF-8, at most 1232 bytes combined.
     * - `2` — UTF-8, at most 65535 bytes combined.
     *
     * The wallet must validate `message` against the chosen format and reject it otherwise.
     */
    readonly messageFormat: 0 | 1 | 2;

    /** Message body, as raw bytes. */
    readonly message: Uint8Array;

    /**
     * Required signer public keys, 32 bytes each.
     * Order is preserved in the preamble.
     * Must be non-empty and must contain the public key of `account`.
     */
    readonly requiredSigners: readonly [Uint8Array, ...(readonly Uint8Array[])];
}

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
     * UTF-8 message body, as raw bytes.
     * The wallet must reject byte sequences that are not valid UTF-8.
     */
    readonly message: Uint8Array;

    /**
     * Required signer public keys, 32 bytes each.
     * The wallet sorts these lexicographically and rejects duplicates internally to produce the
     * canonical preamble required by the specification.
     * Must be non-empty and must contain the public key of `account`.
     */
    readonly requiredSigners: readonly [Uint8Array, ...(readonly Uint8Array[])];
}

/** Output of signing an offchain message. */
export interface SolanaSignOffchainMessageOutput {
    /**
     * Full preamble and body bytes that the wallet constructed and signed.
     * Returned verbatim so the verifier can validate the signature without rebuilding the preamble.
     */
    readonly signedOffchainMessage: Uint8Array;

    /**
     * Message signature produced.
     * If the signature type is provided, the signature must be Ed25519.
     */
    readonly signature: Uint8Array;

    /**
     * Optional type of the message signature produced.
     * If not provided, the signature must be Ed25519.
     */
    readonly signatureType?: 'ed25519';
}
