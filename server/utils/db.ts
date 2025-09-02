import pkg from "pg";
const { Pool } = pkg;

const config = useRuntimeConfig();

const pool = new Pool({
  host: config.dbHost,
  port: parseInt(config.dbPort || "5432"),
  database: config.dbName,
  user: config.dbUser,
  password: config.dbPassword,
  // Pool configuration for better concurrency handling
  max: 20, // Maximum number of clients in the pool
  min: 2, // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
});

// Handle pool errors
pool.on('error', (err) => {
  process.exit(-1)
})

export async function query(text: string, params: any) {
  let client
  try {
    client = await pool.connect()
    const result = await client.query(text, params);
    return result;
  } catch (error: any) {
    // Provide more specific error messages
    if (error.code === 'ECONNREFUSED') {
      throw new Error("Database connection refused - check if database is running");
    } else if (error.code === 'ENOTFOUND') {
      throw new Error("Database host not found - check database configuration");
    } else if (error.code === '28P01') {
      throw new Error("Database authentication failed - check credentials");
    } else if (error.code === '3D000') {
      throw new Error("Database does not exist - check database name");
    } else {
      throw new Error("Database query failed");
    }
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release()
    }
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

// Test database connection
export async function testConnection() {
  try {
    const result = await query('SELECT 1 as test', [])
    return true
  } catch (error: any) {
    return false
  }
}
