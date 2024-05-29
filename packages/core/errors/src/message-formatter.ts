import type { WalletStandardErrorCode } from './codes.js';
import { encodeContextObject } from './context.js';
import { WalletStandardErrorMessages } from './messages.js';

export function getHumanReadableErrorMessage<TErrorCode extends WalletStandardErrorCode>(
    code: TErrorCode,
    context: object = {}
): string {
    const messageFormatString = WalletStandardErrorMessages[code];
    const message = messageFormatString.replace(/(?<!\\)\$(\w+)/g, (substring, variableName) =>
        variableName in context ? `${context[variableName as keyof typeof context]}` : substring
    );
    return message;
}

export function getErrorMessage<TErrorCode extends WalletStandardErrorCode>(
    code: TErrorCode,
    context: object = {}
): string {
    if (process.env.NODE_ENV !== 'production') {
        return getHumanReadableErrorMessage(code, context);
    } else {
        let decodingAdviceMessage = `Wallet Standard error #${code}; Decode this error by running \`npx @wallet-standard/errors decode -- ${code}`;
        if (Object.keys(context).length) {
            /**
             * DANGER: Be sure that the shell command is escaped in such a way that makes it
             *         impossible for someone to craft malicious context values that would result in
             *         an exploit against anyone who bindly copy/pastes it into their terminal.
             */
            decodingAdviceMessage += ` '${encodeContextObject(context)}'`;
        }
        return `${decodingAdviceMessage}\``;
    }
}
