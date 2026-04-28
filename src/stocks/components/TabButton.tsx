import { Package } from "lucide-react";

export default function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 whitespace-nowrap border ${
        isActive
          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
          : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
      }`}
    >
      <Package
        className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`}
      />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}
