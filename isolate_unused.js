const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.json', '.png', '.jpg', '.jpeg', '.svg', '.gif'],
    entryPoints: ['main.jsx', 'main.js', 'index.js', 'index.jsx', 'App.jsx', 'App.js'],
    excludeDirs: ['node_modules', '.git', 'dist', 'build', 'coverage', '_deprecated'],
    excludeFiles: ['vite.config.js', 'package.json', 'package-lock.json', '.env', '.gitignore', 'README.md', 'setupTests.js']
};

const args = process.argv.slice(2);
const targetDir = args[0] ? path.resolve(args[0]) : path.resolve('src');
const dryRun = !args.includes('--move');

if (!fs.existsSync(targetDir)) {
    console.error(`Error: Target directory "${targetDir}" does not exist.`);
    process.exit(1);
}

console.log(`Scanning directory: ${targetDir}`);
console.log(`Mode: ${dryRun ? 'DRY RUN (no files will be moved)' : 'LIVE (unused files will be moved to _deprecated)'}`);

// Helper to get all files recursively
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!CONFIG.excludeDirs.includes(file)) {
                getAllFiles(filePath, fileList);
            }
        } else {
            if (!CONFIG.excludeFiles.includes(file) && CONFIG.extensions.includes(path.extname(file))) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

// Helper to extract imports from content
function getImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const imports = [];

    // Regex for import ... from '...'
    const importRegex = /import\s+(?:[\w\s{},*]+from\s+)?['"](.*?)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
    }

    // Regex for require('...')
    const requireRegex = /require\(['"](.*?)['"]\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
        imports.push(match[1]);
    }

    // Regex for dynamic import('...')
    const dynamicImportRegex = /import\(['"](.*?)['"]\)/g;
    while ((match = dynamicImportRegex.exec(content)) !== null) {
        imports.push(match[1]);
    }

    // CSS/SCSS imports @import '...'
    const cssImportRegex = /@import\s+['"](.*?)['"]/g;
    while ((match = cssImportRegex.exec(content)) !== null) {
        imports.push(match[1]);
    }

    // CSS/SCSS url(...)
    const cssUrlRegex = /url\(['"]?(.*?)['"]?\)/g;
    while ((match = cssUrlRegex.exec(content)) !== null) {
        imports.push(match[1]);
    }

    return imports;
}

// Resolve import path to absolute file path
function resolveImport(sourceFile, importPath) {
    if (importPath.startsWith('.')) {
        const dir = path.dirname(sourceFile);
        const absolutePath = path.resolve(dir, importPath);

        // Try exact match
        if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
            return absolutePath;
        }

        // Try with extensions
        for (const ext of CONFIG.extensions) {
            if (fs.existsSync(absolutePath + ext)) {
                return absolutePath + ext;
            }
        }

        // Try as directory with index file
        if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) {
            for (const ext of CONFIG.extensions) {
                const indexFile = path.join(absolutePath, `index${ext}`);
                if (fs.existsSync(indexFile)) {
                    return indexFile;
                }
            }
        }
    }
    // Non-relative imports (node_modules or aliases) are ignored for now as we only care about local files being used
    return null;
}

// Main logic
const allFiles = getAllFiles(targetDir);
const usedFiles = new Set();

// Mark entry points as used
allFiles.forEach(file => {
    if (CONFIG.entryPoints.includes(path.basename(file))) {
        usedFiles.add(file);
    }
});

// Build dependency graph (simplified)
// We iterate multiple times to propagate usage? 
// Actually, we just need to find everything reachable from entry points?
// Or simpler: just find ALL files that are imported by ANY file. 
// If file A is imported by file B, and file B is unused, then A is technically unused too (unless A is imported by C which is used).
// But for a "safe" cleanup, we usually just want to find files that are NEVER imported by ANYONE.
// Let's start with "referenced by anyone" approach. If A imports B, B is "referenced".
// If we want true tree shaking, we need to start from entry points and traverse.
// Let's do the "referenced by anyone" check first as it's safer (less likely to delete something used dynamically or implicitly).
// Wait, "referenced by anyone" is safer? No, if A imports B, and A is unused, B is also unused.
// But if we just check "is B imported?", we see yes (by A), so we keep B.
// This leaves "islands" of unused code.
// The user asked to "isolate unused files".
// Let's try to do a Reachability analysis from Entry Points.

// 1. Identify Entry Points (files that are definitely used)
// We'll assume files in the root of src matching CONFIG.entryPoints are roots.
// Also, we might need to consider all files in 'pages' or 'routes' as roots if they are auto-loaded?
// Let's stick to the "Referenced by ANY file" metric for safety first. 
// If the user wants deeper cleaning, we can refine.
// "Scan the src folder to find files that are not referenced in the current codebase." -> This implies "referenced by any other file".

const referencedFiles = new Set();

allFiles.forEach(file => {
    const imports = getImports(file);
    imports.forEach(imp => {
        const resolved = resolveImport(file, imp);
        if (resolved) {
            referencedFiles.add(resolved);
        }
    });
});

// Also add entry points to referenced so they aren't moved (though they are usually not imported by others, but by the system)
allFiles.forEach(file => {
    if (CONFIG.entryPoints.includes(path.basename(file))) {
        referencedFiles.add(file);
    }
});

const unusedFiles = allFiles.filter(file => !referencedFiles.has(file));

console.log(`\nTotal files found: ${allFiles.length}`);
console.log(`Referenced files: ${referencedFiles.size}`);
console.log(`Unused files: ${unusedFiles.length}`);

if (unusedFiles.length > 0) {
    console.log('\nUnused Files:');
    unusedFiles.forEach(f => console.log(`- ${path.relative(targetDir, f)}`));

    if (!dryRun) {
        const deprecatedDir = path.join(path.dirname(targetDir), '_deprecated');
        if (!fs.existsSync(deprecatedDir)) {
            fs.mkdirSync(deprecatedDir);
        }

        unusedFiles.forEach(file => {
            const relativePath = path.relative(targetDir, file);
            const destPath = path.join(deprecatedDir, relativePath);
            const destDir = path.dirname(destPath);

            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            fs.renameSync(file, destPath);
            console.log(`Moved: ${relativePath}`);
        });
        console.log(`\nMoved ${unusedFiles.length} files to ${deprecatedDir}`);
    } else {
        console.log('\nRun with --move to actually move these files.');
    }
} else {
    console.log('\nNo unused files found!');
}
