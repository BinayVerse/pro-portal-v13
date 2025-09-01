import pkg from "pg";
const { Pool } = pkg;

const config = useRuntimeConfig();

const pool = new Pool({
  host: config.dbHost,
  port: parseInt(config.dbPort || "5432"),
  database: config.dbName,
  user: config.dbUser,
  password: config.dbPassword,
});

export async function query(text: string, params: any) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error("Database Query Error:", error);
    throw new Error("Database query failed");
  }
}

export async function getClient() {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    throw new Error('Database client connection failed');
  }
}
