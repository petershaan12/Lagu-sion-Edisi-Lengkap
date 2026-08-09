import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "lagusion";

declare global {
  var lagusionMongoClient: Promise<MongoClient> | undefined;
}

export function isMongoConfigured(): boolean {
  return Boolean(uri);
}

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("MONGODB_URI belum dikonfigurasi.");

  global.lagusionMongoClient ??= new MongoClient(uri).connect();
  const client = await global.lagusionMongoClient;
  return client.db(databaseName);
}
