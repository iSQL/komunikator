import { create } from "zustand"
import { db } from "../../data"
import type { Board, Tile } from "../../data"

interface BoardState {
  currentBoard: Board | null
  tiles: Tile[]
  navigationStack: string[]
  loadBoard: (boardId: string) => Promise<void>
  navigateToFolder: (boardId: string) => Promise<void>
  navigateBack: () => Promise<void>
  navigateHome: () => Promise<void>
  addTile: (boardId: string) => Promise<Tile>
  deleteTile: (tileId: string, boardId: string) => Promise<void>
  reorderTiles: (boardId: string, tileIds: string[]) => Promise<void>
}

const ROOT_BOARD_ID = "board-root"

let tileCounter = Date.now()

export const useBoardStore = create<BoardState>((set, get) => ({
  currentBoard: null,
  tiles: [],
  navigationStack: [],

  loadBoard: async (boardId: string) => {
    const board = await db.boards.get(boardId)
    if (!board) return
    const tiles = await db.tiles.where("boardId").equals(boardId).toArray()
    const ordered = board.tileIds
      .map((id) => tiles.find((t) => t.id === id))
      .filter((t): t is Tile => t !== undefined)
    set({ currentBoard: board, tiles: ordered })
  },

  navigateToFolder: async (boardId: string) => {
    const { currentBoard, loadBoard } = get()
    if (currentBoard) {
      set((s) => ({ navigationStack: [...s.navigationStack, currentBoard.id] }))
    }
    await loadBoard(boardId)
  },

  navigateBack: async () => {
    const { navigationStack, loadBoard } = get()
    if (navigationStack.length === 0) return
    const previous = navigationStack[navigationStack.length - 1]
    set({ navigationStack: navigationStack.slice(0, -1) })
    await loadBoard(previous)
  },

  navigateHome: async () => {
    set({ navigationStack: [] })
    await get().loadBoard(ROOT_BOARD_ID)
  },

  addTile: async (boardId: string) => {
    const board = await db.boards.get(boardId)
    if (!board) throw new Error(`Board ${boardId} not found`)
    const tileId = `tile-${++tileCounter}`
    const tile: Tile = {
      id: tileId,
      boardId,
      label: "Nova",
      symbolPath: "",
      audioClipId: null,
      backgroundColor: "#9CA3AF",
      type: "symbol",
    }
    await db.transaction("rw", db.tiles, db.boards, async () => {
      await db.tiles.add(tile)
      await db.boards.update(boardId, { tileIds: [...board.tileIds, tileId] })
    })
    await get().loadBoard(boardId)
    return tile
  },

  deleteTile: async (tileId: string, boardId: string) => {
    const board = await db.boards.get(boardId)
    if (!board) return
    await db.transaction("rw", db.tiles, db.boards, db.audioClips, async () => {
      const tile = await db.tiles.get(tileId)
      if (tile?.audioClipId) {
        await db.audioClips.delete(tile.audioClipId)
      }
      await db.tiles.delete(tileId)
      await db.boards.update(boardId, {
        tileIds: board.tileIds.filter((id) => id !== tileId),
      })
    })
    await get().loadBoard(boardId)
  },

  reorderTiles: async (boardId: string, tileIds: string[]) => {
    await db.boards.update(boardId, { tileIds })
    await get().loadBoard(boardId)
  },
}))
