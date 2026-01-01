// src/components/Toolbar/ViewModeToggle.tsx
import type { FC } from 'react';
import { Grid3x3, Columns, Layout } from 'lucide-react';

interface ViewModeToggleProps {
  scrollMode: 'vertical' | 'horizontal' | 'horizontal-single';
  onToggle: () => void;
  darkMode?: boolean;
}

const ViewModeToggle: FC<ViewModeToggleProps> = ({
  scrollMode,
  onToggle,
  darkMode = false,
}) => {
  const getIcon = () => {
    switch (scrollMode) {
      case 'vertical': return <Grid3x3 size={20} />;
      case 'horizontal': return <Columns size={20} />;
      case 'horizontal-single': return <Layout size={20} />;
      default: return <Grid3x3 size={20} />;
    }
  };

  const getText = () => {
    switch (scrollMode) {
      case 'vertical': return 'Vertical';
      case 'horizontal': return 'Horizontal';
      case 'horizontal-single': return 'Single';
      default: return 'Vertical';
    }
  };

  const getTooltip = () => {
    switch (scrollMode) {
      case 'vertical': return 'Switch to horizontal view';
      case 'horizontal': return 'Switch to single page view';
      case 'horizontal-single': return 'Switch to vertical view';
      default: return 'Switch view mode';
    }
  };

  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg flex items-center gap-2 transition-colors ${
        darkMode 
          ? 'hover:bg-gray-800 text-gray-200' 
          : 'hover:bg-gray-100 text-gray-700'
      }`}
      title={getTooltip()}
    >
      {getIcon()}
      <span className="text-sm">{getText()}</span>
    </button>
  );
};

export default ViewModeToggle;