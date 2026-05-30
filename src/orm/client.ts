/**
 * ORM connection (singleton) + seed-on-boot.
 *
 * Default: sqljs (SQLite WASM) in-memory — no native binary, boots anywhere
 * (Bolt.new / WebContainer / edge). Switch via env (DB_DIALECT / DATABASE_URL):
 *   DB_DIALECT=sqlite DATABASE_URL=./blog.db   # local Node, durable (npm i better-sqlite3)
 *   DB_DIALECT=pglite DATABASE_URL=idb://blog  # Postgres WASM, browser-persistent
 *
 * @author Dr Hamid MADANI <drmdh@msn.com>
 */
import { createConnection, type IDialect } from '@mostajs/orm';
import { ALL_SCHEMAS } from './schemas.js';
import { seedIfEmpty } from './seed-on-boot.js';

let _dialect: IDialect | null = null;

export async function getOrm(): Promise<IDialect> {
  if (_dialect) return _dialect;
  _dialect = await createConnection(
    {
      dialect: (process.env.DB_DIALECT as 'sqljs' | 'sqlite' | 'pglite') ?? 'sqljs',
      uri: process.env.DATABASE_URL ?? ':memory:',
      schemaStrategy: 'update',
      showSql: process.env.NODE_ENV !== 'production',
    },
    ALL_SCHEMAS,
  );
  await seedIfEmpty(_dialect); // anti-empty-state on in-memory / Bolt
  return _dialect;
}
