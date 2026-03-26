import Dexie, { type Table } from "dexie"
import type { Board, Tile, AudioClip, AppSettings } from "./types"

class AacDatabase extends Dexie {
  boards!: Table<Board, string>
  tiles!: Table<Tile, string>
  audioClips!: Table<AudioClip, string>
  settings!: Table<AppSettings, string>

  constructor() {
    super("aac-communicator")
    this.version(1).stores({
      boards: "id, parentId",
      tiles: "id, boardId",
      audioClips: "id, tileId",
      settings: "locale",
    })
  }
}

export const db = new AacDatabase()
