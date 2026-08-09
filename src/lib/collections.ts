import { getDb, isMongoConfigured } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/song";
import type { CollectionInfo, CollectionRecord, SongCollection } from "@/types";

async function store() {
  return (await getDb()).collection<CollectionRecord>("collections");
}

export async function getCollections(): Promise<CollectionInfo[]> {
  if (!isMongoConfigured()) return COLLECTIONS.map((item) => ({ ...item }));

  const songs = await store();
  let rows = await songs.find().sort({ order: 1 }).toArray();

  if (rows.length === 0) {
    await songs.insertMany(
      COLLECTIONS.map((item, order) => ({ _id: item.id, label: item.label, numbered: item.numbered, order })),
      { ordered: false },
    );
    rows = await songs.find().sort({ order: 1 }).toArray();
  }

  return rows.map((row) => ({ id: row._id, label: row.label, numbered: row.numbered }));
}

export async function addCollection(
  id: SongCollection,
  label: string,
  numbered: boolean,
): Promise<boolean> {
  const songs = await store();
  if (await songs.findOne({ _id: id })) return false;
  const order = await songs.countDocuments();
  await songs.insertOne({ _id: id, label, numbered, order });
  return true;
}

export async function renameCollection(id: SongCollection, label: string): Promise<void> {
  await (await store()).updateOne({ _id: id }, { $set: { label } });
}
