import { createContext } from "react"

export type TcgSelectionContextType = {
  selectedTcg: string
  setSelectedTcg: (tcg: string) => void
  mostrarTodosOsJogos: boolean
  setMostrarTodosOsJogos: (valor: boolean) => void
}

export const TcgSelectionContext = createContext<TcgSelectionContextType | undefined>(undefined)
