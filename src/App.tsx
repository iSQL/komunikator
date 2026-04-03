import { useEffect, useState } from "react"
import { seedDatabase } from "./data"
import { BoardView } from "./features/board"
import { SentenceBar } from "./features/sentence"

const App = () => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    navigator.storage?.persist()
    seedDatabase().then(() => setReady(true))
  }, [])

  if (!ready) return null

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <SentenceBar />
      <BoardView />
    </div>
  )
}

export default App
