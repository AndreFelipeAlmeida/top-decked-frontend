import { criarJogadorLoja } from "@/services/lojasService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TcgOption } from "@/types/Enums";


type Props = {
    tcgs: TcgOption[]
}

const schema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    tcg: z.string().min(1, "Selecione um TCG"),
    tcgId: z.string().min(1, "TCG ID é obrigatório"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPlayerForm({ tcgs }: Props) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors }, } = 
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
          name: "",
          tcg: "",
          tcgId: "",
      },
    });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
        criarJogadorLoja({
            apelido: data.name,
            game_id: {
                tcg: data.tcg,
                id: data.tcgId,
            },
        }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["players"] });
        toast.success("Jogador criado com sucesso");
        reset();
    },
  });

  const onSubmit = (data: FormData) => {
      mutate(data);
  };

  return (

        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* NAME */}
                <div>
                    <input
                        type="text"
                        placeholder="Player Name"
                        {...register("name")}
                        className={`px-3 py-2 border rounded w-full focus:outline-none focus:ring-2 ${
                            errors.name
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-purple-600"
                        }`}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-500 mt-1">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* TCG */}
                <div>
                    <select
                        {...register("tcg")}
                        className={`px-3 py-2 border rounded w-full focus:outline-none focus:ring-2 ${
                            errors.tcg
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-purple-600"
                        }`}
                    >
                        {tcgs.map((tcg) => (
                          <option key={tcg.value} value={tcg.value}>
                              {tcg.label}
                          </option>
                        ))}
                    </select>
                    {errors.tcg && (
                        <p className="text-sm text-red-500 mt-1">
                            {errors.tcg.message}
                        </p>
                    )}
                </div>

                {/* TCG ID */}
                <div>
                    <input
                        type="text"
                        placeholder="TCG ID (e.g., MTG123456)"
                        {...register("tcgId")}
                        className={`px-3 py-2 border rounded w-full focus:outline-none focus:ring-2 ${
                            errors.tcgId
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-purple-600"
                        }`}
                    />
                    {errors.tcgId && (
                        <p className="text-sm text-red-500 mt-1">
                            {errors.tcgId.message}
                        </p>
                    )}
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className={`mt-4 w-full py-2 rounded flex items-center justify-center gap-2 transition-colors ${
                    isPending
                        ? "bg-purple-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
            >
                {isPending && (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}

                {isPending ? "Registrando..." : "Registrar jogador"}
            </button>
        </form>
  );
}
