import { get, put } from "@vercel/blob";
import { getSiteConfig } from "@/lib/site";
import type { BelleSyncData } from "@/lib/sync-types";

function blobPathname() {
  return getSiteConfig().syncBlobName;
}

export async function loadSyncData(): Promise<BelleSyncData | null> {
  try {
    const result = await get(blobPathname(), { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;

    const text = await new Response(result.stream).text();
    return JSON.parse(text) as BelleSyncData;
  } catch {
    return null;
  }
}

export async function saveSyncData(data: BelleSyncData): Promise<boolean> {
  try {
    await put(blobPathname(), JSON.stringify(data), {
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
