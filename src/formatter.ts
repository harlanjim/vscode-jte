import * as prettier from 'prettier';
import * as vscode from 'vscode';

export class JteDocumentFormatter implements vscode.DocumentFormattingEditProvider {
    async provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): Promise<vscode.TextEdit[]> {
        const text = document.getText();
        const formatted = await this.formatJte(text, options);
        
        if (formatted !== text) {
            return [
                vscode.TextEdit.replace(
                    new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(text.length)
                    ),
                    formatted
                )
            ];
        }
        return [];
    }

    private async formatJte(text: string, options: vscode.FormattingOptions): Promise<string> {
        // Split the content into HTML and JTE sections
        const sections = this.splitIntoSections(text);
        
        // Format each section appropriately
        const formattedSections = await Promise.all(
            sections.map(async section => {
                if (section.type === 'html') {
                    return this.formatHtml(section.content, options);
                }
                return section.content; // Keep JTE sections as-is for now
            })
        );

        // Rejoin the sections
        return formattedSections.join('');
    }

    private async formatHtml(html: string, options: vscode.FormattingOptions): Promise<string> {
        try {
            const formatted = await prettier.format(html, {
                parser: 'html',
                printWidth: 120,
                tabWidth: options.tabSize,
                useTabs: !options.insertSpaces,
                htmlWhitespaceSensitivity: 'css',
                bracketSameLine: true
            });
            return formatted;
        } catch (error) {
            console.error('Error formatting HTML:', error);
            return html; // Return original if formatting fails
        }
    }

    private splitIntoSections(text: string): Array<{ type: 'html' | 'jte', content: string }> {
        const sections: Array<{ type: 'html' | 'jte', content: string }> = [];
        let currentContent = '';
        let inJteBlock = false;
        
        // Simple tokenizer - you might need to make this more robust
        const lines = text.split('\n');
        
        for (const line of lines) {
            if (line.trim().startsWith('@')) {
                // If we were collecting HTML, save it
                if (!inJteBlock && currentContent) {
                    sections.push({ type: 'html', content: currentContent });
                    currentContent = '';
                }
                inJteBlock = true;
                currentContent += line + '\n';
            } else if (inJteBlock && !line.trim()) {
                // Empty line after JTE block ends the block
                sections.push({ type: 'jte', content: currentContent });
                currentContent = '';
                inJteBlock = false;
            } else {
                if (inJteBlock) {
                    currentContent += line + '\n';
                } else {
                    if (!currentContent) {
                        currentContent = line + '\n';
                    } else {
                        currentContent += line + '\n';
                    }
                }
            }
        }
        
        // Don't forget the last section
        if (currentContent) {
            sections.push({
                type: inJteBlock ? 'jte' : 'html',
                content: currentContent
            });
        }
        
        return sections;
    }
} 