import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { 
  HelpCircle, 
  BookOpen, 
  Target, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Zap,
  Shield,
  Award,
  Settings,
  Globe
} from 'lucide-react';
import { logoColors } from '../styles/colors';

const HelperPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    { code: 'en', flag: '🇺🇸', name: 'English' },
    { code: 'it', flag: '🇮🇹', name: 'Italian' },
    { code: 'es', flag: '🇪🇸', name: 'Spanish' },
    { code: 'fr', flag: '🇫🇷', name: 'French' }
  ];

  const content = {
    en: {
      title: "Game Helper",
      subtitle: "Master the art of team building and strategy",
      selectLanguage: "Select Language",
      tabs: {
        guides: "Game Guides",
        tips: "Tips & Strategies", 
        faq: "FAQ",
        forum: "Community Forum"
      },
      sections: {
        teamBuilding: {
          title: "Team Building Fundamentals",
          subtitle: "Learn the basics of creating effective teams",
          content: [
            {
              title: "Understanding Player Positions",
              content: "Each player has a primary position (GK, DF, MF, FW) that determines their role and optimal placement on the field. Goalkeepers protect the goal, Defenders focus on blocking attacks, Midfielders control the game flow, and Forwards score goals."
            },
            {
              title: "Formation Selection",
              content: "Choose formations based on your strategy: 4-4-2 for balanced play, 3-5-2 for midfield control, 4-3-3 for aggressive attacking, or 5-3-2 for defensive stability."
            },
            {
              title: "Player Chemistry",
              content: "Players from the same school or with similar elements work better together. Look for synergies between characters to maximize team performance."
            }
          ]
        },
        formationStrategy: {
          title: "Formation Strategy Guide", 
          subtitle: "Master different formations and their uses",
          content: [
            {
              title: "4-4-2 Formation",
              content: "The most balanced formation. Use when you want equal focus on attack and defense. Great for beginners and provides solid midfield presence."
            },
            {
              title: "3-5-2 Formation",
              content: "Emphasizes midfield control with 5 midfielders. Perfect for dominating possession and creating numerous attacking opportunities through the center."
            },
            {
              title: "4-3-3 Formation",
              content: "Aggressive attacking formation with 3 forwards. Use when you need to score quickly or against defensive opponents."
            },
            {
              title: "5-3-2 Formation", 
              content: "Defensive formation with 5 defenders. Ideal for protecting a lead or facing very strong attacking teams."
            }
          ]
        },
        characterStats: {
          title: "Character Stats Explained",
          subtitle: "Understanding player attributes and optimization", 
          content: [
            {
              title: "Primary Stats",
              content: "Kick (shooting power), Dribble (ball control), Block (defensive ability), Catch (goalkeeping), Speed (movement), and Stamina (endurance) are the core attributes that define a player's capabilities."
            },
            {
              title: "Element Types",
              content: "Fire (aggressive), Earth (defensive), Wood (balanced), Wind (speed), and Lightning (technical) elements provide different advantages and special technique access."
            },
            {
              title: "Stat Optimization", 
              content: "Focus on a player's strongest stats. Don't try to make balanced players - specialize them in their natural strengths for maximum effectiveness."
            }
          ]
        },
        equipment: {
          title: "Equipment & Enhancement",
          subtitle: "Optimize your players with the right equipment",
          content: [
            {
              title: "Equipment Types",
              content: "Boots increase speed and kicking power, Bracelets boost dribbling and technique, Pendants enhance defensive stats, and Special items provide unique bonuses."
            },
            {
              title: "Stat Bonuses",
              content: "Each equipment piece provides specific stat increases. Stack bonuses that complement your player's natural strengths for optimal performance."
            },
            {
              title: "Rarity System",
              content: "Common (white), Rare (blue), Epic (purple), and Legendary (gold) equipment offer increasing stat bonuses. Higher rarity equipment provides better enhancements."
            }
          ]
        }
      },
      faq: [
        {
          question: "How do I save my team formations?",
          answer: "Use the Save Team button in the Team Builder. You have 5 save slots available and can name your formations for easy identification."
        },
        {
          question: "Can I change formations during gameplay?",  
          answer: "Yes! You can switch between different formations at any time. Your players will automatically adjust to their new positions."
        },
        {
          question: "What happens if I don't have the right positions filled?",
          answer: "The game allows flexible positioning. Players can be placed in non-optimal positions, though they may perform better in their natural roles."
        },
        {
          question: "How do equipment bonuses work?",
          answer: "Equipment bonuses are added directly to your player's base stats. Multiple equipment pieces stack, so choose items that complement each other."
        }
      ]
    },
    it: {
      title: "Aiuto di Gioco",
      subtitle: "Padroneggia l'arte della costruzione della squadra e della strategia",
      selectLanguage: "Seleziona Lingua",
      tabs: {
        guides: "Guide di Gioco",
        tips: "Consigli e Strategie",
        faq: "FAQ", 
        forum: "Forum Comunità"
      },
      sections: {
        teamBuilding: {
          title: "Fondamenti della Costruzione della Squadra",
          subtitle: "Impara le basi per creare squadre efficaci",
          content: [
            {
              title: "Comprendere le Posizioni dei Giocatori", 
              content: "Ogni giocatore ha una posizione primaria (GK, DF, MF, FW) che determina il loro ruolo e posizionamento ottimale sul campo."
            }
          ]
        },
        formationStrategy: {
          title: "Guida alla Strategia delle Formazioni",
          subtitle: "Padroneggia diverse formazioni e i loro usi",
          content: [
            {
              title: "Formazione 4-4-2",
              content: "La formazione più equilibrata. Usala quando vuoi uguale focus su attacco e difesa."
            }
          ]
        },
        characterStats: {
          title: "Statistiche dei Personaggi Spiegate",
          subtitle: "Comprendere gli attributi dei giocatori e l'ottimizzazione",
          content: [
            {
              title: "Statistiche Primarie",
              content: "Calcio, Dribbling, Blocco, Presa, Velocità e Resistenza sono gli attributi principali."
            }
          ]
        },
        equipment: {
          title: "Equipaggiamento e Potenziamento", 
          subtitle: "Ottimizza i tuoi giocatori con l'equipaggiamento giusto",
          content: [
            {
              title: "Tipi di Equipaggiamento",
              content: "Scarpe, Braccialetti, Ciondoli e oggetti Speciali forniscono diversi bonus."
            }
          ]
        }
      },
      faq: [
        {
          question: "Come posso salvare le mie formazioni di squadra?",
          answer: "Usa il pulsante Salva Squadra nel Team Builder. Hai 5 slot di salvataggio disponibili."
        }
      ]
    },
    es: {
      title: "Ayuda del Juego", 
      subtitle: "Domina el arte de la construcción de equipos y la estrategia",
      selectLanguage: "Seleccionar Idioma",
      tabs: {
        guides: "Guías del Juego",
        tips: "Consejos y Estrategias",
        faq: "FAQ",
        forum: "Foro de Comunidad"
      },
      sections: {
        teamBuilding: {
          title: "Fundamentos de Construcción de Equipos",
          subtitle: "Aprende los conceptos básicos para crear equipos efectivos",
          content: [
            {
              title: "Entender las Posiciones de Jugadores",
              content: "Cada jugador tiene una posición primaria (GK, DF, MF, FW) que determina su rol y colocación óptima en el campo."
            }
          ]
        },
        formationStrategy: {
          title: "Guía de Estrategia de Formaciones",
          subtitle: "Domina diferentes formaciones y sus usos", 
          content: [
            {
              title: "Formación 4-4-2",
              content: "La formación más equilibrada. Úsala cuando quieras igual enfoque en ataque y defensa."
            }
          ]
        },
        characterStats: {
          title: "Estadísticas de Personajes Explicadas",
          subtitle: "Entender los atributos de jugadores y optimización",
          content: [
            {
              title: "Estadísticas Primarias", 
              content: "Patada, Regate, Bloqueo, Atajada, Velocidad y Resistencia son los atributos principales."
            }
          ]
        },
        equipment: {
          title: "Equipamiento y Mejora",
          subtitle: "Optimiza tus jugadores con el equipamiento correcto",
          content: [
            {
              title: "Tipos de Equipamiento",
              content: "Botas, Pulseras, Colgantes y objetos Especiales proporcionan diferentes bonificaciones."
            }
          ]
        }
      },
      faq: [
        {
          question: "¿Cómo guardo mis formaciones de equipo?",
          answer: "Usa el botón Guardar Equipo en el Team Builder. Tienes 5 ranuras de guardado disponibles."
        }
      ]
    },
    fr: {
      title: "Aide du Jeu",
      subtitle: "Maîtrisez l'art de la construction d'équipe et de la stratégie", 
      selectLanguage: "Sélectionner la Langue",
      tabs: {
        guides: "Guides du Jeu",
        tips: "Conseils et Stratégies",
        faq: "FAQ",
        forum: "Forum Communauté"
      },
      sections: {
        teamBuilding: {
          title: "Fondamentaux de la Construction d'Équipe",
          subtitle: "Apprenez les bases pour créer des équipes efficaces",
          content: [
            {
              title: "Comprendre les Positions des Joueurs",
              content: "Chaque joueur a une position primaire (GK, DF, MF, FW) qui détermine son rôle et placement optimal sur le terrain."
            }
          ]
        },
        formationStrategy: {
          title: "Guide de Stratégie des Formations",
          subtitle: "Maîtrisez différentes formations et leurs utilisations",
          content: [
            {
              title: "Formation 4-4-2", 
              content: "La formation la plus équilibrée. Utilisez-la quand vous voulez un focus égal sur l'attaque et la défense."
            }
          ]
        },
        characterStats: {
          title: "Statistiques des Personnages Expliquées",
          subtitle: "Comprendre les attributs des joueurs et l'optimisation",
          content: [
            {
              title: "Statistiques Primaires",
              content: "Coup de pied, Dribble, Blocage, Arrêt, Vitesse et Endurance sont les attributs principaux."
            }
          ]
        },
        equipment: {
          title: "Équipement et Amélioration",
          subtitle: "Optimisez vos joueurs avec le bon équipement", 
          content: [
            {
              title: "Types d'Équipement",
              content: "Chaussures, Bracelets, Pendentifs et objets Spéciaux fournissent différents bonus."
            }
          ]
        }
      },
      faq: [
        {
          question: "Comment puis-je sauvegarder mes formations d'équipe?",
          answer: "Utilisez le bouton Sauvegarder l'Équipe dans le Team Builder. Vous avez 5 emplacements de sauvegarde disponibles."
        }
      ]
    }
  };

  const currentContent = content[selectedLanguage];

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{currentContent.title}</h1>
          <p className="text-gray-300 text-lg">{currentContent.subtitle}</p>
        </div>

        {/* Language Selection */}
        <div className="flex justify-center mb-8">
          <Card className="backdrop-blur-lg border"
                style={{ 
                  backgroundColor: logoColors.blackAlpha(0.3),
                  borderColor: logoColors.primaryBlueAlpha(0.2)
                }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-white" />
                <span className="text-white font-medium">{currentContent.selectLanguage}</span>
              </div>
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={selectedLanguage === lang.code ? "default" : "outline"}
                    size="sm"
                    className={`flex items-center gap-2 ${
                      selectedLanguage === lang.code 
                        ? 'text-black hover:opacity-80' 
                        : 'text-white border-blue-400/30 hover:bg-blue-700/30'
                    }`}
                    style={selectedLanguage === lang.code ? {
                      background: logoColors.yellowOrangeGradient
                    } : {}}
                    onClick={() => setSelectedLanguage(lang.code)}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="guides" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.5),
                        borderColor: logoColors.primaryBlueAlpha(0.3)
                      }}>
              <TabsTrigger value="guides" className="text-white data-[state=active]:text-black"
                           style={{ 
                             '&[data-state=active]': { background: logoColors.yellowOrangeGradient }
                           }}>
                <BookOpen className="h-4 w-4 mr-2" />
                {currentContent.tabs.guides}
              </TabsTrigger>
              <TabsTrigger value="tips" className="text-white data-[state=active]:text-black">
                <Target className="h-4 w-4 mr-2" />
                {currentContent.tabs.tips}
              </TabsTrigger>
              <TabsTrigger value="faq" className="text-white data-[state=active]:text-black">
                <HelpCircle className="h-4 w-4 mr-2" />
                {currentContent.tabs.faq}
              </TabsTrigger>
              <TabsTrigger value="forum" className="text-white data-[state=active]:text-black">
                <MessageSquare className="h-4 w-4 mr-2" />
                {currentContent.tabs.forum}
              </TabsTrigger>
            </TabsList>

            {/* Game Guides Tab */}
            <TabsContent value="guides" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Team Building Fundamentals */}
                <Card className="backdrop-blur-lg text-white border h-fit"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                      {currentContent.sections.teamBuilding.title}
                    </CardTitle>
                    <p className="text-gray-300">{currentContent.sections.teamBuilding.subtitle}</p>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {currentContent.sections.teamBuilding.content.map((item, index) => (
                        <AccordionItem key={index} value={`team-${index}`} className="border-blue-400/20">
                          <AccordionTrigger className="text-white hover:text-blue-300">
                            {item.title}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-300">
                            {item.content}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>

                {/* Formation Strategy Guide */}
                <Card className="backdrop-blur-lg text-white border h-fit"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                      {currentContent.sections.formationStrategy.title}
                    </CardTitle>
                    <p className="text-gray-300">{currentContent.sections.formationStrategy.subtitle}</p>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {currentContent.sections.formationStrategy.content.map((item, index) => (
                        <AccordionItem key={index} value={`formation-${index}`} className="border-blue-400/20">
                          <AccordionTrigger className="text-white hover:text-blue-300">
                            {item.title}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-300">
                            {item.content}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>

                {/* Character Stats Explained */}
                <Card className="backdrop-blur-lg text-white border h-fit"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" style={{ color: logoColors.primaryOrange }} />
                      {currentContent.sections.characterStats.title}
                    </CardTitle>
                    <p className="text-gray-300">{currentContent.sections.characterStats.subtitle}</p>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {currentContent.sections.characterStats.content.map((item, index) => (
                        <AccordionItem key={index} value={`stats-${index}`} className="border-blue-400/20">
                          <AccordionTrigger className="text-white hover:text-blue-300">
                            {item.title}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-300">
                            {item.content}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>

                {/* Equipment & Enhancement */}
                <Card className="backdrop-blur-lg text-white border h-fit"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" style={{ color: logoColors.secondaryBlue }} />
                      {currentContent.sections.equipment.title}
                    </CardTitle>
                    <p className="text-gray-300">{currentContent.sections.equipment.subtitle}</p>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {currentContent.sections.equipment.content.map((item, index) => (
                        <AccordionItem key={index} value={`equip-${index}`} className="border-blue-400/20">
                          <AccordionTrigger className="text-white hover:text-blue-300">
                            {item.title}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-300">
                            {item.content}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tips & Strategies Tab */}
            <TabsContent value="tips" className="space-y-6">
              <Card className="backdrop-blur-lg text-white border"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                    Advanced Tips & Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: logoColors.blackAlpha(0.2) }}>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Award className="h-4 w-4" style={{ color: logoColors.primaryYellow }} />
                        Pro Team Building Tips
                      </h3>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Always have a strong goalkeeper as your last line of defense</li>
                        <li>• Balance your team with different element types</li>
                        <li>• Consider player chemistry and school affiliations</li>
                        <li>• Don't neglect bench players - they can be crucial substitutes</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: logoColors.blackAlpha(0.2) }}>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Settings className="h-4 w-4" style={{ color: logoColors.primaryBlue }} />
                        Equipment Optimization
                      </h3>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Prioritize equipment that enhances key stats</li>
                        <li>• Mix and match to cover weaknesses</li>
                        <li>• Higher rarity equipment provides better bonuses</li>
                        <li>• Consider set bonuses when available</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-6">
              <Card className="backdrop-blur-lg text-white border"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {currentContent.faq.map((item, index) => (
                      <AccordionItem key={index} value={`faq-${index}`} className="border-blue-400/20">
                        <AccordionTrigger className="text-white hover:text-blue-300">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Community Forum Tab */}
            <TabsContent value="forum" className="space-y-6">
              <Card className="backdrop-blur-lg text-white border"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" style={{ color: logoColors.secondaryBlue }} />
                    Community Forum
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4" style={{ color: logoColors.primaryBlue }} />
                  <h3 className="text-xl font-semibold mb-4">Join the Community</h3>
                  <p className="text-gray-300 mb-6">
                    Connect with other players, share strategies, and get help from the community.
                  </p>
                  <Button 
                    style={{ background: logoColors.yellowOrangeGradient }}
                    className="text-black hover:opacity-80"
                    onClick={() => window.open('/community', '_blank')}
                  >
                    Visit Community Hub
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default HelperPage;