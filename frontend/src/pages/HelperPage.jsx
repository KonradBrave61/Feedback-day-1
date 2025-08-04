import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Search,
  Users,
  TrendingUp,
  Zap,
  Shield,
  ChevronRight,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { logoColors } from '../styles/colors';

const HelperPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const languages = [
    { code: 'en', flag: '🇺🇸', name: 'English' },
    { code: 'it', flag: '🇮🇹', name: 'Italian' },
    { code: 'es', flag: '🇪🇸', name: 'Spanish' },
    { code: 'fr', flag: '🇫🇷', name: 'French' }
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Game Helper</h1>
          <p className="text-gray-300 text-lg">Master the art of team building and strategy</p>
        </div>

        {/* Language Selection */}
        <div className="flex justify-center mb-8">
          <Card className="backdrop-blur-lg border"
                style={{ 
                  backgroundColor: logoColors.blackAlpha(0.3),
                  borderColor: logoColors.primaryBlueAlpha(0.2)
                }}>
            <CardContent className="p-6">
              <h3 className="text-white font-medium mb-4">Select Language</h3>
              <div className="grid grid-cols-4 gap-3">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={selectedLanguage === lang.code ? "default" : "outline"}
                    className={`flex items-center gap-2 px-4 py-3 ${
                      selectedLanguage === lang.code 
                        ? 'text-black hover:opacity-80' 
                        : 'text-white border-gray-600 hover:bg-gray-700'
                    }`}
                    style={selectedLanguage === lang.code ? {
                      background: logoColors.yellowOrangeGradient
                    } : {}}
                    onClick={() => setSelectedLanguage(lang.code)}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.code.toUpperCase()}</span>
                    <span className="text-sm">{lang.name}</span>
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
              <TabsTrigger value="guides" className="text-white data-[state=active]:text-black">
                Game Guides
              </TabsTrigger>
              <TabsTrigger value="tips" className="text-white data-[state=active]:text-black">
                Tips & Strategies
              </TabsTrigger>
              <TabsTrigger value="faq" className="text-white data-[state=active]:text-black">
                FAQ
              </TabsTrigger>
              <TabsTrigger value="forum" className="text-white data-[state=active]:text-black">
                Community Forum
              </TabsTrigger>
            </TabsList>

            {/* Game Guides Tab */}
            <TabsContent value="guides" className="space-y-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search guides and tips..."
                  className="pl-10 bg-black/20 border-gray-600 text-white h-12"
                />
              </div>

              {/* Guide Cards */}
              <div className="space-y-4">
                {/* Team Building Fundamentals */}
                <Card className="backdrop-blur-lg text-white border cursor-pointer hover:border-yellow-400/50 transition-colors group"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                             style={{ backgroundColor: logoColors.primaryYellow + '20' }}>
                          <Users className="h-6 w-6" style={{ color: logoColors.primaryYellow }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">Team Building Fundamentals</h3>
                          <p className="text-gray-300 text-sm">Learn the basics of creating effective teams</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </CardContent>
                </Card>

                {/* Formation Strategy Guide */}
                <Card className="backdrop-blur-lg text-white border cursor-pointer hover:border-yellow-400/50 transition-colors group"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                             style={{ backgroundColor: logoColors.primaryYellow + '20' }}>
                          <TrendingUp className="h-6 w-6" style={{ color: logoColors.primaryYellow }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">Formation Strategy Guide</h3>
                          <p className="text-gray-300 text-sm">Master different formations and their uses</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </CardContent>
                </Card>

                {/* Character Stats Explained */}
                <Card className="backdrop-blur-lg text-white border cursor-pointer hover:border-yellow-400/50 transition-colors group"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                             style={{ backgroundColor: logoColors.primaryYellow + '20' }}>
                          <Zap className="h-6 w-6" style={{ color: logoColors.primaryYellow }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">Character Stats Explained</h3>
                          <p className="text-gray-300 text-sm">Understanding player attributes and optimization</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </CardContent>
                </Card>

                {/* Equipment & Enhancement */}
                <Card className="backdrop-blur-lg text-white border cursor-pointer hover:border-yellow-400/50 transition-colors group"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                             style={{ backgroundColor: logoColors.primaryYellow + '20' }}>
                          <Shield className="h-6 w-6" style={{ color: logoColors.primaryYellow }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">Equipment & Enhancement</h3>
                          <p className="text-gray-300 text-sm">Optimize your players with the right equipment</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tips & Strategies Tab */}
            <TabsContent value="tips" className="space-y-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search guides and tips..."
                  className="pl-10 bg-black/20 border-gray-600 text-white h-12"
                />
              </div>

              {/* Strategy Cards Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="backdrop-blur-lg text-white border"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                           style={{ backgroundColor: logoColors.primaryYellow + '20' }}>
                        <Zap className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                      </div>
                      <h3 className="font-semibold text-lg">Formation Synergy</h3>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Choose formations that complement your players' strengths and playing style.
                    </p>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-lg text-white border"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                           style={{ backgroundColor: logoColors.primaryYellow + '20' }}>
                        <Zap className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                      </div>
                      <h3 className="font-semibold text-lg">Balanced Team Composition</h3>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Ensure you have strong players in each position rather than concentrating all power in one area.
                    </p>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-lg text-white border"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                           style={{ backgroundColor: logoColors.primaryYellow + '20' }}>
                        <Zap className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                      </div>
                      <h3 className="font-semibold text-lg">Equipment Strategy</h3>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Prioritize equipment that enhances your players' primary stats for their positions.
                    </p>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-lg text-white border"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                           style={{ backgroundColor: logoColors.primaryYellow + '20' }}>
                        <Zap className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                      </div>
                      <h3 className="font-semibold text-lg">Technique Mastery</h3>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Learn different techniques and match them to appropriate situations and player types.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-6">
              <Card className="backdrop-blur-lg text-white border"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[
                      {
                        question: "How do I save my team formations?",
                        answer: "Use the Save Team button in Team Builder to store your formations in save slots. You can have up to 5 saved teams."
                      },
                      {
                        question: "What are Kizuna Stars used for?",
                        answer: "Kizuna Stars are the premium currency used for constellation pulls to obtain new characters and items."
                      },
                      {
                        question: "How does the equipment system work?",
                        answer: "Equipment provides stat bonuses to your players. Each player can equip boots, bracelets, and pendants to enhance their abilities."
                      },
                      {
                        question: "Can I change formations during gameplay?",
                        answer: "Yes! You can switch between different saved formations at any time during team management."
                      }
                    ].map((faq, index) => (
                      <div key={index} className="border-b border-gray-700 last:border-b-0 pb-4 last:pb-0">
                        <button
                          className="flex items-center justify-between w-full text-left"
                          onClick={() => toggleFaq(index)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" 
                                 style={{ backgroundColor: logoColors.primaryYellow + '20' }}>
                              <span className="text-xs font-bold" style={{ color: logoColors.primaryYellow }}>
                                Q
                              </span>
                            </div>
                            <span className="font-medium">{faq.question}</span>
                          </div>
                          {expandedFaq === index ? 
                            <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          }
                        </button>
                        {expandedFaq === index && (
                          <div className="mt-3 ml-9 text-gray-300 text-sm">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Community Forum Tab */}
            <TabsContent value="forum" className="space-y-6">
              <Card className="backdrop-blur-lg text-white border text-center"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardContent className="p-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" 
                       style={{ backgroundColor: logoColors.primaryYellow + '20' }}>
                    <MessageSquare className="h-8 w-8" style={{ color: logoColors.primaryYellow }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Community Forum</h3>
                  <p className="text-gray-300 mb-6">
                    Connect with other players, share strategies, and get help from the community.
                  </p>
                  <Button 
                    style={{ background: logoColors.yellowOrangeGradient }}
                    className="text-black hover:opacity-80 px-8 py-3"
                    onClick={() => window.open('/community', '_blank')}
                  >
                    Join Discussion
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