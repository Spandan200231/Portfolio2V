#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function migrate() {
  try {
    console.log('Running database migrations...');
    await execAsync('npx drizzle-kit push');
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Database migration failed:', error);
    process.exit(1);
  }
}

migrate();