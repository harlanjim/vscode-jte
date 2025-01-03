import * as vscode from 'vscode';
import { JteAtCompletionProvider } from './JteAtCompletionProvider';
import { JteSpaceCompletionProvider } from './JteSpaceCompletionProvider';

export function activate(context: vscode.ExtensionContext) {

    // Register the completion provider
    const provider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: 'jte' },
        new JteAtCompletionProvider(),
        '@' // Trigger character
    );
    context.subscriptions.push(provider);

    const spaceProvider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: 'jte' },
        new JteSpaceCompletionProvider(),
        ' ' // Trigger character
    );
    context.subscriptions.push(spaceProvider);
}
