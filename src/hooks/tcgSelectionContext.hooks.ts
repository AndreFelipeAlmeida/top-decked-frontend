import { useContext } from "react"
import { TcgSelectionContext } from "@/contexts/TcgSelectionContext"

export const useTcgSelection = () => {
  const context = useContext(TcgSelectionContext)

  if (context === undefined) {
    throw new Error("useTcgSelection deve ser usado dentro de um TcgSelectionProvider")
  }

  return context
}
