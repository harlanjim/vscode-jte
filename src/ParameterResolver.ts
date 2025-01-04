import * as vscode from 'vscode';

export class ParameterResolver {
    private document: vscode.TextDocument;

    constructor(document: vscode.TextDocument) {
        this.document = document;
    }

    async resolveParameters(): Promise<vscode.CompletionItem[]> {
        const parameters = await this.findParameters(this.document);
        return parameters.map(p => this.createCompletionItem(p, 'Parameter'));
    }

    private createCompletionItem(name: string, description: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Variable);
        item.detail = description;
        return item;
    }

    private async findParameters(document: vscode.TextDocument): Promise<string[]> {
        const parameters: string[] = [];
        
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i).text.trim();
            if (line.startsWith('@param')) {
                // Extract parameter name (assumes format: @param Type name = value)
                const matches = line.match(/@param\s+\w+\s+(\w+)(?:\s*=.*)?/);
                if (matches && matches[1]) {
                    parameters.push(matches[1]);
                }
            }
        }
        return parameters;
    }
}