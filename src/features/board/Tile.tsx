import type { Tile as TileData } from "../../data"

interface TileProps {
  tile: TileData
  onTap: (tile: TileData) => void
}

const Tile = ({ tile, onTap }: TileProps) => {
  return (
    <button
      className="flex flex-col items-center justify-center gap-1 rounded-xl p-2 shadow-md active:scale-95 transition-transform min-h-[80px] cursor-pointer border-2 border-white/30"
      style={{ backgroundColor: tile.backgroundColor }}
      onClick={() => onTap(tile)}
      aria-label={tile.label}
    >
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="w-12 h-12 bg-white/40 rounded-lg flex items-center justify-center text-2xl">
          {tile.type === "folder" ? "📁" : "🖼"}
        </div>
      </div>
      <span className="text-sm font-semibold text-white drop-shadow-sm text-center leading-tight">
        {tile.label}
      </span>
    </button>
  )
}

export default Tile
