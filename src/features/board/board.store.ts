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
}

const ROOT_BOARD_ID = "board-root"

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
}))
