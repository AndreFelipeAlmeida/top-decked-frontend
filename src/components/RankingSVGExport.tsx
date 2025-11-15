import React, { forwardRef } from "react";

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

interface Props {
  tournamentResults: TournamentResult[];
}

const RankingSVGExport = forwardRef<SVGSVGElement, Props>(
  ({ tournamentResults }, ref) => {
    const W = 725;
    const H = 50 + tournamentResults.length * 42 + 40;
    const rowHeight = 42;

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={W}
        height={H}
        style={{ background: "#FAD3EA" }}
      >
        {/* Table headers background */}
        <rect
          x={0}
          y={0}
          width={W}
          height={50}
          fill="#ED50AB"
          opacity="0.9"
        />

        {/* Headers */}
        <g
          fontFamily="Montserrat"
          fontSize="20"
          fontWeight="600"
          fill="#FFFFFF"
        >
          <text x={30} y={33}>#</text>
          <text x={110} y={33}>Nome</text>
          <text x={370} y={33}>Desempenho</text>
          <text x={570} y={33}>Pontos</text>
        </g>

        {/* Dashed separators */}
        <line x1={0} y1={0}   x2={W} y2={0}   stroke="#ED50AB" strokeWidth="3" />
        <line x1={0} y1={50}  x2={W} y2={50}  stroke="#ED50AB" strokeWidth="3" />

        {tournamentResults.map((r, i) => {
          const y = 50 + i * rowHeight;

          return (
            <g key={r.id}>
              {/* Row dashed line */}
              <line
                x1={0}
                y1={y + rowHeight}
                x2={W}
                y2={y + rowHeight}
                stroke="#ED50AB"
                strokeWidth="3"
                strokeDasharray="8 8"
              />

              {/* Text */}
              <text
                x={30}
                y={y + 28}
                fontFamily="Montserrat"
                fontSize="18"
                fill="#ED50AB"
                fontWeight="600"
              >
                {r.currentStanding}
              </text>

              <text
                x={110}
                y={y + 28}
                fontFamily="Montserrat"
                fontSize="18"
                fill="#ED50AB"
              >
                {r.userName}
              </text>

              <text
                x={370}
                y={y + 28}
                fontFamily="Montserrat"
                fontSize="18"
                fill="#ED50AB"
              >
                {r.wins}/{r.losses}/{r.draws}
              </text>

              <text
                x={570}
                y={y + 28}
                fontFamily="Montserrat"
                fontSize="18"
                fill="#ED50AB"
                fontWeight="600"
              >
                {r.points}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }
);

export default RankingSVGExport;