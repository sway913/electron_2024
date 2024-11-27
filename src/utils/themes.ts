import { lightTheme, darkTheme } from '@/constants/themes';

export const getTheme = (name: string) => {
  if (name === 'light') return lightTheme;
  else if (name === 'dark') return darkTheme;
  return lightTheme;
};
