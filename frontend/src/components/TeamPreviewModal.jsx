import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, Shield, Zap, Target, Edit, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AspectRatio } from './ui/aspect-ratio';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './ui/hover-card';
import { logoColors } from '../styles/colors';
import { useAuth } from '../contexts/AuthContext';
import { mockFormations, mockCharacters, mockCoaches } from '../data/mock';
import { calculateStats } from '../data/mock';

const TeamPreviewModal = ({ isOpen, onClose, team, onPrivacyToggle }) => {
  const { loadTeamDetails } = useAuth();
  const navigate = useNavigate();
  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && team) { fetchTeamDetails(); }
  }, [isOpen, team]);

  const fetchTeamDetails = async () => {
    setLoading(true);
    try {
      if (team && team.id) {
        const result = await loadTeamDetails(team.id);
        if (result.success) {
          const teamData = result.team?.team || result.team;
          setTeamDetails(teamData);
        } else { setTeamDetails(team); }
      } else { setTeamDetails(team); }
    } catch (error) {
      console.error('Failed to load team details:', error);
      setTeamDetails(team);
    } finally { setLoading(false); }
  };

  // ... existing helpers remain ...

  const renderManagersPyramid = (managers) => {
    const arr = Array.isArray(managers) ? managers.slice(0, 3) : [];
    const slots = [arr[0] || null, arr[1] || null, arr[2] || null];
    return (
      <div className="flex flex-col items-center">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-lg overflow-hidden border" style={{ borderColor: logoColors.primaryBlueAlpha(0.3), backgroundColor: logoColors.blackAlpha(0.3) }}>
            {slots[0] ? <img src={slots[0].portrait} alt={slots[0].name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">—</div>}
          </div>
        </div>
        <div className="flex gap-6">
          {[1,2].map(i => (
            <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border" style={{ borderColor: logoColors.primaryBlueAlpha(0.3), backgroundColor: logoColors.blackAlpha(0.3) }}>
              {slots[i] ? <img src={slots[i].portrait} alt={slots[i].name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">—</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-7xl max-h-[90vh] overflow-y-auto rounded-xl border text-white" style={{ backgroundColor: logoColors.blackAlpha(0.95), borderColor: logoColors.primaryBlueAlpha(0.2) }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: logoColors.primaryBlueAlpha(0.2) }}>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
            <h2 className="text-xl font-bold">Team Preview</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
          {/* Left: Formation field etc (existing) */}
          <div className="lg:col-span-2">
            {/* existing formation field render (unchanged) */}
          </div>

          {/* Right: Team meta */}
          <div className="lg:col-span-1 space-y-4">
            {/* Coach */}
            {teamDetails?.coach && (
              <Card className="border" style={{ backgroundColor: logoColors.blackAlpha(0.25), borderColor: logoColors.primaryBlueAlpha(0.3) }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Coach</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  <img src={teamDetails.coach.portrait || (mockCoaches.find(c => c.id === teamDetails.coach.id)?.portrait)} alt={teamDetails.coach.name} className="w-12 h-12 rounded-full" />
                  <div>
                    <div className="font-medium">{teamDetails.coach.name}</div>
                    <div className="text-xs text-gray-300">{teamDetails.coach.title || 'Team Coach'}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Managers */}
            <Card className="border" style={{ backgroundColor: logoColors.blackAlpha(0.25), borderColor: logoColors.primaryBlueAlpha(0.3) }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Managers</CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(teamDetails?.managers) && teamDetails.managers.length > 0 ? (
                  renderManagersPyramid(teamDetails.managers)
                ) : (
                  <div className="text-sm text-gray-300">No managers selected</div>
                )}
              </CardContent>
            </Card>

            {/* other right side cards remain */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPreviewModal;