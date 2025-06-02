import * as vscode from 'vscode';
import { JteAtCompletionProvider } from './JteAtCompletionProvider';
import { JteBraceCompletionProvider } from './JteBraceCompletionProvider';
import { JteSpaceCompletionProvider } from './JteSpaceCompletionProvider';
import { JteDocumentFormatter } from './formatter';

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

    const braceProvider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: 'jte' },
        new JteBraceCompletionProvider(),
        '{' // Trigger character
    );
    context.subscriptions.push(braceProvider);

    // Register the formatter
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider('jte', new JteDocumentFormatter())
    );
}