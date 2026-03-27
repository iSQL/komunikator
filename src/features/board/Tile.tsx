import { useCallback } from "react"
import type { Tile as TileData } from "../../data"
import { useLongPress } from "../../shared/hooks/useLongPress"

interface TileProps {
  tile: TileData
  onTap: (tile: TileData) => void
  onLongPress?: (tile: TileData) => void
}

const Tile = ({ tile, onTap, onLongPress }: TileProps) => {
  const handleTap = useCallback(() => onTap(tile), [onTap, tile])
  const handleLongPress = useCallback(() => onLongPress?.(tile), [onLongPress, tile])
  const pressHandlers = useLongPress(handleLongPress, handleTap)

  const isDataUrl = tile.symbolPath.startsWith("data:")

  return (
    <button
      className="flex flex-col items-center gap-1 rounded-xl p-2 shadow-md active:scale-95 transition-transform w-full aspect-square cursor-pointer border-2 border-white/30 select-none"
      style={{ backgroundColor: tile.backgroundColor }}
      aria-label={tile.label}
      {...pressHandlers}
    >
      <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
        {isDataUrl ? (
          <img src={tile.symbolPath} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
        ) : (
          <div className="w-full h-full bg-white/40 rounded-lg flex items-center justify-center text-4xl">
            {tile.type === "folder" ? "📁" : "🖼"}
          </div>
        )}
      </div>
      <span className="text-xs font-semibold text-white drop-shadow-sm text-center leading-tight shrink-0">
        {tile.label}
      </span>
    </button>
  )
}

export default Tile
