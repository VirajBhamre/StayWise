import { extendTheme } from '@chakra-ui/react';

const stayWiseTheme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Montserrat', sans-serif",
  },
  colors: {
    gold: {
      50: '#FFF9E5',
      100: '#FFF0C4',
      200: '#FFE79E',
      300: '#FFDD77',
      400: '#FFD451',
      500: '#FFCA28', // Primary gold
      600: '#FFBF00', // Darker gold
      700: '#E6AC00',
      800: '#CC9900',
      900: '#B38600',
    },
    brand: {
      primary: '#FFCA28', // Gold
      secondary: '#121212', // Near black
      accent: '#FFD451', // Lighter gold
      dark: '#000000', // True black
      light: '#F0F0F0', // Light gray
    },
    background: {
      primary: '#0A0A0A', // Deep black
      secondary: '#141414', // Slightly lighter black
      accent: '#1E1E1E', // Dark gray
      card: 'rgba(30, 30, 30, 0.7)', // Semi-transparent dark for cards
    },
    text: {
      primary: '#FFFFFF', // White
      secondary: '#CCCCCC', // Light gray
      accent: '#FFCA28', // Gold
    }
  },
  styles: {
    global: {
      body: {
        bg: 'background.primary',
        color: 'text.primary',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(30, 30, 30, 0.2) 0%, rgba(10, 10, 10, 0.6) 90%)',
        backgroundAttachment: 'fixed',
      },
      "::selection": {
        backgroundColor: "gold.600",
        color: "background.primary",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "500",
        borderRadius: "md",
        _focus: {
          boxShadow: "0 0 0 3px rgba(255, 202, 40, 0.4)",
        },
      },
      variants: {
        solid: {
          bg: 'gold.500',
          color: 'black',
          _hover: {
            bg: 'gold.600',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(255, 202, 40, 0.4)',
            transition: 'all 0.3s ease',
          },
          _active: {
            bg: 'gold.700',
            transform: 'translateY(0)',
          },
        },
        outline: {
          borderColor: 'gold.500',
          color: 'gold.500',
          borderWidth: '1.5px',
          _hover: {
            bg: 'rgba(255, 202, 40, 0.1)',
            borderColor: 'gold.400',
            boxShadow: '0 0 10px rgba(255, 202, 40, 0.3)',
          },
        },
        ghost: {
          color: 'text.secondary',
          _hover: {
            bg: 'whiteAlpha.100',
            color: 'gold.500',
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        color: 'text.primary',
        letterSpacing: '0.5px',
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderColor: 'whiteAlpha.300',
            borderWidth: '1px',
            _hover: {
              borderColor: 'gold.500',
            },
            _focus: {
              borderColor: 'gold.500',
              boxShadow: '0 0 0 1px #FFCA28',
            },
            bg: 'background.accent',
            backdropFilter: 'blur(4px)',
          },
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Textarea: {
      variants: {
        outline: {
          borderColor: 'whiteAlpha.300',
          borderWidth: '1px',
          _hover: {
            borderColor: 'gold.500',
          },
          _focus: {
            borderColor: 'gold.500',
            boxShadow: '0 0 0 1px #FFCA28',
          },
          bg: 'background.accent',
          backdropFilter: 'blur(4px)',
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'background.card',
          borderRadius: 'lg',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          borderWidth: '1px',
          borderColor: 'whiteAlpha.100',
          overflow: 'hidden',
        },
      },
    },
    Table: {
      variants: {
        simple: {
          th: {
            borderColor: 'whiteAlpha.300',
            color: 'gold.500',
            fontWeight: '600',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontSize: 'xs',
          },
          td: {
            borderColor: 'whiteAlpha.200',
          },
        },
      },
    },
    Tabs: {
      variants: {
        line: {
          tab: {
            color: 'text.secondary',
            _selected: {
              color: 'gold.500',
              borderColor: 'gold.500',
              fontWeight: '600',
            },
            _hover: {
              color: 'gold.300',
            },
          },
          tabpanel: {
            pt: 6,
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        textTransform: 'none',
        fontWeight: '500',
        borderRadius: 'full',
      },
    },
    Divider: {
      baseStyle: {
        borderColor: 'whiteAlpha.200',
      },
    },
  },
  layerStyles: {
    glassmorphism: {
      bg: 'rgba(20, 20, 20, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: 'lg',
      borderWidth: '1px',
      borderColor: 'whiteAlpha.100',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    },
    card: {
      bg: 'background.card',
      borderRadius: 'lg',
      p: 6,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease',
      _hover: {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
      },
      borderWidth: '1px',
      borderColor: 'whiteAlpha.100',
    },
    statCard: {
      bg: 'background.card',
      borderRadius: 'lg',
      p: 5,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease',
      _hover: {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
      },
      borderWidth: '1px',
      borderColor: 'whiteAlpha.100',
      position: 'relative',
      overflow: 'hidden',
    },
    gradientBorder: {
      position: 'relative',
      _before: {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 'lg',
        padding: '2px',
        background: 'linear-gradient(45deg, gold.400, gold.600)',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'xor',
        pointerEvents: 'none',
      },
    },
  },
  textStyles: {
    logo: {
      fontSize: ['2xl', '3xl'],
      fontWeight: 'bold',
      letterSpacing: 'wide',
      bgGradient: 'linear(to-r, gold.400, gold.600)',
      bgClip: 'text',
    },
    pageTitle: {
      fontSize: ['xl', '2xl', '3xl'],
      fontWeight: 'bold',
      letterSpacing: 'tight',
      bgGradient: 'linear(to-r, gold.400, gold.600)',
      bgClip: 'text',
    },
    sectionTitle: {
      fontSize: ['lg', 'xl'],
      fontWeight: 'semibold',
      color: 'gold.500',
      letterSpacing: '0.5px',
    },
  },
});

export default stayWiseTheme;