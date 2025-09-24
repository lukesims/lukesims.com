import { stat } from "node:fs/promises";

export async function exists(path: string) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    return false;
  }
}
