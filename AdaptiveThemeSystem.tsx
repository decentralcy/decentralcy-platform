import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AdaptiveThemeSystemProps {
  children: React.ReactNode;
}

export default function AdaptiveThemeSystem({ children }: AdaptiveThemeSystemProps) {
  const [currentTheme, setCurrentTheme] = useState<string>('light');
  const { toast } = useToast();

  // Web3-inspired theme configurations
  const themes = {
    light: {
      '--background': '0 0% 100%',
      '--foreground': '222.2 84% 4.9%',
      '--primary': '221.2 83.2% 53.3%',
      '--primary-foreground': '210 40% 98%',
      '--secondary': '210 40% 96%',
      '--accent': '210 40% 96%',
      '--muted': '210 40% 96%',
      '--border': '214.3 31.8% 91.4%',
    },
    dark: {
      '--background': '222.2 84% 4.9%',
      '--foreground': '210 40% 98%',
      '--primary': '217.2 91.2% 59.8%',
      '--primary-foreground': '222.2 84% 4.9%',
      '--secondary': '217.2 32.6% 17.5%',
      '--accent': '217.2 32.6% 17.5%',
      '--muted': '217.2 32.6% 17.5%',
      '--border': '217.2 32.6% 17.5%',
    },
    'web3-neon': {
      '--background': '240 10% 3.9%',
      '--foreground': '120 100% 50%',
      '--primary': '120 100% 50%',
      '--primary-foreground': '240 10% 3.9%',
      '--secondary': '180 100% 50%',
      '--accent': '300 100% 50%',
      '--muted': '240 5% 10%',
      '--border': '120 100% 25%',
    },
    'web3-gradient': {
      '--background': '224 71% 4%',
      '--foreground': '213 31% 91%',
      '--primary': '262 83% 58%',
      '--primary-foreground': '210 40% 98%',
      '--secondary': '262 83% 20%',
      '--accent': '262 83% 20%',
      '--muted': '215 28% 17%',
      '--border': '262 83% 20%',
    }
  };

  // Apply theme to CSS custom properties
  const applyTheme = (themeName: string) => {
    const theme = themes[themeName as keyof typeof themes];
    if (theme) {
      const root = document.documentElement;
      Object.entries(theme).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
      setCurrentTheme(themeName);
      
      // Add special classes for Web3 themes
      if (themeName.startsWith('web3')) {
        document.body.classList.add('web3-theme');
        if (themeName === 'web3-neon') {
          document.body.classList.add('neon-glow');
        }
      } else {
        document.body.classList.remove('web3-theme', 'neon-glow');
      }

      // Microinteraction feedback
      toast({
        title: "✨ Theme Applied!",
        description: `Switched to ${themeName.charAt(0).toUpperCase() + themeName.slice(1)} theme`,
      });
    }
  };

  // Auto-detect system theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('decentralcy-theme');
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      // Auto-detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('decentralcy-theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save theme preference
  const setTheme = (themeName: string) => {
    applyTheme(themeName);
    localStorage.setItem('decentralcy-theme', themeName);
  };

  return (
    <div className="adaptive-theme-container">
      {/* Theme Selector (can be shown/hidden) */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {Object.keys(themes).map((themeName) => (
          <Button
            key={themeName}
            size="sm"
            variant={currentTheme === themeName ? "default" : "outline"}
            onClick={() => setTheme(themeName)}
            className={`transition-all duration-300 hover:scale-105 ${
              themeName.startsWith('web3') ? 'glow-effect' : ''
            }`}
          >
            {themeName === 'light' && '☀️'}
            {themeName === 'dark' && '🌙'}
            {themeName === 'web3-neon' && '⚡'}
            {themeName === 'web3-gradient' && '🌈'}
          </Button>
        ))}
      </div>

      {children}

      {/* Custom CSS for Web3 themes and animations */}
      <style jsx global>{`
        .web3-theme {
          position: relative;
        }
        
        .web3-theme::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
          z-index: -1;
        }

        .neon-glow {
          animation: neonPulse 3s ease-in-out infinite alternate;
        }

        @keyframes neonPulse {
          from {
            filter: brightness(1) saturate(1);
          }
          to {
            filter: brightness(1.1) saturate(1.2);
          }
        }

        .glow-effect {
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          transition: box-shadow 0.3s ease;
        }

        .glow-effect:hover {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
        }

        /* Smooth transitions for all interactive elements */
        button, .card, .input {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Microinteraction hover effects */
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        /* Success animations */
        @keyframes successPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .success-animation {
          animation: successPulse 0.6s ease-in-out;
        }

        /* Loading skeleton animation */
        @keyframes skeleton {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }

        .skeleton {
          animation: skeleton 1.5s ease-in-out infinite;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        }
      `}</style>
    </div>
  );
}