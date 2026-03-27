import { useEffect, useState } from "react"
import { useBoardStore } from "./board.store"
import { useSentenceStore } from "../sentence/sentence.store"
import { useSettingsStore } from "../settings"
import { useSpeak } from "../speech"
import { TileEditor } from "../editor"
import Tile from "./Tile"
import type { Tile as TileData } from "../../data"

const ROOT_BOARD_ID = "board-root"

const BoardView = () => {
  const { currentBoard, tiles, loadBoard, navigateToFolder, navigateBack, navigateHome, navigationStack, addTile } =
    useBoardStore()
  const append = useSentenceStore((s) => s.append)
  const { speakTile } = useSpeak()
  const { lockEditing, toggleLock } = useSettingsStore()
  const [editingTile, setEditingTile] = useState<TileData | null>(null)

  useEffect(() => {
    loadBoard(ROOT_BOARD_ID)
  }, [loadBoard])

  const handleTileTap = (tile: TileData) => {
    if (tile.type === "folder" && tile.targetBoardId) {
      navigateToFolder(tile.targetBoardId)
    } else {
      append(tile)
      speakTile(tile)
    }
  }

  const handleLongPress = (tile: TileData) => {
    if (!lockEditing) {
      setEditingTile(tile)
    }
  }

  if (!currentBoard) return null

  const isRoot = navigationStack.length === 0

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex gap-2 p-2 bg-gray-100 items-center">
        {!isRoot && (
          <>
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
            <span className="flex items-center text-sm font-medium text-gray-600">
              {currentBoard.name}
            </span>
          </>
        )}
        {isRoot && (
          <span className="text-sm font-medium text-gray-600">
            {currentBoard.name}
          </span>
        )}
        <div className="ml-auto flex gap-2">
          {!lockEditing && (
            <button
              className="px-3 py-2 bg-green-500 text-white rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors cursor-pointer"
              onClick={() => addTile(currentBoard.id)}
              aria-label="Dodaj pločicu"
            >
              + Dodaj
            </button>
          )}
          <button
            className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
              lockEditing
                ? "bg-gray-300 hover:bg-gray-400"
                : "bg-yellow-400 hover:bg-yellow-500"
            }`}
            onClick={toggleLock}
            aria-label={lockEditing ? "Otključaj uređivanje" : "Zaključaj uređivanje"}
          >
            {lockEditing ? "🔒" : "🔓"}
          </button>
        </div>
      </div>
      <div
        className="flex-1 min-h-0 overflow-y-auto grid gap-3 p-3 content-start"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
      >
        {tiles.map((tile) => (
          <Tile
            key={tile.id}
            tile={tile}
            onTap={handleTileTap}
            onLongPress={handleLongPress}
          />
        ))}
      </div>
      {editingTile && (
        <TileEditor tile={editingTile} onClose={() => setEditingTile(null)} />
      )}
    </div>
  )
}

export default BoardView
