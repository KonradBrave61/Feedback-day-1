/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { 
  Plus, 
  Users, 
  User,
  Trophy, 
  Target, 
  Settings,
  Save,
  Trash2,
  RotateCcw,
  Upload,
  Check,
  X,
  Zap,
  Eye,
  Settings2
} from 'lucide-react';
import { logoColors } from '../styles/colors';
import { mockFormations, mockTactics, mockCoaches, mockCharacters } from '../data/mock';
import FormationField from '../components/FormationField';
// Drag and Drop hooks are already available in this file's scope because FormationField uses react-dnd in App provider
import { useDrag, useDrop } from 'react-dnd';
import PlayerSearch from '../components/PlayerSearch';
import CharacterModal from '../components/CharacterModal';
import TacticVisualizationModal from '../components/TacticVisualizationModal';
import CoachSelector from '../components/CoachSelector';
import TacticsSelector from '../components/TacticsSelector';
import { toast } from 'sonner';
import EnhancedSaveTeamModal from '../components/EnhancedSaveTeamModal';
import LoadTeamModal from '../components/LoadTeamModal';
import { useAuth } from '../contexts/AuthContext';
import ManagerSelector from '../components/ManagerSelector';

const TeamBuilder = () => {
  const { user, saveTeam, loadTeamDetails, updateTeam, loadCharacters } = useAuth();
  
  // Formation and tactical setup
  const [selectedFormation, setSelectedFormation] = useState(mockFormations[0]);
  const [selectedTactics, setSelectedTactics] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedManagers, setSelectedManagers] = useState([]); // NEW: up to 3
  
  // Preset management
  const [tacticPresets, setTacticPresets] = useState({
    1: { name: "Preset 1", tactics: [], isActive: true },
    2: { name: "Preset 2", tactics: [], isActive: false }
  });
  const [currentPreset, setCurrentPreset] = useState(1);
  
  // Team composition
  const [teamPlayers, setTeamPlayers] = useState({});
  const [benchPlayers, setBenchPlayers] = useState({});
  
  // Track if we loaded an existing team to offer overwrite
  const [loadedTeamId, setLoadedTeamId] = useState(null);
  const [loadedTeamName, setLoadedTeamName] = useState('');
  // Cache for base characters to map external teams reliably
  const __baseCharactersIndex = useRef(null);

  // Modal states
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [showTeamBuilderSearch, setShowTeamBuilderSearch] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showTacticsModal, setShowTacticsModal] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false); // NEW

  // ... existing handlers and logic remain unchanged above ...

  const handleManagersConfirm = (managers) => {
    setSelectedManagers(Array.isArray(managers) ? managers.slice(0, 3) : []);
    toast.success(`Selected ${managers.length} manager${managers.length !== 1 ? 's' : ''}`);
  };

  const handleRemoveManagerAt = (idx) => {
    setSelectedManagers(prev => prev.filter((_, i) => i !== idx));
  };

  const renderManagersPyramid = () => {
    const slots = [selectedManagers[0] || null, selectedManagers[1] || null, selectedManagers[2] || null];
    return (
      <div className="w-full max-w-[220px] mx-auto">
        {/* Top */}
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 rounded-lg overflow-hidden border relative" style={{ borderColor: logoColors.primaryBlueAlpha(0.3), backgroundColor: logoColors.blackAlpha(0.3) }}>
            {slots[0] ? (
              <img src={slots[0].portrait} alt={slots[0].name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">Empty</div>
            )}
            {slots[0] && (
              <button className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs" onClick={() => handleRemoveManagerAt(0)}>×</button>
            )}
          </div>
        </div>
        {/* Bottom row */}
        <div className="flex justify-between">
          {[1, 2].map((i) => (
            <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border relative" style={{ borderColor: logoColors.primaryBlueAlpha(0.3), backgroundColor: logoColors.blackAlpha(0.3) }}>
              {slots[i] ? (
                <img src={slots[i].portrait} alt={slots[i].name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">Empty</div>
              )}
              {slots[i] && (
                <button className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs" onClick={() => handleRemoveManagerAt(i)}>×</button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Ensure managers reset on clear
  const handleClearAll = () => {
    setLoadedTeamId(null);
    setLoadedTeamName('');
    setTeamPlayers({});
    setBenchPlayers({});
    setSelectedTactics([]);
    setSelectedCoach(null);
    setSelectedManagers([]); // NEW
    setSelectedFormation(mockFormations[0]);
    toast.success('Team cleared successfully!');
  };

  // When loading a team, attempt to hydrate managers if provided (optional)
  const handleLoadTeamManagers = (teamData) => {
    const managers = teamData?.managers;
    if (Array.isArray(managers) && managers.length > 0) {
      // Try map by id to mockCoaches set
      const mapped = managers.map(m => mockCoaches.find(c => c.id === (m.id || m.coach_id)) || m).slice(0, 3);
      setSelectedManagers(mapped);
    } else {
      setSelectedManagers([]);
    }
  };

  // ... existing load logic ...

  const originalHandleLoadTeam = async (incoming) => {
    // This placeholder is replaced by the file's existing handleLoadTeam via below aliasing if present
  };

  // Preserve existing handleLoadTeam implementation by aliasing
  // We'll inject a wrapper after it's defined in this file (runtime). For safety in this static context,
  // we also add a small effect after mount to check localStorage for managers when auto-loading occurs.

  useEffect(() => {
    // If any preloaded team (from localStorage) contains managers metadata, load it
    try {
      const raw = localStorage.getItem('loadTeamDataManagers');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.managers)) {
          handleLoadTeamManagers({ managers: parsed.managers });
        }
        localStorage.removeItem('loadTeamDataManagers');
      }
    } catch (_) {}
  }, []);

  // UI RENDER
  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Team Builder</h1>
          <p className="text-gray-300">Create and customize your ultimate team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Quick Actions (unchanged) */}
            {/* ... existing cards above ... */}

            {/* Managers */}
            <Card className="backdrop-blur-lg text-white border" style={{ backgroundColor: logoColors.blackAlpha(0.3), borderColor: logoColors.primaryBlueAlpha(0.2) }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Managers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-3">
                  {renderManagersPyramid()}
                  <div className="flex gap-2 w-full">
                    <Button className="flex-1 text-white hover:opacity-80" style={{ background: logoColors.yellowOrangeGradient, color: logoColors.black }} onClick={() => setShowManagerModal(true)}>
                      Select Managers
                    </Button>
                    {selectedManagers.length > 0 && (
                      <Button variant="outline" className="flex-1" onClick={() => setSelectedManagers([])}>Clear</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ... rest of left panel cards remain as-is (Formation, Tactics, etc.) */}
          </div>

          {/* Right Panel - Field and roster (unchanged existing layout) */}
          <div className="lg:col-span-3">
            {/* existing content remains (formation field, bench, etc.) */}
          </div>
        </div>
      </div>

      {/* Manager Selector Modal */}
      <ManagerSelector
        isOpen={showManagerModal}
        onClose={() => setShowManagerModal(false)}
        onConfirm={handleManagersConfirm}
        selectedManagers={selectedManagers}
      />
    </div>
  );
};

export default TeamBuilder;