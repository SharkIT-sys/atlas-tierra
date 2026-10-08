export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export function createPreferences(storage: StorageAdapter) {
  const read = (key: string): string[] => {
    try {
      const v: unknown = JSON.parse(storage.getItem("atlas:" + key) || "[]");
      return Array.isArray(v)
        ? v.filter((x): x is string => typeof x === "string")
        : [];
    } catch {
      return [];
    }
  };
  const write = (key: string, value: string[]) => {
    try {
      storage.setItem("atlas:" + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  };
  return {
    read,
    write,
    visit: (id: string) =>
      write(
        "recent",
        [id, ...read("recent").filter((x) => x !== id)].slice(0, 12),
      ),
  };
}
