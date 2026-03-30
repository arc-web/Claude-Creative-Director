#!/usr/bin/env node

/**
 * Universal test runner
 * Supports both custom tests and Jest tests
 * Usage: node run-all-tests.js [--jest] [test-file]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const useJest = args.includes('--jest');
const testFile = args.find(arg => !arg.startsWith('--'));

// If explicit Jest flag or test file in tests/ dir, use Jest
if (useJest || (testFile && testFile.includes('tests/'))) {
  console.log('Running Jest tests...\n');
  try {
    const testPattern = testFile || 'tests/**/*.test.js';
    execSync(`npx jest ${testPattern} --no-coverage`, {
      stdio: 'inherit',
      cwd: __dirname,
    });
  } catch (error) {
    process.exit(1);
  }
} else {
  // Run custom test runner
  console.log('Running custom tests...\n');
  require('./run-tests.js');
}
