import * as vscode from 'vscode';

export class JteAtCompletionProvider implements vscode.CompletionItemProvider {

    constructor() {
    }

    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.CompletionItem[]> {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        const trimmedLinePrefix = linePrefix.trimStart();

        // Only provide completions for @ directives
        if (!trimmedLinePrefix.endsWith('@')) {
            return [];
        }

        // Get completions from settings
        const config = vscode.workspace.getConfiguration('jte');
        const completions = config.get<string[]>('@.completions') || [];

        return completions.map(completion => 
            this.createCompletionItem(completion, completion)
        );
    }

    private createCompletionItem(name: string, description: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Keyword);
        item.detail = description;
        item.insertText = name;
        return item;
    }
}