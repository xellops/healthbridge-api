import { join } from 'node:path';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from '../shared/utils/snake-naming.strategy';

// Shared by the Nest app and the TypeORM CLI. Schema changes go through
// migrations only; never enable synchronize.
export function databaseOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: false,
    migrationsRun: false,
    migrationsTableName: 'migrations',
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  };
}
