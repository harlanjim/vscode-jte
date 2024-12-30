import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Register the completion provider
    const provider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: 'jte' },
        new JteCompletionProvider(),
        '@' // Trigger character
    );

    context.subscriptions.push(provider);
}

class JteCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.CompletionItem[] {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        
        // Only provide completions for @ directives
        if (!linePrefix.endsWith('@')) {
            return [];
        }

        return [
            this.createCompletionItem('import', 'Import Java classes or JTE templates'),
            this.createCompletionItem('param', 'Define template parameters'),
            this.createCompletionItem('if', 'Conditional statement'),
            this.createCompletionItem('else', 'Else statement for conditional'),
            this.createCompletionItem('endif', 'End if statement'),
            this.createCompletionItem('for', 'Loop statement'),
            this.createCompletionItem('endfor', 'End for loop'),
            this.createCompletionItem('template', 'Define a template'),
            this.createCompletionItem('raw', 'Raw text block')
        ];
    }

    private createCompletionItem(name: string, description: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Keyword);
        item.detail = description;
        item.insertText = name;
        return item;
    }
}