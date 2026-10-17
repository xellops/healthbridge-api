import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { databaseOptions } from './database.config';

// Entry point for the TypeORM CLI (the migration:* scripts). It runs outside
// Nest, so .env is loaded here. Don't import this file from the app.
if (existsSync('.env')) process.loadEnvFile('.env');

export default new DataSource({
  ...databaseOptions(),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
});
