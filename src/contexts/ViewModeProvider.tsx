import { useState } from "react"
import { ViewModeContext, type ViewMode } from "./ViewModeContext"

type ViewModeProviderProps = {
  children: React.ReactNode
}

// Modo de visão de um jogador que também organiza torneios para alguma loja:
// alterna entre a experiência normal de jogador e a de organizador (ex.: botão
// "Criar Torneio" no dashboard). Não se aplica a usuários do tipo "loja".
export const ViewModeProvider = ({ children }: ViewModeProviderProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("jogador")

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  )
}
