import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as xml2js from 'xml2js';

export class ClasspathResolver {
    private mavenDependencies: Set<string> = new Set();
    private jdkClasses: Set<string> = new Set();

    async initialize(projectRoot: string) {
        await this.parseMavenDependencies(projectRoot);
        await this.loadCommonJdkClasses();
    }

    private async parseMavenDependencies(projectRoot: string) {
        const pomPath = path.join(projectRoot, 'pom.xml');
        if (fs.existsSync(pomPath)) {
            const pomContent = await fs.promises.readFile(pomPath, 'utf-8');
            const parser = new xml2js.Parser();
            const pom = await parser.parseStringPromise(pomContent);

            // Parse dependencies from pom.xml
            const dependencies = pom.project.dependencies?.[0]?.dependency || [];
            for (const dep of dependencies) {
                // Add commonly used classes from each dependency
                if (dep.groupId[0] === 'org.springframework') {
                    this.mavenDependencies.add('org.springframework.ui.Model');
                    this.mavenDependencies.add('org.springframework.stereotype.Controller');
                }
                if (dep.artifactId[0] === 'poi') {
                    this.mavenDependencies.add('org.apache.poi.ss.usermodel.Workbook');
                    this.mavenDependencies.add('org.apache.poi.xssf.usermodel.XSSFWorkbook');
                }
            }
        }
    }
    private async loadCommonJdkClasses() {
        // Common JDK classes based on your imports
        const commonJdkClasses = [
            'java.util.List',
            'java.util.ArrayList',
            'java.io.IOException',
            'java.lang.reflect.InvocationTargetException',
            'jakarta.servlet.http.HttpServletResponse'
        ];
        commonJdkClasses.forEach(c => this.jdkClasses.add(c));
    }

    getAllAvailableClasses(): string[] {
        return [...this.jdkClasses, ...this.mavenDependencies];
    }
}
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
    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.CompletionItem[]> {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        const trimmedLinePrefix = linePrefix.trimStart();
        if (trimmedLinePrefix.startsWith('@import ')) {
            const classes = await this.resolveClasses(document);
            return classes.map(c => this.createCompletionItem(c, 'Import Java class'));
        }

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

    private async resolveClasses(document: vscode.TextDocument): Promise<string[]> {
        // Get project root from settings, fallback to finding src directory
        const classes: string[] = [];

        // Add common JDK classes
        classes.push(
            'java.util.List',
            'java.util.ArrayList',
            'java.io.IOException',
            'jakarta.servlet.http.HttpServletResponse'
        );
        const projectRoot = vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;
        if (!projectRoot) {
            throw new Error('No workspace folder found');
        }

        // Add project classes
        const projectClasses = await this.findJavaFiles(projectRoot);
        classes.push(...projectClasses);

        return classes;
    }

    private async findJavaFiles(rootPath: string): Promise<string[]> {
        // Focus on your main package structure
        const srcPath = path.join(rootPath, 'src', 'main', 'java');
        const files: string[] = [];

        const processDirectory = async (dirPath: string) => {
            try {
                const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.join(dirPath, entry.name);
                    if (entry.isDirectory()) {
                        await processDirectory(fullPath);
                    } else if (entry.name.endsWith('.java')) {
                        // Convert file path to package notation
                        const packagePath = fullPath
                            .replace(srcPath + path.sep, '')
                            .replace(/\\/g, '.')
                            .replace(/\//g, '.')
                            .replace('.java', '');
                        files.push(packagePath);
                    }
                }
            } catch (error) {
                console.log(`Directory not found or not accessible: ${dirPath}`);
                return []; // Return empty array if directory doesn't exist
            }
        };

        await processDirectory(srcPath);
        return files;
    }
}