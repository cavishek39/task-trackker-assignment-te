import { useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { colors } from '../theme/colors';

export const useTheme = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = isDarkMode ? colors.dark : colors.light;
  
  return {
    isDarkMode,
    colors: themeColors,
  };
};
