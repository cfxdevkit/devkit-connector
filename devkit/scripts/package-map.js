#!/usr/bin/env node

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PACKAGES_DIR = 'packages';

function getPackageInfo(packageName) {
  const packagePath = join(PACKAGES_DIR, packageName, 'package.json');
  
  if (!existsSync(packagePath)) {
    return null;
  }
  
  try {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    return {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description || 'No description available',
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {},
      peerDependencies: packageJson.peerDependencies || {},
      keywords: packageJson.keywords || [],
      author: packageJson.author || 'Unknown',
      license: packageJson.license || 'MIT'
    };
  } catch (error) {
    console.error(`❌ Failed to read package.json for ${packageName}:`, error.message);
    return null;
  }
}

function getTypeExports(packageName) {
  const distPath = join(PACKAGES_DIR, packageName, 'dist');
  
  if (!existsSync(distPath)) {
    return { available: false, exports: [] };
  }
  
  try {
    // Find all .d.ts files in the dist directory
    const findDtsFiles = (dir) => {
      const files = [];
      const items = readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(dir, item.name);
        if (item.isDirectory()) {
          files.push(...findDtsFiles(fullPath));
        } else if (item.name.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      }
      return files;
    };
    
    const dtsFiles = findDtsFiles(distPath);
    
    if (dtsFiles.length === 0) {
      return { available: false, exports: [] };
    }
    
    const exports = [];
    
    // Process each .d.ts file
    for (const filePath of dtsFiles) {
      try {
        const typesContent = readFileSync(filePath, 'utf8');
        
        // Extract interface definitions
        const interfaces = typesContent.match(/export\s+interface\s+(\w+)/g) || [];
        interfaces.forEach(iface => {
          const name = iface.replace('export interface ', '');
          exports.push({ type: 'interface', name });
        });
        
        // Extract type definitions
        const types = typesContent.match(/export\s+type\s+(\w+)/g) || [];
        types.forEach(type => {
          const name = type.replace('export type ', '');
          exports.push({ type: 'type', name });
        });
        
        // Extract class definitions
        const classes = typesContent.match(/export\s+class\s+(\w+)/g) || [];
        classes.forEach(cls => {
          const name = cls.replace('export class ', '');
          exports.push({ type: 'class', name });
        });
        
        // Extract function definitions
        const functions = typesContent.match(/export\s+function\s+(\w+)/g) || [];
        functions.forEach(func => {
          const name = func.replace('export function ', '');
          exports.push({ type: 'function', name });
        });
        
        // Extract const definitions
        const constants = typesContent.match(/export\s+const\s+(\w+)/g) || [];
        constants.forEach(constant => {
          const name = constant.replace('export const ', '');
          exports.push({ type: 'const', name });
        });
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }
    
    // Remove duplicates
    const uniqueExports = exports.filter((exp, index, self) => 
      index === self.findIndex(e => e.name === exp.name && e.type === exp.type)
    );
    
    return { available: true, exports: uniqueExports };
  } catch (error) {
    return { available: false, exports: [] };
  }
}

function getPackageDependencies(packageInfo) {
  const deps = {
    internal: [],
    external: [],
    dev: []
  };
  
  // Internal dependencies (workspace packages)
  Object.entries(packageInfo.dependencies).forEach(([name, version]) => {
    if (name.startsWith('@conflux-devkit/')) {
      deps.internal.push({ name, version });
    } else {
      deps.external.push({ name, version });
    }
  });
  
  // Dev dependencies
  Object.entries(packageInfo.devDependencies).forEach(([name, version]) => {
    deps.dev.push({ name, version });
  });
  
  return deps;
}

function generateAsciiDiagram(packages) {
  const diagram = [];
  
  // Header
  diagram.push('┌─────────────────────────────────────────────────────────────────────────────────┐');
  diagram.push('│                    Conflux DevKit Package Relationship Map                     │');
  diagram.push('└─────────────────────────────────────────────────────────────────────────────────┘');
  diagram.push('');
  
  // Core packages (foundation)
  const corePackages = packages.filter(pkg => 
    pkg.name.includes('core') || 
    pkg.name.includes('blockchain') || 
    pkg.name.includes('state')
  );
  
  diagram.push('🏗️  FOUNDATION LAYER');
  diagram.push('┌─────────────────────────────────────────────────────────────────────────────────┐');
  corePackages.forEach(pkg => {
    const deps = getPackageDependencies(pkg);
    const internalDeps = deps.internal.map(dep => dep.name.split('/')[1]).join(', ');
    diagram.push(`│ ${pkg.name.split('/')[1].padEnd(15)} │ v${pkg.version.padEnd(8)} │ Deps: ${internalDeps.padEnd(20)} │`);
  });
  diagram.push('└─────────────────────────────────────────────────────────────────────────────────┘');
  diagram.push('');
  
  // Node packages
  const nodePackages = packages.filter(pkg => 
    pkg.name.includes('node') || 
    pkg.name.includes('api-server')
  );
  
  diagram.push('🖥️  NODE LAYER');
  diagram.push('┌─────────────────────────────────────────────────────────────────────────────────┐');
  nodePackages.forEach(pkg => {
    const deps = getPackageDependencies(pkg);
    const internalDeps = deps.internal.map(dep => dep.name.split('/')[1]).join(', ');
    diagram.push(`│ ${pkg.name.split('/')[1].padEnd(15)} │ v${pkg.version.padEnd(8)} │ Deps: ${internalDeps.padEnd(20)} │`);
  });
  diagram.push('└─────────────────────────────────────────────────────────────────────────────────┘');
  diagram.push('');
  
  // UI packages
  const uiPackages = packages.filter(pkg => 
    pkg.name.includes('ui-') || 
    pkg.name.includes('showcase')
  );
  
  diagram.push('🎨 UI LAYER');
  diagram.push('┌─────────────────────────────────────────────────────────────────────────────────┐');
  uiPackages.forEach(pkg => {
    const deps = getPackageDependencies(pkg);
    const internalDeps = deps.internal.map(dep => dep.name.split('/')[1]).join(', ');
    diagram.push(`│ ${pkg.name.split('/')[1].padEnd(15)} │ v${pkg.version.padEnd(8)} │ Deps: ${internalDeps.padEnd(20)} │`);
  });
  diagram.push('└─────────────────────────────────────────────────────────────────────────────────┘');
  diagram.push('');
  
  // Dependency flow diagram
  diagram.push('🔄 DEPENDENCY FLOW');
  diagram.push('┌─────────────────────────────────────────────────────────────────────────────────┐');
  diagram.push('│ core ──┐                                                                       │');
  diagram.push('│        ├──► blockchain ──┐                                                     │');
  diagram.push('│        └──► state ───────┼──► node ──┐                                        │');
  diagram.push('│                          │           ├──► api-server ──┐                      │');
  diagram.push('│                          │           └──► showcase ────┼──► showcase-webapp    │');
  diagram.push('│                          │                             │                      │');
  diagram.push('│                          └──► ui-primitives ──────────┼──► ui-components      │');
  diagram.push('│                                                      │                      │');
  diagram.push('└─────────────────────────────────────────────────────────────────────────────────┘');
  diagram.push('');
  
  return diagram.join('\n');
}

function generateTypeMap(packages) {
  const typeMap = [];
  
  typeMap.push('📝 TYPE EXPORTS MAP');
  typeMap.push('┌─────────────────────────────────────────────────────────────────────────────────┐');
  
  packages.forEach(pkg => {
    const typeInfo = getTypeExports(pkg.name.split('/')[1]);
    const shortName = pkg.name.split('/')[1];
    
    if (typeInfo.available && typeInfo.exports.length > 0) {
      typeMap.push(`│ ${shortName.padEnd(15)} │ ${typeInfo.exports.length.toString().padEnd(3)} exports │`);
      
      // Group by type
      const byType = typeInfo.exports.reduce((acc, exp) => {
        if (!acc[exp.type]) acc[exp.type] = [];
        acc[exp.type].push(exp.name);
        return acc;
      }, {});
      
      Object.entries(byType).forEach(([type, names]) => {
        const typeLabel = type.toUpperCase();
        const namesList = names.slice(0, 5).join(', '); // Show first 5
        const more = names.length > 5 ? ` (+${names.length - 5} more)` : '';
        typeMap.push(`│ ${' '.repeat(17)} │   ${typeLabel.padEnd(8)}: ${namesList}${more.padEnd(30)} │`);
      });
    } else {
      typeMap.push(`│ ${shortName.padEnd(15)} │ No types available (run build first)                    │`);
    }
    typeMap.push('│─────────────────────────────────────────────────────────────────────────────────│');
  });
  
  typeMap.push('└─────────────────────────────────────────────────────────────────────────────────┘');
  
  return typeMap.join('\n');
}

function generateDependencyMatrix(packages) {
  const matrix = [];
  
  matrix.push('🔗 DEPENDENCY MATRIX');
  matrix.push('┌─────────────────────────────────────────────────────────────────────────────────┐');
  
  // Create header
  const shortNames = packages.map(pkg => pkg.name.split('/')[1]);
  const header = '│'.padEnd(4) + shortNames.map(name => name.padEnd(8)).join('│') + '│';
  matrix.push(header);
  matrix.push('│' + '─'.repeat(header.length - 2) + '│');
  
  // Create matrix rows
  packages.forEach(pkg => {
    const shortName = pkg.name.split('/')[1];
    const deps = getPackageDependencies(pkg);
    const internalDeps = deps.internal.map(dep => dep.name.split('/')[1]);
    
    const row = '│' + shortName.padEnd(4) + '│';
    const cells = shortNames.map(targetName => {
      if (targetName === shortName) return 'self'.padEnd(8);
      if (internalDeps.includes(targetName)) return '✓'.padEnd(8);
      return ' '.padEnd(8);
    }).join('│');
    
    matrix.push(row + cells + '│');
  });
  
  matrix.push('└─────────────────────────────────────────────────────────────────────────────────┘');
  matrix.push('');
  matrix.push('Legend: ✓ = depends on, self = self-reference, blank = no dependency');
  
  return matrix.join('\n');
}

function displayPackageMap() {
  console.log('🚀 Conflux DevKit Package Relationship Mapper\n');
  
  // Get all packages
  const packages = readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => !name.startsWith('.')) // Exclude hidden directories
    .map(name => getPackageInfo(name))
    .filter(info => info !== null);
  
  console.log(`📦 Found ${packages.length} packages:\n`);
  
  // Generate and display ASCII diagram
  console.log(generateAsciiDiagram(packages));
  console.log('');
  
  // Generate and display type map
  console.log(generateTypeMap(packages));
  console.log('');
  
  // Generate and display dependency matrix
  console.log(generateDependencyMatrix(packages));
  console.log('');
  
  // Package details
  console.log('📋 PACKAGE DETAILS');
  console.log('┌─────────────────────────────────────────────────────────────────────────────────┐');
  packages.forEach(pkg => {
    const deps = getPackageDependencies(pkg);
    const typeInfo = getTypeExports(pkg.name.split('/')[1]);
    
    console.log(`│ ${pkg.name}`);
    console.log(`│   Version: ${pkg.version} | License: ${pkg.license}`);
    console.log(`│   Description: ${pkg.description}`);
    console.log(`│   Internal Deps: ${deps.internal.length} | External Deps: ${deps.external.length} | Dev Deps: ${deps.dev.length}`);
    console.log(`│   Type Exports: ${typeInfo.available ? typeInfo.exports.length : 'Not available'}`);
    console.log('│─────────────────────────────────────────────────────────────────────────────────│');
  });
  console.log('└─────────────────────────────────────────────────────────────────────────────────┘');
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case '--help':
    case 'help':
      console.log(`
Usage: pnpm package-map [command]

Commands:
  package-map                    Show complete package relationship map
  package-map help               Show this help message

Features:
  - ASCII diagram of package relationships
  - Type exports mapping for each package
  - Dependency matrix showing inter-package connections
  - Detailed package information
  - Visual representation of the monorepo structure

Examples:
  pnpm package-map               # Show complete map
      `);
      break;
    default:
      displayPackageMap();
      break;
  }
}

main();
