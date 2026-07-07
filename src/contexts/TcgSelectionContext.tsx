import { createContext } from "react"

export type TcgSelectionContextType = {
  selectedTcg: string
  setSelectedTcg: (tcg: string) => void
}

export const TcgSelectionContext = createContext<TcgSelectionContextType | undefined>(undefined)
