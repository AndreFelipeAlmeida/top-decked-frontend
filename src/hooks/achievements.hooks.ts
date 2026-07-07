import { achievementsKeys } from "@/keys/achievements.keys";
import {
  getMyAchievementHistory,
  getMyAchievements,
  recalculateAchievements,
} from "@/services/achievement.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useMyAchievements = () => {
  return useQuery({
    queryKey: achievementsKeys.all,
    queryFn: getMyAchievements,
  });
};

export const useAchievementHistory = () => {
  return useQuery({
    queryKey: achievementsKeys.history(),
    queryFn: getMyAchievementHistory,
  });
};

export const useRecalculateAchievements = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recalculateAchievements,
    onSuccess: (subiramDeNivel) => {
      queryClient.invalidateQueries({ queryKey: achievementsKeys.all });

      if (subiramDeNivel.length === 0) {
        toast.success("Conquistas atualizadas — nenhuma novidade por enquanto.");
        return;
      }

      for (const jc of subiramDeNivel) {
        const nivel = jc.conquista.niveis.find((n) => n.nivel === jc.nivel_atual);
        toast.success(`🏆 ${jc.conquista.nome} chegou ao nível ${nivel?.nome_nivel ?? jc.nivel_atual}!`);
      }
    },
  });
};
