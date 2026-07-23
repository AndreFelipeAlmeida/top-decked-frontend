import { useState } from "react"
import { TcgSelectionContext } from "./TcgSelectionContext"

type TcgSelectionProviderProps = {
  children: React.ReactNode
}

// Mantém qual TCG está selecionado na barra lateral (AppLayout) acessível para
// as páginas roteadas, já que elas não recebem props diretamente do layout.
export const TcgSelectionProvider = ({ children }: TcgSelectionProviderProps) => {
  const [selectedTcg, setSelectedTcg] = useState("POKEMON")
  const [mostrarTodosOsJogos, setMostrarTodosOsJogos] = useState(true)

  return (
    <TcgSelectionContext.Provider
      value={{ selectedTcg, setSelectedTcg, mostrarTodosOsJogos, setMostrarTodosOsJogos }}
    >
      {children}
    </TcgSelectionContext.Provider>
  )
}
