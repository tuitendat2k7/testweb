import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// Code cứng cấu hình kết nối PostgreSQL
export const createPool = () => {
  return new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'fptadmin2026', // Mật khẩu bạn sẽ tạo ở Bước 2
    database: 'coc_food_db',  // Tên database bạn sẽ tạo
    port: 5432,
    connectionTimeoutMillis: 15000,
  });
};

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });
export { schema };