import { db } from "./db"
import type { Board, Tile } from "./types"

const ROOT_BOARD_ID = "board-root"

const folders = [
  {
    id: "board-osecanja",
    name: "Osećanja",
    color: "#F87171",
    tiles: [
      { label: "Srećan", symbol: "happy", color: "#FCA5A5" },
      { label: "Tužan", symbol: "sad", color: "#FCA5A5" },
      { label: "Ljut", symbol: "angry", color: "#FCA5A5" },
      { label: "Uplašen", symbol: "scared", color: "#FCA5A5" },
      { label: "Umoran", symbol: "tired", color: "#FCA5A5" },
      { label: "Uzbuđen", symbol: "excited", color: "#FCA5A5" },
      { label: "Zbunjen", symbol: "confused", color: "#FCA5A5" },
      { label: "Bolestan", symbol: "sick", color: "#FCA5A5" },
      { label: "Dosadno mi je", symbol: "bored", color: "#FCA5A5" },
      { label: "Voljen", symbol: "loved", color: "#FCA5A5" },
    ],
  },
  {
    id: "board-hrana",
    name: "Hrana",
    color: "#FBBF24",
    tiles: [
      { label: "Voda", symbol: "water", color: "#FDE68A" },
      { label: "Sok", symbol: "juice", color: "#FDE68A" },
      { label: "Mleko", symbol: "milk", color: "#FDE68A" },
      { label: "Hleb", symbol: "bread", color: "#FDE68A" },
      { label: "Jabuka", symbol: "apple", color: "#FDE68A" },
      { label: "Banana", symbol: "banana", color: "#FDE68A" },
      { label: "Pirinač", symbol: "rice", color: "#FDE68A" },
      { label: "Piletina", symbol: "chicken", color: "#FDE68A" },
      { label: "Supa", symbol: "soup", color: "#FDE68A" },
      { label: "Kolač", symbol: "cake", color: "#FDE68A" },
      { label: "Sladoled", symbol: "ice_cream", color: "#FDE68A" },
      { label: "Sir", symbol: "cheese", color: "#FDE68A" },
    ],
  },
  {
    id: "board-aktivnosti",
    name: "Aktivnosti",
    color: "#34D399",
    tiles: [
      { label: "Igrati se", symbol: "play", color: "#6EE7B7" },
      { label: "Čitati", symbol: "read", color: "#6EE7B7" },
      { label: "Crtati", symbol: "draw", color: "#6EE7B7" },
      { label: "Pevati", symbol: "sing", color: "#6EE7B7" },
      { label: "Trčati", symbol: "run", color: "#6EE7B7" },
      { label: "Spavati", symbol: "sleep", color: "#6EE7B7" },
      { label: "Jesti", symbol: "eat", color: "#6EE7B7" },
      { label: "Piti", symbol: "drink", color: "#6EE7B7" },
      { label: "Gledati TV", symbol: "watch_tv", color: "#6EE7B7" },
      { label: "Šetati", symbol: "walk", color: "#6EE7B7" },
    ],
  },
  {
    id: "board-ljudi",
    name: "Ljudi",
    color: "#60A5FA",
    tiles: [
      { label: "Mama", symbol: "mother", color: "#93C5FD" },
      { label: "Tata", symbol: "father", color: "#93C5FD" },
      { label: "Baka", symbol: "grandmother", color: "#93C5FD" },
      { label: "Deka", symbol: "grandfather", color: "#93C5FD" },
      { label: "Sestra", symbol: "sister", color: "#93C5FD" },
      { label: "Brat", symbol: "brother", color: "#93C5FD" },
      { label: "Drugar", symbol: "friend_m", color: "#93C5FD" },
      { label: "Drugarica", symbol: "friend_f", color: "#93C5FD" },
      { label: "Učiteljica", symbol: "teacher", color: "#93C5FD" },
      { label: "Doktor", symbol: "doctor", color: "#93C5FD" },
    ],
  },
  {
    id: "board-mesta",
    name: "Mesta",
    color: "#A78BFA",
    tiles: [
      { label: "Kuća", symbol: "house", color: "#C4B5FD" },
      { label: "Škola", symbol: "school", color: "#C4B5FD" },
      { label: "Park", symbol: "park", color: "#C4B5FD" },
      { label: "Prodavnica", symbol: "store", color: "#C4B5FD" },
      { label: "Bolnica", symbol: "hospital", color: "#C4B5FD" },
      { label: "Igralište", symbol: "playground", color: "#C4B5FD" },
      { label: "Restoran", symbol: "restaurant", color: "#C4B5FD" },
      { label: "Biblioteka", symbol: "library", color: "#C4B5FD" },
    ],
  },
]

export const seedDatabase = async () => {
  const boardCount = await db.boards.count()
  if (boardCount > 0) return

  const allBoards: Board[] = []
  const allTiles: Tile[] = []

  const rootFolderTileIds: string[] = []

  for (const folder of folders) {
    const folderTileId = `tile-folder-${folder.id}`
    rootFolderTileIds.push(folderTileId)

    allTiles.push({
      id: folderTileId,
      boardId: ROOT_BOARD_ID,
      label: folder.name,
      symbolPath: `symbols/${folder.name.toLowerCase()}.svg`,
      audioClipId: null,
      backgroundColor: folder.color,
      type: "folder",
      targetBoardId: folder.id,
    })

    const childTileIds: string[] = []

    for (const tile of folder.tiles) {
      const tileId = `tile-${folder.id}-${tile.symbol}`
      childTileIds.push(tileId)

      allTiles.push({
        id: tileId,
        boardId: folder.id,
        label: tile.label,
        symbolPath: `symbols/${tile.symbol}.svg`,
        audioClipId: null,
        backgroundColor: tile.color,
        type: "symbol",
      })
    }

    allBoards.push({
      id: folder.id,
      parentId: ROOT_BOARD_ID,
      name: folder.name,
      gridColumns: 4,
      gridRows: 3,
      tileIds: childTileIds,
    })
  }

  allBoards.unshift({
    id: ROOT_BOARD_ID,
    parentId: null,
    name: "Početna",
    gridColumns: 3,
    gridRows: 2,
    tileIds: rootFolderTileIds,
  })

  await db.transaction("rw", db.boards, db.tiles, async () => {
    await db.boards.bulkAdd(allBoards)
    await db.tiles.bulkAdd(allTiles)
  })
}
