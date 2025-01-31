import * as vscode from 'vscode';
import { ClassResolver } from './ClassResolver';
import { TypeResolver } from './TypeResolver';

export class JteSpaceCompletionProvider implements vscode.CompletionItemProvider {
    private classResolver: ClassResolver;
    private typeResolver: TypeResolver;
    constructor() {
        this.classResolver = new ClassResolver("./");
        this.typeResolver = new TypeResolver("./");
    }

    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.CompletionItem[]> {
        const projectRoot = vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;
        if (!projectRoot) {
            throw new Error('No workspace folder found');
        }
        if (this.classResolver.getProjectRoot() !== projectRoot) {
            this.classResolver = new ClassResolver(projectRoot);
        }
        if (this.typeResolver.getProjectRoot() !== projectRoot) {
            this.typeResolver = new TypeResolver(projectRoot);
        }
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        const trimmedLinePrefix = linePrefix.trimStart();
        if (trimmedLinePrefix.startsWith('@import ')) {
            const classes = await this.classResolver.resolveClasses();
            return classes.map(c => this.createCompletionItem(c, 'Import Java class'));
        }

        if (trimmedLinePrefix.startsWith('@param ')) {
            const types = await this.typeResolver.resolveTypes();
            return types.map(c => this.createCompletionItem(c, 'Import Java type'));
        }

        return [];
    }

    private createCompletionItem(name: string, description: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Keyword);
        item.detail = description;
        item.insertText = name;
        return item;
    }
}