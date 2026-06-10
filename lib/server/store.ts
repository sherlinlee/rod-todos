import { get, put } from "@vercel/blob";
import type { RodSyncData } from "@/lib/sync-types";

const BLOB_PATHNAME = "rod-sync.json";

function blobConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN),
  );
}

export async function loadSyncData(): Promise<RodSyncData | null> {
  if (!blobConfigured()) return null;

  try {
    const result = await get(BLOB_PATHNAME, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;

    const text = await new Response(result.stream).text();
    return JSON.parse(text) as RodSyncData;
  } catch {
    return null;
  }
}

export async function saveSyncData(data: RodSyncData): Promise<boolean> {
  if (!blobConfigured()) return false;

  try {
    await put(BLOB_PATHNAME, JSON.stringify(data), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return true;
  } catch {
    return false;
  }
}

export function isSyncStorageConfigured() {
  return blobConfigured();
}
