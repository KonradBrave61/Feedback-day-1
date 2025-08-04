import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  Headphones, 
  MessageSquare, 
  Bug, 
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Send
} from 'lucide-react';
import { logoColors } from '../styles/colors';

const SupportPage = () => {
  const [selectedTicketType, setSelectedTicketType] = useState('bug');
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    email: '',
    priority: 'medium'
  });

  const ticketTypes = [
    { id: 'bug', label: 'Bug Report', icon: Bug, color: logoColors.primaryOrange },
    { id: 'feature', label: 'Feature Request', icon: CheckCircle, color: logoColors.primaryBlue },
    { id: 'account', label: 'Account Issue', icon: User, color: logoColors.primaryYellow },
    { id: 'general', label: 'General Support', icon: Headphones, color: logoColors.secondaryBlue }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the support ticket to your backend
    alert('Support ticket submitted! We\'ll get back to you soon.');
    setFormData({ subject: '', description: '', email: '', priority: 'medium' });
  };

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Support Center</h1>
          <p className="text-gray-300 text-lg">Get technical support and assistance for Inazuma Eleven: Victory Road</p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.5),
                        borderColor: logoColors.primaryBlueAlpha(0.3)
                      }}>
              <TabsTrigger value="contact" className="text-white data-[state=active]:text-black">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </TabsTrigger>
              <TabsTrigger value="status" className="text-white data-[state=active]:text-black">
                <Clock className="h-4 w-4 mr-2" />
                System Status
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-white data-[state=active]:text-black">
                <MessageSquare className="h-4 w-4 mr-2" />
                Resources
              </TabsTrigger>
            </TabsList>

            {/* Contact Support Tab */}
            <TabsContent value="contact" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Contact Methods */}
                <div className="lg:col-span-1 space-y-4">
                  <Card className="backdrop-blur-lg text-white border"
                        style={{ 
                          backgroundColor: logoColors.blackAlpha(0.3),
                          borderColor: logoColors.primaryBlueAlpha(0.2)
                        }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                        Contact Methods
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: logoColors.blackAlpha(0.2) }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-4 w-4" style={{ color: logoColors.primaryYellow }} />
                          <span className="font-medium">Email Support</span>
                        </div>
                        <p className="text-sm text-gray-300">support@inazumaeleven.game</p>
                        <p className="text-xs text-gray-400">Response within 24 hours</p>
                      </div>
                      
                      <div className="p-3 rounded-lg" style={{ backgroundColor: logoColors.blackAlpha(0.2) }}>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4" style={{ color: logoColors.secondaryBlue }} />
                          <span className="font-medium">Live Chat</span>
                        </div>
                        <p className="text-sm text-gray-300">Available 9 AM - 6 PM PST</p>
                        <Button 
                          size="sm" 
                          className="mt-2 text-black"
                          style={{ background: logoColors.yellowOrangeGradient }}
                        >
                          Start Chat
                        </Button>
                      </div>

                      <div className="p-3 rounded-lg" style={{ backgroundColor: logoColors.blackAlpha(0.2) }}>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4" style={{ color: logoColors.primaryOrange }} />
                          <span className="font-medium">Community</span>
                        </div>
                        <p className="text-sm text-gray-300">Join our community for peer support</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="mt-2 text-white border-blue-400/30 hover:bg-blue-700/30"
                          onClick={() => window.open('/community', '_blank')}
                        >
                          Visit Forum
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Support Ticket Form */}
                <div className="lg:col-span-2">
                  <Card className="backdrop-blur-lg text-white border"
                        style={{ 
                          backgroundColor: logoColors.blackAlpha(0.3),
                          borderColor: logoColors.primaryBlueAlpha(0.2)
                        }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Headphones className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                        Submit Support Ticket
                      </CardTitle>
                      <p className="text-gray-300">Describe your issue and we'll help you resolve it</p>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Ticket Type Selection */}
                        <div>
                          <label className="block text-sm font-medium mb-3">Issue Type</label>
                          <div className="grid grid-cols-2 gap-3">
                            {ticketTypes.map((type) => {
                              const Icon = type.icon;
                              return (
                                <button
                                  key={type.id}
                                  type="button"
                                  className={`p-3 rounded-lg border transition-all flex items-center gap-2 ${
                                    selectedTicketType === type.id
                                      ? 'border-blue-400 bg-blue-400/10'
                                      : 'border-gray-600 hover:border-gray-500'
                                  }`}
                                  onClick={() => setSelectedTicketType(type.id)}
                                >
                                  <Icon className="h-4 w-4" style={{ color: type.color }} />
                                  <span className="text-sm">{type.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Email Address</label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-black/20 border-gray-600 text-white"
                            placeholder="your@email.com"
                            required
                          />
                        </div>

                        {/* Subject */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Subject</label>
                          <Input
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="bg-black/20 border-gray-600 text-white"
                            placeholder="Brief description of your issue"
                            required
                          />
                        </div>

                        {/* Priority */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Priority</label>
                          <div className="flex gap-2">
                            {['low', 'medium', 'high'].map((priority) => (
                              <button
                                key={priority}
                                type="button"
                                className={`px-3 py-1 rounded text-sm capitalize ${
                                  formData.priority === priority
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                                onClick={() => setFormData({ ...formData, priority })}
                              >
                                {priority}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="bg-black/20 border-gray-600 text-white min-h-[120px]"
                            placeholder="Please provide detailed information about your issue..."
                            required
                          />
                        </div>

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          className="w-full text-black hover:opacity-80"
                          style={{ background: logoColors.yellowOrangeGradient }}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit Ticket
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* System Status Tab */}
            <TabsContent value="status" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="backdrop-blur-lg text-white border"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" style={{ color: '#10B981' }} />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Game Servers</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Database</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Authentication</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Constellation System</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Operational
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-lg text-white border"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                      Recent Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="border-l-2 border-blue-400 pl-3">
                      <p className="text-sm font-medium">System Maintenance Complete</p>
                      <p className="text-xs text-gray-400">2 hours ago</p>
                    </div>
                    <div className="border-l-2 border-green-400 pl-3">
                      <p className="text-sm font-medium">New Helper System Released</p>
                      <p className="text-xs text-gray-400">Today</p>
                    </div>
                    <div className="border-l-2 border-yellow-400 pl-3">
                      <p className="text-sm font-medium">Team Builder Improvements</p>
                      <p className="text-xs text-gray-400">Yesterday</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="backdrop-blur-lg text-white border"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                      Documentation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-700/30">
                        Getting Started Guide
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-700/30">
                        Team Building Basics
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-700/30">
                        Character Management
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-700/30">
                        Equipment Guide
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-lg text-white border"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bug className="h-5 w-5" style={{ color: logoColors.primaryOrange }} />
                      Known Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-sm font-medium text-yellow-400">Minor UI Issues</p>
                        <p className="text-xs text-gray-400">Some display issues on mobile devices</p>
                      </div>
                      <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                        <p className="text-sm font-medium text-blue-400">Performance</p>
                        <p className="text-xs text-gray-400">Optimizing constellation animations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-lg text-white border"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" style={{ color: logoColors.secondaryBlue }} />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      className="w-full text-black"
                      style={{ background: logoColors.yellowOrangeGradient }}
                      onClick={() => window.open('/helper', '_blank')}
                    >
                      Visit Helper
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full text-white border-blue-400/30 hover:bg-blue-700/30"
                      onClick={() => window.open('/community', '_blank')}
                    >
                      Community Forum
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full text-white border-blue-400/30 hover:bg-blue-700/30"
                    >
                      Download Logs
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;