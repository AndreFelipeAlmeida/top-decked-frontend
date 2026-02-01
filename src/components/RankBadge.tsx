import { Crown, Medal, Award, Star } from 'lucide-react';

interface RankBadgeProps {
  rank: number;
}

export const RankBadge = ({ rank }: RankBadgeProps) => {
  const baseStyle = "flex items-center justify-center w-6 h-6 rounded-full shadow-sm text-white";

  if (rank === 1) {
    return (
      <div className={`${baseStyle} bg-gradient-to-br from-yellow-400 to-yellow-600`}>
        <Crown className="w-3.5 h-3.5" />
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className={`${baseStyle} bg-gradient-to-br from-gray-300 to-gray-400`}>
        <Medal className="w-3.5 h-3.5" />
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className={`${baseStyle} bg-gradient-to-br from-amber-600 to-amber-800`}>
        <Award className="w-3.5 h-3.5" />
      </div>
    );
  }

  if (rank <= 8) {
    return (
      <div className={`${baseStyle} bg-gradient-to-br from-purple-400 to-purple-600`}>
        <Star className="w-3 h-3" />
      </div>
    );
  }

  return null;
};