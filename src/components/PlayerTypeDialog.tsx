import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog.tsx";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export interface PlayerTypeFormData {
  nome: string;
  pt_vitoria: number;
  pt_derrota: number;
  pt_empate: number;
  pt_oponente_ganha: number;
  pt_oponente_perde: number;
  pt_oponente_empate: number;
  tcg: string;
}

export interface PlayerRule {
  id: number;
  typeName: string;
  pointsForWin: number;
  pointsForLoss: number;
  pointsForDraw: number;
  pointsGivenToOpponent: number;
  pointsLostByOpponent: number;
  pointsGivenToOpponentOnDraw: number;
  tcg: string;
}

const API_URL = process.env.REACT_APP_BACKEND_API_URL;

const defaultData: PlayerTypeFormData = {
  nome: "",
  pt_vitoria: 0,
  pt_derrota: 0,
  pt_empate: 0,
  pt_oponente_ganha: 0,
  pt_oponente_perde: 0,
  pt_oponente_empate: 0,
  tcg: "",
};

interface PlayerTypeDialogProps {
  editingRule?: boolean;
  initialData?: PlayerRule;
  currentUser: any;
  isFormOpen?: boolean;
  setIsFormOpen?: (open: boolean) => void;
  onSuccess?: () => void;
}

function mapRuleToFormData(rule: PlayerRule): PlayerTypeFormData {
  return {
    nome: rule.typeName,
    pt_vitoria: rule.pointsForWin,
    pt_derrota: rule.pointsForLoss,
    pt_empate: rule.pointsForDraw,
    pt_oponente_ganha: rule.pointsGivenToOpponent,
    pt_oponente_perde: rule.pointsLostByOpponent,
    pt_oponente_empate: rule.pointsGivenToOpponentOnDraw,
    tcg: rule.tcg,
  };
}

export function PlayerTypeDialog({
  editingRule = false,
  initialData,
  currentUser,
  isFormOpen,
  setIsFormOpen,
  onSuccess
}: PlayerTypeDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState<PlayerTypeFormData>(
    initialData ? mapRuleToFormData(initialData) : defaultData
  );

  const open = isFormOpen ?? internalOpen;
  const setOpen = setIsFormOpen ?? setInternalOpen;

  const resetForm = () => setFormData(initialData ? mapRuleToFormData(initialData) : defaultData);

useEffect(() => {
  if (initialData) {
    setFormData(mapRuleToFormData(initialData));
  } else {
    setFormData(defaultData);
  }
}, [initialData, isFormOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Você deve estar logado para gerenciar as regras de jogadores");
      return;
    }

    if (!formData.nome.trim()) {
      toast.error("O nome do tipo é obrigatório");
      return;
    }

    if (!formData.tcg.trim()) {
      toast.error("O TCG é obrigatório");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Token de acesso não encontrado. Faça o login novamente.");
      return;
    }

    try {
      if (editingRule && initialData) {
        // Atualização (PUT)
        const response = await fetch(`${API_URL}/lojas/tipoJogador/${initialData.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success("Regra do jogador atualizada com sucesso");
          setOpen(false);
          resetForm();
        } else {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || "Falha ao atualizar a regra do jogador"
          );
        }
      } else {
        // Criação (POST)
        const response = await fetch(`${API_URL}/lojas/tipoJogador/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success("Regra do jogador criada com sucesso");
          if (onSuccess) await onSuccess();
          setOpen(false);
          resetForm();

        } else {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || "Falha ao criar a regra do jogador"
          );
        }
      }
    } catch (error) {
      console.error("Erro ao salvar a regra:", error);
      toast.error((error as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingRule
              ? "Editar Tipo de Jogador"
              : "Adicionar Novo Tipo de Jogador"}
          </DialogTitle>
          <DialogDescription>
            Crie regras de pontuação personalizadas para diferentes tipos de
            jogadores em seus torneios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="nome">Nome do Tipo</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="e.g., Equipe Rocket"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pt_vitoria">Pontos por Vitória</Label>
              <Input
                id="pt_vitoria"
                type="number"
                min="0"
                step="0.1"
                value={formData.pt_vitoria}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pt_vitoria: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="pt_derrota">Pontos por Derrota</Label>
              <Input
                id="pt_derrota"
                type="number"
                min="0"
                step="0.1"
                value={formData.pt_derrota}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pt_derrota: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="pt_empate">Pontos por Empate</Label>
              <Input
                id="pt_empate"
                type="number"
                min="0"
                step="0.1"
                value={formData.pt_empate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pt_empate: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="pt_oponente_ganha">Pts. Oponente (Vitória)</Label>
              <Input
                id="pt_oponente_ganha"
                type="number"
                min="0"
                step="0.1"
                value={formData.pt_oponente_ganha}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pt_oponente_ganha: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="pt_oponente_perde">Pts. Oponente (Derrota)</Label>
              <Input
                id="pt_oponente_perde"
                type="number"
                min="0"
                step="0.1"
                value={formData.pt_oponente_perde}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pt_oponente_perde: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="pt_oponente_empate">Pts. Oponente (Empate)</Label>
              <Input
                id="pt_oponente_empate"
                type="number"
                min="0"
                step="0.1"
                value={formData.pt_oponente_empate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pt_oponente_empate: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tcg">TCG</Label>
            <Input
              id="tcg"
              value={formData.tcg}
              onChange={(e) =>
                setFormData({ ...formData, tcg: e.target.value })
              }
              placeholder="e.g., Magic: The Gathering"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">{editingRule ? "Atualizar" : "Salvar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PlayerTypeDialog;
