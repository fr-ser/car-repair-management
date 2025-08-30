import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

module.exports = async function () {
  await execAsync('rm -f test.db');
  await execAsync('npx prisma migrate deploy');
  console.log();
  console.log();
  console.log('✅ Created and migrated clean testing database');
  console.log();
};
