import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Bug, 
  User,
  Settings,
  Mail,
  Phone,
  Clock,
  AlertTriangle,
  CheckCircle,
  Monitor,
  Send
} from 'lucide-react';
import { logoColors } from '../styles/colors';
import { toast } from 'sonner';

const SupportPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [bugFormData, setBugFormData] = useState({
    title: '',
    category: 'Gameplay Issues',
    priority: 'Medium',
    description: '',
    reproducible: false
  });

  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    category: 'General Question',
    subject: '',
    message: ''
  });

  const handleBugSubmit = (e) => {
    e.preventDefault();
    toast.success('Bug report submitted successfully!', {
      description: 'We\'ll review your report and get back to you soon.'
    });
    setBugFormData({ title: '', category: 'Gameplay Issues', priority: 'Medium', description: '', reproducible: false });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent successfully!', {
      description: 'Our support team will respond within 24 hours.'
    });
    setContactFormData({ name: '', email: '', category: 'General Question', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen" 
         style={{ 
           background: logoColors.backgroundGradient
         }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Technical Support</h1>
          <p className="text-gray-300 text-lg">Get help with technical issues and account problems</p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.5),
                        borderColor: logoColors.primaryBlueAlpha(0.3)
                      }}>
              <TabsTrigger 
                value="overview" 
                className="text-white data-[state=active]:text-white data-[state=active]:bg-blue-600/40 hover:bg-blue-600/20"
              >
                Support Overview
              </TabsTrigger>
              <TabsTrigger 
                value="bug" 
                className="text-white data-[state=active]:text-white data-[state=active]:bg-blue-600/40 hover:bg-blue-600/20"
              >
                Report Bug
              </TabsTrigger>
              <TabsTrigger 
                value="account" 
                className="text-white data-[state=active]:text-white data-[state=active]:bg-blue-600/40 hover:bg-blue-600/20"
              >
                Account Issues
              </TabsTrigger>
              <TabsTrigger 
                value="technical" 
                className="text-white data-[state=active]:text-white data-[state=active]:bg-blue-600/40 hover:bg-blue-600/20"
              >
                Technical Problems
              </TabsTrigger>
              <TabsTrigger 
                value="contact" 
                className="text-white data-[state=active]:text-white data-[state=active]:bg-blue-600/40 hover:bg-blue-600/20"
              >
                Contact Support
              </TabsTrigger>
            </TabsList>

            {/* Support Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Report a Bug */}
                <div 
                  className="backdrop-blur-lg text-white border rounded-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out"
                  style={{ 
                    background: logoColors.yellowOrangeGradient,
                    borderColor: logoColors.primaryBlueAlpha(0.2)
                  }}
                  onClick={() => setActiveTab('bug')}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Bug className="h-6 w-6" style={{ color: logoColors.black }} />
                      <h3 className="font-semibold text-lg text-black">Report a Bug</h3>
                    </div>
                    <p className="text-black font-medium text-sm">
                      Found a problem? Help us fix it by reporting bugs and issues.
                    </p>
                  </div>
                </div>

                {/* Account Issues */}
                <div 
                  className="backdrop-blur-lg text-white border rounded-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out"
                  style={{ 
                    background: logoColors.yellowOrangeGradient,
                    borderColor: logoColors.primaryBlueAlpha(0.2)
                  }}
                  onClick={() => setActiveTab('account')}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <User className="h-6 w-6" style={{ color: logoColors.black }} />
                      <h3 className="font-semibold text-lg text-black">Account Issues</h3>
                    </div>
                    <p className="text-black font-medium text-sm">
                      Problems with login, profile, or account settings.
                    </p>
                  </div>
                </div>

                {/* Technical Problems */}
                <div 
                  className="backdrop-blur-lg text-white border rounded-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out"
                  style={{ 
                    background: logoColors.yellowOrangeGradient,
                    borderColor: logoColors.primaryBlueAlpha(0.2)
                  }}
                  onClick={() => setActiveTab('technical')}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Settings className="h-6 w-6" style={{ color: logoColors.black }} />
                      <h3 className="font-semibold text-lg text-black">Technical Problems</h3>
                    </div>
                    <p className="text-black font-medium text-sm">
                      Performance issues, loading problems, or browser compatibility.
                    </p>
                  </div>
                </div>
              </div>

              {/* Known Issues */}
              <Card className="backdrop-blur-lg text-white border-0"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                    Known Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border border-yellow-500/20" 
                       style={{ backgroundColor: logoColors.blackAlpha(0.2) }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-400" />
                        <span className="font-medium">Team Formation Not Saving</span>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Investigating
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">Some users report formations reset after browser refresh</p>
                    <p className="text-xs text-blue-300"><strong>Workaround:</strong> Use explicit save button before closing browser</p>
                  </div>

                  <div className="p-4 rounded-lg border border-green-500/20" 
                       style={{ backgroundColor: logoColors.blackAlpha(0.2) }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="font-medium">Constellation Pulls Loading Slowly</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Fixed
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">Fixed in latest update - clear browser cache if still experiencing issues</p>
                    <p className="text-xs text-blue-300"><strong>Workaround:</strong> Refresh page if pull takes more than 10 seconds</p>
                  </div>

                  <div className="p-4 rounded-lg border border-orange-500/20" 
                       style={{ backgroundColor: logoColors.blackAlpha(0.2) }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-400" />
                        <span className="font-medium">Equipment Stats Not Displaying</span>
                      </div>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        Monitoring
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">Rare cases where equipment bonuses don't show in team stats</p>
                    <p className="text-xs text-blue-300"><strong>Workaround:</strong> Re-equip items or refresh the Team Builder page</p>
                  </div>
                </CardContent>
              </Card>

              {/* Get in Touch */}
              <Card className="backdrop-blur-lg text-white border-0"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                    Get in Touch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                      <div>
                        <h4 className="font-medium">Email Support</h4>
                        <p className="text-sm text-gray-300">support@inazuma-eleven.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5" style={{ color: logoColors.secondaryBlue }} />
                      <div>
                        <h4 className="font-medium">Response Time</h4>
                        <p className="text-sm text-gray-300">Usually within 24 hours</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Report Bug Tab */}
            <TabsContent value="bug" className="space-y-6">
              <Card className="backdrop-blur-lg text-white border-0"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5" style={{ color: '#FF8C00' }} />
                    Report a Bug
                  </CardTitle>
                  <p className="text-gray-300">Help us improve by reporting bugs and issues you encounter.</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBugSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Bug Title</label>
                      <Input
                        value={bugFormData.title}
                        onChange={(e) => setBugFormData({ ...bugFormData, title: e.target.value })}
                        className="bg-black/20 border-gray-600 text-white focus:ring-0 focus:outline-none"
                        placeholder="Brief description of the bug"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <Select value={bugFormData.category} onValueChange={(value) => setBugFormData({ ...bugFormData, category: value })}>
                          <SelectTrigger className="text-white border"
                                        style={{ 
                                          backgroundColor: logoColors.blackAlpha(0.5),
                                          borderColor: logoColors.primaryBlueAlpha(0.3)
                                        }}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent style={{ 
                            backgroundColor: logoColors.blackAlpha(0.9),
                            borderColor: logoColors.primaryBlueAlpha(0.3)
                          }}>
                            <SelectItem 
                              value="Gameplay Issues" 
                              className="text-white hover:opacity-80 focus:bg-transparent data-[highlighted]:bg-transparent"
                              style={{ 
                                backgroundColor: logoColors.primaryBlueAlpha(0.1),
                                color: 'white'
                              }}>
                              Gameplay Issues
                            </SelectItem>
                            <SelectItem 
                              value="UI/UX Problems" 
                              className="text-white hover:opacity-80 focus:bg-transparent data-[highlighted]:bg-transparent"
                              style={{ 
                                backgroundColor: logoColors.primaryBlueAlpha(0.1),
                                color: 'white'
                              }}>
                              UI/UX Problems
                            </SelectItem>
                            <SelectItem 
                              value="Performance" 
                              className="text-white hover:opacity-80 focus:bg-transparent data-[highlighted]:bg-transparent"
                              style={{ 
                                backgroundColor: logoColors.primaryBlueAlpha(0.1),
                                color: 'white'
                              }}>
                              Performance
                            </SelectItem>
                            <SelectItem 
                              value="Data Loss" 
                              className="text-white hover:opacity-80 focus:bg-transparent data-[highlighted]:bg-transparent"
                              style={{ 
                                backgroundColor: logoColors.primaryBlueAlpha(0.1),
                                color: 'white'
                              }}>
                              Data Loss
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Priority</label>
                        <Select value={bugFormData.priority} onValueChange={(value) => setBugFormData({ ...bugFormData, priority: value })}>
                          <SelectTrigger className="text-white border"
                                        style={{ 
                                          backgroundColor: logoColors.blackAlpha(0.5),
                                          borderColor: logoColors.primaryBlueAlpha(0.3)
                                        }}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent style={{ 
                            backgroundColor: logoColors.blackAlpha(0.9),
                            borderColor: logoColors.primaryBlueAlpha(0.3)
                          }}>
                            <SelectItem 
                              value="Low" 
                              className="text-white hover:opacity-80 focus:bg-transparent data-[highlighted]:bg-transparent"
                              style={{ 
                                backgroundColor: logoColors.primaryBlueAlpha(0.1),
                                color: 'white'
                              }}>
                              Low
                            </SelectItem>
                            <SelectItem 
                              value="Medium" 
                              className="text-white hover:opacity-80 focus:bg-transparent data-[highlighted]:bg-transparent"
                              style={{ 
                                backgroundColor: logoColors.primaryBlueAlpha(0.1),
                                color: 'white'
                              }}>
                              Medium
                            </SelectItem>
                            <SelectItem 
                              value="High" 
                              className="text-white hover:opacity-80 focus:bg-transparent data-[highlighted]:bg-transparent"
                              style={{ 
                                backgroundColor: logoColors.primaryBlueAlpha(0.1),
                                color: 'white'
                              }}>
                              High
                            </SelectItem>
                            <SelectItem 
                              value="Critical" 
                              className="text-white hover:opacity-80 focus:bg-transparent data-[highlighted]:bg-transparent"
                              style={{ 
                                backgroundColor: logoColors.primaryBlueAlpha(0.1),
                                color: 'white'
                              }}>
                              Critical
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        value={bugFormData.description}
                        onChange={(e) => setBugFormData({ ...bugFormData, description: e.target.value })}
                        className="bg-black/20 border-gray-600 text-white min-h-[120px]"
                        placeholder="Detailed description of the bug, steps to reproduce, expected vs actual behavior..."
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="reproducible"
                        checked={bugFormData.reproducible}
                        onChange={(e) => setBugFormData({ ...bugFormData, reproducible: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="reproducible" className="text-sm">This bug is reproducible</label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full text-black hover:opacity-80"
                      style={{ background: logoColors.yellowOrangeGradient }}
                    >
                      <Bug className="h-4 w-4 mr-2" />
                      Submit Bug Report
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Issues Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card className="backdrop-blur-lg text-white border-0"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                    Account Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Can't Login */}
                  <div>
                    <h3 className="font-semibold mb-3">Can't Login?</h3>
                    <p className="text-gray-300 mb-3">Try these steps:</p>
                    <UnorderedList>
                      <ListItem>Check your username and password spelling</ListItem>
                      <ListItem>Clear browser cache and cookies</ListItem>
                      <ListItem>Try a different browser or incognito mode</ListItem>
                      <ListItem>Check if Caps Lock is on</ListItem>
                    </UnorderedList>
                  </div>

                  {/* Profile Issues */}
                  <div>
                    <h3 className="font-semibold mb-3">Profile Issues</h3>
                    <p className="text-gray-300 mb-3">Common profile problems:</p>
                    <UnorderedList>
                      <ListItem>Profile picture not updating - try refreshing the page</ListItem>
                      <ListItem>Stats not saving - ensure you click Save after changes</ListItem>
                      <ListItem>Teams not showing - check if they're set to public</ListItem>
                    </UnorderedList>
                  </div>

                  {/* Account Security */}
                  <div>
                    <h3 className="font-semibold mb-3">Account Security</h3>
                    <p className="text-gray-300 mb-3">Keep your account safe:</p>
                    <UnorderedList>
                      <ListItem>Use a strong, unique password</ListItem>
                      <ListItem>Don't share your login details</ListItem>
                      <ListItem>Log out when using shared computers</ListItem>
                      <ListItem>Contact support immediately if you suspect unauthorized access</ListItem>
                    </UnorderedList>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technical Problems Tab */}
            <TabsContent value="technical" className="space-y-6">
              <Card className="backdrop-blur-lg text-white border-0"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                    Technical Troubleshooting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Performance Issues */}
                  <div>
                    <h3 className="font-semibold mb-3">Performance Issues</h3>
                    <p className="text-gray-300 mb-3">If the game runs slowly:</p>
                    <UnorderedList>
                      <ListItem>Close other browser tabs and applications</ListItem>
                      <ListItem>Clear browser cache (Ctrl+Shift+Delete)</ListItem>
                      <ListItem>Update your browser to the latest version</ListItem>
                      <ListItem>Check your internet connection speed</ListItem>
                      <ListItem>Disable browser extensions temporarily</ListItem>
                    </UnorderedList>
                  </div>

                  {/* Loading Problems */}
                  <div>
                    <h3 className="font-semibold mb-3">Loading Problems</h3>
                    <p className="text-gray-300 mb-3">If pages won't load:</p>
                    <UnorderedList>
                      <li>• Refresh the page (F5 or Ctrl+R)</li>
                      <li>• Hard refresh (Ctrl+F5)</li>
                      <li>• Check your firewall/antivirus settings</li>
                      <li>• Try a different DNS server (8.8.8.8 or 1.1.1.1)</li>
                      <li>• Restart your router</li>
                    </UnorderedList>
                  </div>

                  {/* Browser Compatibility */}
                  <div>
                    <h3 className="font-semibold mb-3">Browser Compatibility</h3>
                    <p className="text-gray-300 mb-3">Supported browsers:</p>
                    <UnorderedList>
                      <li>• Chrome 90+ (Recommended)</li>
                      <li>• Firefox 88+</li>
                      <li>• Safari 14+</li>
                      <li>• Edge 90+</li>
                    </UnorderedList>
                    <p className="text-sm text-yellow-300 mt-3">Note: Internet Explorer is not supported.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Support Tab */}
            <TabsContent value="contact" className="space-y-6">
              <Card className="backdrop-blur-lg text-white border-0"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                    Contact Support
                  </CardTitle>
                  <p className="text-gray-300">Can't find what you're looking for? Send us a message.</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <Input
                          value={contactFormData.name}
                          onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                          className="bg-black/20 border-gray-600 text-white focus:ring-0 focus:outline-none"
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input
                          type="email"
                          value={contactFormData.email}
                          onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                          className="bg-black/20 border-gray-600 text-white focus:ring-0 focus:outline-none"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <Select value={contactFormData.category} onValueChange={(value) => setContactFormData({ ...contactFormData, category: value })}>
                        <SelectTrigger className="text-white border"
                                      style={{ 
                                        backgroundColor: logoColors.blackAlpha(0.5),
                                        borderColor: logoColors.primaryBlueAlpha(0.3)
                                      }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent style={{ 
                          backgroundColor: logoColors.blackAlpha(0.9),
                          borderColor: logoColors.primaryBlueAlpha(0.3)
                        }}>
                          <SelectItem 
                            value="General Question" 
                            className="text-white hover:opacity-80 focus:bg-transparent data-[highlighted]:bg-transparent"
                            style={{ 
                              backgroundColor: logoColors.primaryBlueAlpha(0.1),
                              color: 'white'
                            }}>
                            General Question
                          </SelectItem>
                          <SelectItem 
                            value="Technical Issue" 
                            className="text-white hover:opacity-80 focus:bg-transparent data-[highlighted]:bg-transparent"
                            style={{ 
                              backgroundColor: logoColors.primaryBlueAlpha(0.1),
                              color: 'white'
                            }}>
                            Technical Issue
                          </SelectItem>
                          <SelectItem 
                            value="Account Problem" 
                            className="text-white hover:opacity-80 focus:bg-transparent data-[highlighted]:bg-transparent"
                            style={{ 
                              backgroundColor: logoColors.primaryBlueAlpha(0.1),
                              color: 'white'
                            }}>
                            Account Problem
                          </SelectItem>
                          <SelectItem 
                            value="Feature Request" 
                            className="text-white hover:opacity-80 focus:bg-transparent data-[highlighted]:bg-transparent"
                            style={{ 
                              backgroundColor: logoColors.primaryBlueAlpha(0.1),
                              color: 'white'
                            }}>
                            Feature Request
                          </SelectItem>
                          <SelectItem 
                            value="Bug Report" 
                            className="text-white hover:opacity-80 focus:bg-transparent data-[highlighted]:bg-transparent"
                            style={{ 
                              backgroundColor: logoColors.primaryBlueAlpha(0.1),
                              color: 'white'
                            }}>
                            Bug Report
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <Input
                        value={contactFormData.subject}
                        onChange={(e) => setContactFormData({ ...contactFormData, subject: e.target.value })}
                        className="bg-black/20 border-gray-600 text-white focus:ring-0 focus:outline-none"
                        placeholder="Brief subject line"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Message</label>
                      <Textarea
                        value={contactFormData.message}
                        onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                        className="bg-black/20 border-gray-600 text-white min-h-[120px]"
                        placeholder="Please describe your issue or question in detail..."
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full text-black hover:opacity-80"
                      style={{ background: logoColors.yellowOrangeGradient }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;