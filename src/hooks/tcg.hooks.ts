import { tcgKeys } from "@/keys/tcg.keys";
import { getTcgs } from "@/services/tcg.service";
import { useQuery } from "@tanstack/react-query";

export const useTcgs = () => {
  return useQuery({
    queryKey: tcgKeys.all,
    queryFn: getTcgs,
    staleTime: Infinity,
  });
};
