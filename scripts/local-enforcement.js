#!/usr/bin/env node

/**
 * Local enforcement script that runs on pre-commit
 * Fails fast on any policy violations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running local enforcement checks...\n');

let failures = [];

// Check 1: pnpm-only enforcement with annotations
try {
  execSync(path.join(__dirname, 'enforce-pnpm-with-annotations.sh'), { stdio: 'pipe' });
  console.log('✅ pnpm-only enforcement PASSED');
} catch (error) {
  console.log('❌ pnpm-only enforcement FAILED');
  failures.push('pnpm-only violations found');
  console.error(error.stdout?.toString() || error.message);
}

// Check 2: Storage pattern enforcement
try {
  execSync(path.join(__dirname, 'enforce-storage-pattern.sh'), { stdio: 'pipe' });
  console.log('✅ Storage pattern enforcement PASSED');
} catch (error) {
  console.log('❌ Storage pattern enforcement FAILED');
  failures.push('Direct storage access found');
  console.error(error.stdout?.toString() || error.message);
}

// Check 3: No timeouts enforcement
try {
  execSync(path.join(__dirname, 'enforce-no-timeouts.sh'), { stdio: 'pipe' });
  console.log('✅ No timeouts enforcement PASSED');
} catch (error) {
  console.log('❌ No timeouts enforcement FAILED');
  failures.push('Timeout patterns found');
  console.error(error.stdout?.toString() || error.message);
}

// Check 4: Shell script standards
try {
  execSync(path.join(__dirname, 'enforce-shell-standards.sh'), { stdio: 'pipe' });
  console.log('✅ Shell script standards PASSED');
} catch (error) {
  console.log('❌ Shell script standards FAILED');
  failures.push('Shell script violations found');
  console.error(error.stdout?.toString() || error.message);
}

// Check 5: No secrets in staged files
try {
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  
  for (const file of stagedFiles) {
    if (!fs.existsSync(file)) continue;
    
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for obvious secrets
    const secretPatterns = [
      /NETLIFY_AUTH_TOKEN\s*=\s*['"]?[a-zA-Z0-9._-]+['"]?/,
      /JWT_SECRET\s*=\s*['"]?[a-zA-Z0-9._-]+['"]?/,
      /api[_-]?key\s*[:=]\s*['"]?[a-zA-Z0-9._-]{20,}['"]?/i,
      /password\s*[:=]\s*['"]?[^'"]{8,}['"]?/i,
    ];
    
    for (const pattern of secretPatterns) {
      if (pattern.test(content)) {
        console.log(`❌ Potential secret found in ${file}`);
        failures.push(`Secret pattern in ${file}`);
        break;
      }
    }
  }
  
  if (!failures.some(f => f.includes('Secret pattern'))) {
    console.log('✅ No secrets detected in staged files');
  }
} catch (error) {
  console.log('❌ Secret scanning FAILED');
  failures.push('Error scanning for secrets');
  console.error(error.message);
}

// Report results
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Local Enforcement Summary');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (failures.length > 0) {
  console.log('\n❌ COMMIT BLOCKED - Fix these issues:');
  failures.forEach((failure, index) => {
    console.log(`   ${index + 1}. ${failure}`);
  });
  console.log('\n💡 Tips:');
  console.log('   - Run "pnpm test:local:all" to check all patterns');
  console.log('   - Use annotations for documentation examples');
  console.log('   - See CONTRIBUTING.md for guidelines');
  console.log('   - Ask for help if you need exceptions\n');
  process.exit(1);
} else {
  console.log('\n✅ All enforcement checks PASSED - ready to commit!\n');
}