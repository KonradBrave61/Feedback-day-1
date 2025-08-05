import React, { useState, useEffect } from 'react';
import { X, Users, Search, Download, ExternalLink, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { logoColors } from '../styles/colors';

const LoadTeamModal = ({ isOpen, onClose, onLoadTeam }) => {
  const { user, loadSaveSlots, loadCommunityTeams, loadTeamDetails, loadPublicTeamDetails } = useAuth();
  const [activeTab, setActiveTab] = useState('saved');
  const [savedTeams, setSavedTeams] = useState([]);
  const [communityTeams, setCommunityTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamUrl, setTeamUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSavedTeams();
      fetchCommunityTeams();
    }
  }, [isOpen]);

  const fetchSavedTeams = async () => {
    setLoading(true);
    try {
      const result = await loadSaveSlots();
      if (result.success) {
        // Filter out empty slots and get team data
        const teamsWithData = result.saveSlots.filter(slot => slot.team_data && slot.slot_name);
        setSavedTeams(teamsWithData);
      }
    } catch (error) {
      toast.error('Failed to load saved teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityTeams = async () => {
    setLoading(true);
    try {
      const result = await loadCommunityTeams({ 
        search: searchQuery,
        limit: 20 
      });
      if (result.success) {
        setCommunityTeams(result.teams);
      }
    } catch (error) {
      toast.error('Failed to load community teams');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCommunity = async () => {
    await fetchCommunityTeams();
  };

  const handleLoadSavedTeam = async (slot) => {
    try {
      if (slot.team_data) {
        onLoadTeam(slot.team_data);
        toast.success(`Loaded team: ${slot.slot_name}`);
        onClose();
      }
    } catch (error) {
      toast.error('Failed to load saved team');
    }
  };

  const handleLoadCommunityTeam = async (team) => {
    try {
      const result = await loadTeamDetails(team.id);
      if (result.success) {
        onLoadTeam(result.team);
        toast.success(`Loaded team: ${team.name}`);
        onClose();
      } else {
        toast.error('Failed to load community team');
      }
    } catch (error) {
      toast.error('Failed to load community team');
    }
  };

  const handleLoadFromUrl = async () => {
    if (!teamUrl.trim()) {
      toast.error('Please enter a team URL');
      return;
    }

    try {
      // Extract team ID from URL if it's a full URL, otherwise treat as team ID
      let teamId = teamUrl.trim();
      if (teamUrl.includes('/team/')) {
        teamId = teamUrl.split('/team/')[1].split(/[?#]/)[0];
      }

      // Try loading as public team first (for sharing URLs), then fall back to authenticated
      let result = await loadPublicTeamDetails(teamId);
      if (!result.success && user) {
        result = await loadTeamDetails(teamId);
      }
      
      if (result.success) {
        onLoadTeam(result.team);
        toast.success(`Loaded team from URL: ${result.team.name}`);
        onClose();
      } else {
        toast.error('Team not found or not accessible');
      }
    } catch (error) {
      toast.error('Invalid team URL or ID');
    }
  };

  const copyTeamUrl = (team) => {
    const url = `${window.location.origin}/team/${team.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Team URL copied to clipboard!');
  };

  const renderSavedTeams = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 rounded-full mx-auto animate-spin border-4 border-t-transparent" 
               style={{ borderColor: logoColors.primaryBlue, borderTopColor: 'transparent' }} />
          <p className="text-gray-300 ml-3">Loading saved teams...</p>
        </div>
      ) : savedTeams.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
          {savedTeams.map((slot) => (
            <Card key={slot.slot_number} className="backdrop-blur-lg text-white border hover:opacity-80 cursor-pointer" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{slot.slot_name}</h3>
                    <p className="text-sm text-gray-300 mb-2">
                      Formation: {slot.team_data?.formation || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Slot {slot.slot_number} • Saved {new Date(slot.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleLoadSavedTeam(slot)}
                    className="text-black font-bold hover:opacity-80"
                    style={{ background: logoColors.yellowOrangeGradient }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Load
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto mb-4" style={{ color: logoColors.primaryBlue }} />
          <h3 className="text-lg font-bold text-white mb-2">No Saved Teams</h3>
          <p className="text-gray-300">Create and save teams in the Team Builder to see them here.</p>
        </div>
      )}
    </div>
  );

  const renderCommunityTeams = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search community teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearchCommunity()}
          className="text-white border"
          style={{ 
            backgroundColor: logoColors.blackAlpha(0.5),
            borderColor: logoColors.primaryBlueAlpha(0.3)
          }}
        />
        <Button
          onClick={handleSearchCommunity}
          className="text-white"
          style={{ backgroundColor: logoColors.primaryBlueAlpha(0.4) }}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 rounded-full mx-auto animate-spin border-4 border-t-transparent" 
               style={{ borderColor: logoColors.primaryBlue, borderTopColor: 'transparent' }} />
          <p className="text-gray-300 ml-3">Loading community teams...</p>
        </div>
      ) : communityTeams.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
          {communityTeams.map((team) => (
            <Card key={team.id} className="backdrop-blur-lg text-white border hover:opacity-80" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{team.name}</h3>
                    <p className="text-sm text-gray-300 mb-1">
                      by {team.author_username || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-300 mb-2">
                      Formation: {team.formation || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>❤️ {team.likes || 0}</span>
                      <span>👁️ {team.views || 0}</span>
                      <Badge className="text-xs" style={{ 
                        backgroundColor: logoColors.primaryBlueAlpha(0.2),
                        color: logoColors.white
                      }}>
                        Public
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleLoadCommunityTeam(team)}
                      className="text-black font-bold hover:opacity-80"
                      style={{ background: logoColors.yellowOrangeGradient }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Load
                    </Button>
                    <Button
                      onClick={() => copyTeamUrl(team)}
                      size="sm"
                      className="text-white"
                      style={{ backgroundColor: logoColors.primaryBlueAlpha(0.4) }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Search className="h-12 w-12 mx-auto mb-4" style={{ color: logoColors.primaryBlue }} />
          <h3 className="text-lg font-bold text-white mb-2">No Teams Found</h3>
          <p className="text-gray-300">Try different search terms or browse all teams.</p>
        </div>
      )}
    </div>
  );

  const renderUrlImport = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <ExternalLink className="h-12 w-12 mx-auto mb-4" style={{ color: logoColors.primaryBlue }} />
        <h3 className="text-lg font-bold text-white mb-2">Import Team from URL</h3>
        <p className="text-gray-300 text-sm">
          Enter a team sharing URL or team ID to load someone's team
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-white mb-2 block">Team URL or ID</label>
          <Input
            placeholder="https://example.com/team/12345 or just 12345"
            value={teamUrl}
            onChange={(e) => setTeamUrl(e.target.value)}
            className="text-white border"
            style={{ 
              backgroundColor: logoColors.blackAlpha(0.5),
              borderColor: logoColors.primaryBlueAlpha(0.3)
            }}
          />
        </div>
        
        <Button
          onClick={handleLoadFromUrl}
          disabled={!teamUrl.trim()}
          className="w-full text-black font-bold hover:opacity-80 disabled:opacity-50"
          style={{ background: logoColors.yellowOrangeGradient }}
        >
          <Download className="h-4 w-4 mr-2" />
          Load Team from URL
        </Button>

        <div className="mt-6 p-4 rounded border" style={{ 
          backgroundColor: logoColors.blackAlpha(0.3),
          borderColor: logoColors.primaryBlueAlpha(0.2)
        }}>
          <h4 className="text-sm font-bold text-white mb-2">How to get team URLs:</h4>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Browse teams in the Community Hub</li>
            <li>• Click the copy button (📋) on any team card</li>
            <li>• Share the URL with friends</li>
            <li>• Use the team ID from the URL</li>
          </ul>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg border" style={{ 
        backgroundColor: logoColors.blackAlpha(0.9),
        borderColor: logoColors.primaryBlueAlpha(0.3)
      }}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b" style={{ 
          borderColor: logoColors.primaryBlueAlpha(0.2)
        }}>
          <div>
            <h2 className="text-2xl font-bold text-white">Load Team</h2>
            <p className="text-sm text-gray-300">Choose a team to load into Team Builder</p>
          </div>
          <Button
            onClick={onClose}
            className="text-white hover:opacity-80"
            style={{ backgroundColor: logoColors.blackAlpha(0.5) }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3)
            }}>
              <TabsTrigger value="saved" className="text-white" style={{ 
                backgroundColor: activeTab === 'saved' ? logoColors.primaryBlueAlpha(0.4) : 'transparent'
              }}>
                My Saved Teams
              </TabsTrigger>
              <TabsTrigger value="community" className="text-white" style={{ 
                backgroundColor: activeTab === 'community' ? logoColors.primaryBlueAlpha(0.4) : 'transparent'
              }}>
                Community Teams
              </TabsTrigger>
              <TabsTrigger value="url" className="text-white" style={{ 
                backgroundColor: activeTab === 'url' ? logoColors.primaryBlueAlpha(0.4) : 'transparent'
              }}>
                Import from URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="mt-0">
              {renderSavedTeams()}
            </TabsContent>

            <TabsContent value="community" className="mt-0">
              {renderCommunityTeams()}
            </TabsContent>

            <TabsContent value="url" className="mt-0">
              {renderUrlImport()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LoadTeamModal;