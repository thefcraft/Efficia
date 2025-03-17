
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccentColor = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'yellow' | 'pink' | 'indigo';

type ThemeStore = {
  theme: 'light' | 'dark' | 'system';
  systemTheme: 'light' | 'dark';
  accentColor: AccentColor;
  fontSize: number;
  sidebarCollapsed: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (color: AccentColor) => void;
  setFontSize: (size: number) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  applyTheme: () => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      systemTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      accentColor: 'blue',
      fontSize: 16,
      sidebarCollapsed: false,
      setTheme: (theme) => {
        set({ theme });
        // Apply theme immediately after state update
        setTimeout(() => get().applyTheme(), 0);
      },
      setAccentColor: (color) => {
        set({ accentColor: color });
        // Apply accent color immediately after state update
        setTimeout(() => get().applyTheme(), 0);
      },
      setFontSize: (size) => {
        set({ fontSize: size });
        // Apply font size immediately
        document.documentElement.style.fontSize = `${size}px`;
      },
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      applyTheme: () => {
        const { theme, accentColor } = get();
        
        // Apply theme
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', systemTheme === 'dark');
        } else {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
        
        // Apply accent color
        const hues: Record<string, string> = {
          blue: '221 83%',
          green: '142 71%',
          purple: '262 83%',
          red: '0 72%',
          orange: '24 90%',
          yellow: '48 96%',
          pink: '326 78%',
          indigo: '262 83%',
        };
        
        const hue = hues[accentColor] || '221 83%';
        document.documentElement.style.setProperty('--primary', `${hue} 53%`);
        document.documentElement.style.setProperty('--accent', `${hue} 96%`);
        document.documentElement.style.setProperty('--ring', `${hue} 53%`);

        document.documentElement.style.setProperty('--accent-foreground', `${hue} 53%`); 
        // For light mode, update accent-foreground
        // if (theme !== 'dark' && (theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches))) {
        //   document.documentElement.style.setProperty('--accent-foreground', `${hue} 53%`);
        // }else{
        //   document.documentElement.style.setProperty('--accent-foreground', `${hue} 53%`); 
        // }
      }
    }),
    {
      name: 'theme-storage',
    }
  )
);
