import { toast } from "sonner";

import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TcgOption } from "@/types/Enums";
import { useCreateStorePlayer } from "@/hooks/credits.hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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
  const { register, control, handleSubmit, reset, formState: { errors }, } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
          name: "",
          tcg: "",
          tcgId: "",
      },
    });

  const { mutate, isPending } = useCreateStorePlayer();

  const onSubmit = (data: FormData) => {
      mutate(
        {
          apelido: data.name,
          game_id: { tcg: data.tcg, id: data.tcgId },
        },
        {
          onSuccess: () => {
            toast.success("Jogador vinculado com sucesso");
            reset();
          },
        },
      );
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
                                ? "border-destructive focus:ring-destructive"
                                : "border-border focus:ring-primary"
                        }`}
                    />
                    {errors.name && (
                        <p className="text-sm text-destructive mt-1">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* TCG */}
                <div>
                    <Controller
                        name="tcg"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger
                                    className={`w-full ${errors.tcg ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                >
                                    <SelectValue placeholder="Selecione um TCG" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tcgs.map((tcg) => (
                                        <SelectItem key={tcg.value} value={tcg.value}>
                                            {tcg.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.tcg && (
                        <p className="text-sm text-destructive mt-1">
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
                                ? "border-destructive focus:ring-destructive"
                                : "border-border focus:ring-primary"
                        }`}
                    />
                    {errors.tcgId && (
                        <p className="text-sm text-destructive mt-1">
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
                        ? "bg-primary cursor-not-allowed"
                        : "bg-primary hover:bg-primary/90 text-white"
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
