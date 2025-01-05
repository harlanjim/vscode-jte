import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
export class TypeResolver {
    private projectRoot: string;
    private types: string[] = [];

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
    }

    getProjectRoot(): string {
        return this.projectRoot;
    }

    async resolveTypes(): Promise<string[]> {
        if (this.types.length > 0) {
            return this.types;
        }

        // Add common JDK classes
        const config = vscode.workspace.getConfiguration('jte');
        const commonJdkClasses = config.get<string[]>('java.types') || [];
        commonJdkClasses.forEach(c => this.types.push(c));

        // Add project classes
        const projectTypes = await this.findJavaFiles(this.projectRoot);
        this.types.push(...projectTypes);

        return this.types;
    }

    private async findJavaFiles(rootPath: string): Promise<string[]> {
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
                        // Extract just the class name from the file
                        const className = entry.name.replace('.java', '');
                        files.push(className);
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