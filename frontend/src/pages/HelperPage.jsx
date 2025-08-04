import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Search,
  ChevronRight,
  ChevronDown,
  MessageSquare
} from 'lucide-react';

const HelperPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('us');
  const [expandedSection, setExpandedSection] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(0); // First FAQ expanded by default

  const languages = [
    { code: 'us', flag: 'US', name: 'English' },
    { code: 'it', flag: 'IT', name: 'Italian' },
    { code: 'es', flag: 'ES', name: 'Spanish' },
    { code: 'fr', flag: 'FR', name: 'French' }
  ];

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Game Helper</h1>
          <p className="text-gray-300 text-lg">Master the art of team building and strategy</p>
        </div>

        {/* Language Selection */}
        <Card className="backdrop-blur-lg border mb-8"
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="guides" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.5),
                      borderColor: logoColors.primaryBlueAlpha(0.3)
                    }}>
            <TabsTrigger value="guides" className="text-white data-[state=active]:text-black data-[state=active]:bg-blue-500">
              Game Guides
            </TabsTrigger>
            <TabsTrigger value="tips" className="text-white data-[state=active]:text-black data-[state=active]:bg-blue-500">
              Tips & Strategies
            </TabsTrigger>
            <TabsTrigger value="faq" className="text-white data-[state=active]:text-black data-[state=active]:bg-blue-500">
              FAQ
            </TabsTrigger>
            <TabsTrigger value="forum" className="text-white data-[state=active]:text-black data-[state=active]:bg-blue-500">
              Community Forum
            </TabsTrigger>
          </TabsList>

          {/* Game Guides Tab */}
          <TabsContent value="guides" className="space-y-4">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search guides and tips..."
                className="pl-10 bg-black/20 border-gray-600 text-white h-12 text-base"
              />
            </div>

            {/* Expandable Guide Sections */}
            <div className="space-y-4">
              {/* Team Building Fundamentals */}
              <Card className="backdrop-blur-lg text-white border"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                    onClick={() => toggleSection('team-building')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                           style={{ backgroundColor: logoColors.primaryYellow }}>
                        <span className="text-black font-bold text-sm">👥</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Team Building Fundamentals</h3>
                        <p className="text-gray-300 text-sm">Learn the basics of creating effective teams</p>
                      </div>
                    </div>
                    {expandedSection === 'team-building' ? 
                      <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    }
                  </button>
                  {expandedSection === 'team-building' && (
                    <div className="px-6 pb-6 border-t border-gray-700">
                      <div className="pt-4 space-y-3 text-gray-300 text-sm">
                        <p>• Understanding player positions and their roles on the field</p>
                        <p>• Choosing the right formation for your playstyle</p>
                        <p>• Balancing offensive and defensive capabilities</p>
                        <p>• Player chemistry and elemental synergies</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Formation Strategy Guide */}
              <Card className="backdrop-blur-lg text-white border"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                    onClick={() => toggleSection('formation')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                           style={{ backgroundColor: logoColors.primaryYellow }}>
                        <span className="text-black font-bold text-sm">⚡</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Formation Strategy Guide</h3>
                        <p className="text-gray-300 text-sm">Master different formations and their uses</p>
                      </div>
                    </div>
                    {expandedSection === 'formation' ? 
                      <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    }
                  </button>
                  {expandedSection === 'formation' && (
                    <div className="px-6 pb-6 border-t border-gray-700">
                      <div className="pt-4 space-y-3 text-gray-300 text-sm">
                        <p>• 4-4-2: Balanced formation for beginners</p>
                        <p>• 3-5-2: Midfield control and possession</p>
                        <p>• 4-3-3: Aggressive attacking formation</p>
                        <p>• 5-3-2: Defensive stability and counter-attacks</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Character Stats Explained */}
              <Card className="backdrop-blur-lg text-white border"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                    onClick={() => toggleSection('stats')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                           style={{ backgroundColor: logoColors.primaryYellow }}>
                        <span className="text-black font-bold text-sm">🏆</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Character Stats Explained</h3>
                        <p className="text-gray-300 text-sm">Understanding player attributes and optimization</p>
                      </div>
                    </div>
                    {expandedSection === 'stats' ? 
                      <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    }
                  </button>
                  {expandedSection === 'stats' && (
                    <div className="px-6 pb-6 border-t border-gray-700">
                      <div className="pt-4 space-y-3 text-gray-300 text-sm">
                        <p>• Kick: Shooting power and accuracy</p>
                        <p>• Dribble: Ball control and agility</p>
                        <p>• Block: Defensive capabilities</p>
                        <p>• Catch: Goalkeeping ability</p>
                        <p>• Speed: Movement and positioning</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Equipment & Enhancement */}
              <Card className="backdrop-blur-lg text-white border"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                    onClick={() => toggleSection('equipment')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                           style={{ backgroundColor: logoColors.primaryYellow }}>
                        <span className="text-black font-bold text-sm">⚡</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Equipment & Enhancement</h3>
                        <p className="text-gray-300 text-sm">Optimize your players with the right equipment</p>
                      </div>
                    </div>
                    {expandedSection === 'equipment' ? 
                      <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    }
                  </button>
                  {expandedSection === 'equipment' && (
                    <div className="px-6 pb-6 border-t border-gray-700">
                      <div className="pt-4 space-y-3 text-gray-300 text-sm">
                        <p>• Boots: Increase speed and kicking power</p>
                        <p>• Bracelets: Boost dribbling and technique</p>
                        <p>• Pendants: Enhance defensive stats</p>
                        <p>• Special items: Unique bonuses and effects</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tips & Strategies Tab */}
          <TabsContent value="tips" className="space-y-4">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search guides and tips..."
                className="pl-10 bg-black/20 border-gray-600 text-white h-12 text-base"
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
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                         style={{ backgroundColor: logoColors.primaryYellow }}>
                      <span className="text-black font-bold text-sm">⚡</span>
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
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                         style={{ backgroundColor: logoColors.primaryYellow }}>
                      <span className="text-black font-bold text-sm">⚡</span>
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
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                         style={{ backgroundColor: logoColors.primaryYellow }}>
                      <span className="text-black font-bold text-sm">⚡</span>
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
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                         style={{ backgroundColor: logoColors.primaryYellow }}>
                      <span className="text-black font-bold text-sm">⚡</span>
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
          <TabsContent value="faq" className="space-y-4">
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
                               style={{ backgroundColor: logoColors.primaryYellow }}>
                            <span className="text-black text-xs font-bold">Q</span>
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
          <TabsContent value="forum" className="space-y-4">
            <Card className="backdrop-blur-lg text-white border text-center"
                  style={{ 
                    backgroundColor: logoColors.blackAlpha(0.3),
                    borderColor: logoColors.primaryBlueAlpha(0.2)
                  }}>
              <CardContent className="p-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" 
                     style={{ backgroundColor: logoColors.primaryYellow }}>
                  <MessageSquare className="h-8 w-8 text-black" />
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
  );
};

export default HelperPage;