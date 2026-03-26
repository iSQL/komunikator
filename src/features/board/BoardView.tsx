import { useEffect } from "react"
import { useBoardStore } from "./board.store"
import { useSentenceStore } from "../sentence/sentence.store"
import Tile from "./Tile"
import type { Tile as TileData } from "../../data"

const ROOT_BOARD_ID = "board-root"

const BoardView = () => {
  const { currentBoard, tiles, loadBoard, navigateToFolder, navigateBack, navigateHome, navigationStack } =
    useBoardStore()
  const append = useSentenceStore((s) => s.append)

  useEffect(() => {
    loadBoard(ROOT_BOARD_ID)
  }, [loadBoard])

  const handleTileTap = (tile: TileData) => {
    if (tile.type === "folder" && tile.targetBoardId) {
      navigateToFolder(tile.targetBoardId)
    } else {
      append(tile)
    }
  }

  if (!currentBoard) return null

  const isRoot = navigationStack.length === 0

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {!isRoot && (
        <div className="flex gap-2 p-2 bg-gray-100">
          <button
            className="px-3 py-2 bg-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-400 transition-colors cursor-pointer"
            onClick={navigateBack}
            aria-label="Nazad"
          >
            ← Nazad
          </button>
          <button
            className="px-3 py-2 bg-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-400 transition-colors cursor-pointer"
            onClick={navigateHome}
            aria-label="Početna"
          >
            ⌂ Početna
          </button>
          <span className="flex items-center text-sm font-medium text-gray-600 ml-2">
            {currentBoard.name}
          </span>
        </div>
      )}
      <div
        className="grid flex-1 gap-3 p-3"
        style={{
          gridTemplateColumns: `repeat(${currentBoard.gridColumns}, 1fr)`,
          gridTemplateRows: `repeat(${currentBoard.gridRows}, 1fr)`,
        }}
      >
        {tiles.map((tile) => (
          <Tile key={tile.id} tile={tile} onTap={handleTileTap} />
        ))}
      </div>
    </div>
  )
}

export default BoardView
