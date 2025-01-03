import * as fs from 'fs';
import * as path from 'path';

export class ClassResolver {
    private projectRoot: string;
    private classes: string[] = [];

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
    }

    getProjectRoot(): string {
        return this.projectRoot;
    }

    async resolveClasses(): Promise<string[]> {
        if (this.classes.length > 0) {
            return this.classes;
        }

        // Add common JDK classes
        this.classes.push(
            'java.util.List',
            'java.util.ArrayList',
            'jakarta.servlet.http.HttpServletResponse'
        );

        // Add project classes
        const projectClasses = await this.findJavaFiles(this.projectRoot);
        this.classes.push(...projectClasses);

        return this.classes;
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