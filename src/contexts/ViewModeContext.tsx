import { createContext } from "react"

export type ViewMode = "jogador" | "organizador"

export type ViewModeContextType = {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
}

export const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined)
