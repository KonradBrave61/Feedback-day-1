import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { logoColors } from '../styles/colors';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Download, Globe, Save, Search, Users, X } from 'lucide-react';
import { UnorderedList, ListItem } from './ui/list';

const LoadTeamModal = ({ isOpen, onClose, onLoadTeam }) => {
  const { loadCommunityTeams, loadTeamDetails, loadTeams } = useAuth();
  const [activeTab, setActiveTab] = useState('mine');
  const [isLoading, setIsLoading] = useState(false);
  const [myTeams, setMyTeams] = useState([]);
  const [communityTeams, setCommunityTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamUrl, setTeamUrl] = useState('');

  // Load user's own teams when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const fetchMyTeams = async () => {
      try {
        setIsLoading(true);
        const res = await loadTeams();
        if (res?.success) {
          setMyTeams(res.teams || []);
        } else {
          setMyTeams([]);
        }
      } catch (e) {
        console.error('Failed to load my teams', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyTeams();
  }, [isOpen, loadTeams]);

  const handleLoadMyTeam = async (team) => {
    if (!team?.id) return;
    try {
      setIsLoading(true);
      const teamWrap = await loadTeamDetails(team.id);
      const fullTeam = teamWrap?.team || teamWrap; // backend may return { team: {...} }
      if (!fullTeam) throw new Error('Invalid team data');
      onLoadTeam(fullTeam);
      toast.success(`Loaded team: ${fullTeam.name || team.name}`);
      onClose();
    } catch (e) {
      console.error('Failed to load team', e);
      toast.error('Failed to load team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromUrl = async () => {
    try {
      const id = (teamUrl || '').trim().split('/').filter(Boolean).pop();
      if (!id) return;
      setIsLoading(true);
      const teamWrap = await loadTeamDetails(id);
      const team = teamWrap?.team || teamWrap;
      if (!team) throw new Error('Invalid team data');
      onLoadTeam(team);
      toast.success(`Loaded team from URL: ${team.name || id}`);
      onClose();
    } catch (e) {
      console.error('Failed to load team from URL', e);
      toast.error('Failed to load team from URL');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCommunity = useMemo(() => {
    if (!searchQuery) return communityTeams;
    return communityTeams.filter((t) => (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  }, [communityTeams, searchQuery]);

  useEffect(() => {
    if (activeTab !== 'community' || !isOpen) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await loadCommunityTeams({ limit: 20 });
        setCommunityTeams(res?.teams || res || []);
      } catch (e) {
        console.error('Failed to load community teams', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeTab, isOpen, loadCommunityTeams]);

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
              <TabsTrigger value="mine" className="text-white" style={{
                backgroundColor: activeTab === 'mine' ? logoColors.primaryBlueAlpha(0.4) : 'transparent'
              }}>
                My Teams
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

            {/* My Teams */}
            <TabsContent value="mine">
              <div className="grid md:grid-cols-2 gap-4">
                {isLoading ? (
                  <p className="text-gray-300">Loading...</p>
                ) : myTeams.length === 0 ? (
                  <Card className="p-6 text-gray-300" style={{ backgroundColor: logoColors.blackAlpha(0.2) }}>
                    No teams found. Save a team first from Team Builder.
                  </Card>
                ) : (
                  myTeams.map((team) => (
                    <Card key={team.id} className="p-4 border" style={{ borderColor: logoColors.primaryBlueAlpha(0.2), backgroundColor: logoColors.blackAlpha(0.2) }}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-white font-semibold">{team.name || 'Saved Team'}</h4>
                          <p className="text-xs text-gray-400">Formation: {team.formation || '—'}</p>
                        </div>
                        <Button onClick={() => handleLoadMyTeam(team)} className="text-black hover:opacity-80" style={{ background: logoColors.yellowOrangeGradient }}>
                          <Save className="h-4 w-4 mr-2" /> Apply
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1"><Users className="h-3 w-3" />{team.likes || 0} likes</div>
                        <div>•</div>
                        <div>{team.views || 0} views</div>
                        {team.is_public === false && (
                          <div>• Private</div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Community */}
            <TabsContent value="community">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search community teams..."
                  className="bg-black/20 border-gray-600 text-white"
                  style={{ backgroundColor: logoColors.blackAlpha(0.3), borderColor: logoColors.primaryBlueAlpha(0.3) }}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {filteredCommunity.map((t) => (
                  <Card key={t.id} className="p-4 border" style={{ borderColor: logoColors.primaryBlueAlpha(0.2), backgroundColor: logoColors.blackAlpha(0.2) }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-semibold">{t.name}</h4>
                        <p className="text-xs text-gray-400">By {t.user?.username || t.username || 'Unknown'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-400">{t.likes || 0} likes</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* URL */}
            <TabsContent value="url">
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
                  <UnorderedList className="text-xs space-y-1">
                    <ListItem>Browse teams in the Community Hub</ListItem>
                    <ListItem>Click the copy button (📋) on any team card</ListItem>
                    <ListItem>Share the URL with friends</ListItem>
                    <ListItem>Use the team ID from the URL</ListItem>
                  </UnorderedList>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LoadTeamModal;