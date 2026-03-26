import { useCallback, useRef } from "react"

const LONG_PRESS_MS = 500

export const useLongPress = (onLongPress: () => void, onTap: () => void) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firedRef = useRef(false)

  const start = useCallback(() => {
    firedRef.current = false
    timerRef.current = setTimeout(() => {
      firedRef.current = true
      onLongPress()
    }, LONG_PRESS_MS)
  }, [onLongPress])

  const end = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (!firedRef.current) {
      onTap()
    }
  }, [onTap])

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return {
    onPointerDown: start,
    onPointerUp: end,
    onPointerLeave: cancel,
    onContextMenu: (e: React.PointerEvent | React.MouseEvent) => e.preventDefault(),
  }
}
