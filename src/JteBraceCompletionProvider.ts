import * as vscode from 'vscode';
import { ParameterResolver } from './ParameterResolver';
export class JteBraceCompletionProvider implements vscode.CompletionItemProvider {
    constructor() {
    }

    async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
     

        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        if (linePrefix.endsWith('${')) {
            const parameterResolver = new ParameterResolver(document);
            const parameters = await parameterResolver.resolveParameters();
            return parameters;
        }

        return [];
     }

    private createCompletionItem(name: string, description: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Variable);
        item.detail = description;
        return item;
    }
}