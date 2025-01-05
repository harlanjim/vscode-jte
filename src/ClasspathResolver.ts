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
        const config = vscode.workspace.getConfiguration('jte');
        const commonJdkClasses = config.get<string[]>('common.jdk.classes') || [];
        commonJdkClasses.forEach(c => this.jdkClasses.add(c));
    }

    getAllAvailableClasses(): string[] {
        return [...this.jdkClasses, ...this.mavenDependencies];
    }
}