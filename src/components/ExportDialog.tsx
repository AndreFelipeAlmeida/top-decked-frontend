import { useRef } from "react";
import RankingSVGExport from "./RankingSVGExport.tsx";
import { exportSvgToPng } from "../utils/exportSvgToPng.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog.tsx';
import { Button } from './ui/button.tsx';
import RankingPreview from './RankingPreview.tsx';


interface TournamentResult {
  id: string;
  userId: string;
  userName: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  currentStanding: number;
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentResults: TournamentResult[];
}

export default function ExportDialog({
  open,
  onOpenChange,
  tournamentResults,
}: ExportDialogProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleExport = () => {
    console.log(svgRef.current)
    if (svgRef.current) {
      exportSvgToPng(svgRef.current, "ranking");
    }
  };

  return (
   <>
      {/* Render invisível só para exportação */}
      <div style={{ position: "absolute", left: "-9999px" }}>
        <RankingSVGExport
          ref={svgRef}
          tournamentResults={tournamentResults}
        />
      </div>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pré-visualização para Exportação</DialogTitle>
          </DialogHeader>

          <div className="p-4">
            <RankingPreview tournamentResults={tournamentResults} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>

            <Button
              onClick={handleExport}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Exportar como Imagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}