import gciPages from "@/data/gci_pages.json";
import type { GCIPage } from "@/types";

export function getGCILink(scientificName: string): string | undefined {
  const page = (gciPages as GCIPage[]).find(
    (p) => p.name.toLowerCase() === scientificName.toLowerCase()
  );
  return page?.url;
}
