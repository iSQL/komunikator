export interface Board {
  id: string
  parentId: string | null
  name: string
  gridColumns: number
  gridRows: number
  tileIds: string[]
}

export interface Tile {
  id: string
  boardId: string
  label: string
  symbolPath: string
  audioClipId: string | null
  backgroundColor: string
  type: "symbol" | "folder"
  targetBoardId?: string
}

export interface AudioClip {
  id: string
  tileId: string
  blob: Blob
  mimeType: string
  durationMs: number
}

export interface AppSettings {
  locale: string
  lockEditing: boolean
  highContrast: boolean
  scanningEnabled: boolean
  sentencePauseMs: number
}
