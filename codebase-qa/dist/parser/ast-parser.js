/**
 * AST Parser for extracting code structure
 *
 * Learning focus (Phase 0):
 * - Abstract Syntax Trees (ASTs) help us understand code structure programmatically
 * - Metadata preservation ensures we track context (line numbers, scope, relationships)
 * - Code as Data: understanding code semantically, not just as text
 *
 * This uses a simplified parsing approach for demonstration.
 * In production, you'd use typescript compiler API or similar.
 */
export class ASTParser {
    /**
     * Parse a TypeScript/JavaScript file and extract its structure
     *
     * Key learning: This demonstrates extracting semantic structure from text
     */
    parseFile(filePath, content) {
        const fileName = filePath.split('/').pop() || filePath;
        const language = this.detectLanguage(filePath);
        const nodes = [];
        const imports = [];
        const exports = [];
        const dependencies = [];
        const lines = content.split('\n');
        // Extract imports and dependencies
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Find import statements
            const importMatch = line.match(/^import\s+(?:{[^}]*}|[^'"\s]+)\s+from\s+['"]([^'"]+)['"]/);
            if (importMatch) {
                const importPath = importMatch[1];
                imports.push(importPath);
                if (!importPath.startsWith('.')) {
                    dependencies.push(importPath);
                }
            }
            // Find export statements
            if (line.includes('export ')) {
                const exportMatch = line.match(/export\s+(?:default\s+)?(?:function|class|interface|type|const|let|var)\s+(\w+)/);
                if (exportMatch) {
                    exports.push(exportMatch[1]);
                }
            }
        }
        // Extract functions, classes, and interfaces
        nodes.push(...this.extractFunctions(lines));
        nodes.push(...this.extractClasses(lines));
        nodes.push(...this.extractInterfaces(lines));
        return {
            filePath,
            fileName,
            language,
            nodes,
            imports,
            exports,
            dependencies,
        };
    }
    /**
     * Extract function definitions with metadata
     * Learning: Understanding function scope and signatures
     */
    extractFunctions(lines) {
        const functions = [];
        const functionPattern = /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/;
        const arrowFunctionPattern = /^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Regular function declaration
            let match = line.match(functionPattern);
            if (match) {
                const name = match[1];
                const params = match[2];
                const signature = `function ${name}(${params})`;
                const startLine = i + 1;
                const endLine = this.findBlockEnd(lines, i);
                functions.push({
                    type: 'function',
                    name,
                    startLine,
                    endLine,
                    signature,
                    children: [],
                    imports: [],
                });
                i = endLine - 1;
                continue;
            }
            // Arrow function or const function
            match = line.match(arrowFunctionPattern);
            if (match) {
                const name = match[1];
                const params = match[2];
                const signature = `const ${name} = (${params}) => ...`;
                const startLine = i + 1;
                const endLine = this.findBlockEnd(lines, i);
                functions.push({
                    type: 'function',
                    name,
                    startLine,
                    endLine,
                    signature,
                    children: [],
                    imports: [],
                });
                i = endLine - 1;
            }
        }
        return functions;
    }
    /**
     * Extract class definitions with metadata
     */
    extractClasses(lines) {
        const classes = [];
        const classPattern = /^(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?/;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(classPattern);
            if (match) {
                const name = match[1];
                const startLine = i + 1;
                const endLine = this.findBlockEnd(lines, i);
                classes.push({
                    type: 'class',
                    name,
                    startLine,
                    endLine,
                    children: [],
                    imports: [],
                });
                i = endLine - 1;
            }
        }
        return classes;
    }
    /**
     * Extract interface definitions
     */
    extractInterfaces(lines) {
        const interfaces = [];
        const interfacePattern = /^(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+([^{]+))?/;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(interfacePattern);
            if (match) {
                const name = match[1];
                const startLine = i + 1;
                const endLine = this.findBlockEnd(lines, i);
                interfaces.push({
                    type: 'interface',
                    name,
                    startLine,
                    endLine,
                    children: [],
                    imports: [],
                });
                i = endLine - 1;
            }
        }
        return interfaces;
    }
    /**
     * Find the end line of a code block (matching braces)
     * Learning: Understanding code structure through brace matching
     */
    findBlockEnd(lines, startIndex) {
        let braceCount = 0;
        let foundStart = false;
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i];
            for (const char of line) {
                if (char === '{') {
                    foundStart = true;
                    braceCount++;
                }
                else if (char === '}') {
                    braceCount--;
                    if (foundStart && braceCount === 0) {
                        return i + 1;
                    }
                }
            }
        }
        return lines.length;
    }
    /**
     * Detect programming language from file extension
     */
    detectLanguage(filePath) {
        if (filePath.endsWith('.ts'))
            return 'typescript';
        if (filePath.endsWith('.tsx'))
            return 'tsx';
        if (filePath.endsWith('.js'))
            return 'javascript';
        if (filePath.endsWith('.jsx'))
            return 'jsx';
        if (filePath.endsWith('.py'))
            return 'python';
        return 'unknown';
    }
    /**
     * Extract documentation/comments for a node
     * Learning: Comments are metadata that help understand code intent
     */
    getDocumentation(lines, nodeStartLine) {
        if (nodeStartLine <= 1)
            return undefined;
        const docLines = [];
        // Look backwards for JSDoc or comment blocks
        for (let i = nodeStartLine - 2; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.startsWith('*') || line.startsWith('*/') || line.startsWith('/**')) {
                docLines.unshift(line);
            }
            else if (line.startsWith('//')) {
                docLines.unshift(line);
            }
            else if (line === '') {
                // Empty line might be fine, continue looking
                continue;
            }
            else {
                // Stop if we hit other code
                break;
            }
        }
        return docLines.length > 0 ? docLines.join('\n') : undefined;
    }
}
/**
 * Usage example demonstrating AST parsing
 */
export function parseCodebaseStructure() {
    const structures = new Map();
    // This would recursively walk the directory
    // For now, it's a placeholder for Phase 0 foundation
    // Phase 1 will expand this to handle full directory traversal
    return Promise.resolve(structures);
}
//# sourceMappingURL=ast-parser.js.map