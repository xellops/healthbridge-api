// Usage: yarn migration:generate <name>
// Diffs the entities against the database and writes
// src/database/migrations/<timestamp>-<name>.ts, e.g. 1792257823300-create-users-table.ts
const { execFileSync } = require('node:child_process');

const input = process.argv[2];
// Accept kebab-case, or convert camelCase/PascalCase/snake_case to it.
const name = input
  ?.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/[\s_]+/g, '-')
  .toLowerCase();

if (!name || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
  console.error(
    'Usage: yarn migration:generate <name>   (kebab-case, e.g. create-patients-table)',
  );
  process.exit(1);
}

try {
  execFileSync(
    'typeorm-ts-node-commonjs',
    [
      '-d',
      'src/database/data-source.ts',
      'migration:generate',
      `src/database/migrations/${name}`,
      '--pretty',
    ],
    { stdio: 'inherit' },
  );
  execFileSync('prettier', ['--write', 'src/database/migrations/*.ts'], {
    stdio: 'inherit',
  });
} catch (err) {
  process.exit(err.status ?? 1);
}
