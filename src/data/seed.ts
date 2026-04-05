import { db } from "./db"
import type { Board, Tile } from "./types"

const ROOT_BOARD_ID = "board-root"

const fetchArasaacAsDataUrl = async (id: number): Promise<string> => {
  const url = `https://static.arasaac.org/pictograms/${id}/${id}_2500.png`
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export const seedDatabase = async () => {
  const boardCount = await db.boards.count()
  if (boardCount > 0) return

  const ja = await fetchArasaacAsDataUrl(31807)
  const hocu = await fetchArasaacAsDataUrl(5441)
  const jabukuSymbol = await fetchArasaacAsDataUrl(2462)
  const vodu = await fetchArasaacAsDataUrl(6889)

  const tiles: Tile[] = [
    {
      id: "tile-ja",
      boardId: ROOT_BOARD_ID,
      label: "Ja",
      symbolPath: ja,
      audioClipId: null,
      backgroundColor: "#93C5FD",
      type: "symbol",
    },
    {
      id: "tile-hocu",
      boardId: ROOT_BOARD_ID,
      label: "Hoću",
      symbolPath: hocu,
      audioClipId: null,
      backgroundColor: "#6EE7B7",
      type: "symbol",
    },
    {
      id: "tile-vodu",
      boardId: ROOT_BOARD_ID,
      label: "vodu",
      symbolPath: vodu,
      audioClipId: null,
      backgroundColor: "#FDE68A",
      type: "symbol",
    },
    {
      id: "tile-jabuku",
      boardId: ROOT_BOARD_ID,
      label: "jabuku",
      symbolPath: jabukuSymbol,
      audioClipId: null,
      backgroundColor: "#FDE68A",
      type: "symbol",
    },
  ]

  const rootBoard: Board = {
    id: ROOT_BOARD_ID,
    parentId: null,
    name: "Početna",
    gridColumns: 4,
    gridRows: 1,
    tileIds: ["tile-ja", "tile-hocu", "tile-vodu", "tile-jabuku"],
  }

  await db.transaction("rw", db.boards, db.tiles, async () => {
    await db.boards.bulkAdd([rootBoard])
    await db.tiles.bulkAdd(tiles)
  })
}
