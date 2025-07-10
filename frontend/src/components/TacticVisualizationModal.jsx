import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { mockTactics } from '../data/mock';
import { Check, X, Shield, Sword, Zap, Target, Crown, Crosshair, Flame, Mountain } from 'lucide-react';

const TacticVisualizationModal = ({ isOpen, onClose, onTacticSelect, selectedTactics = [] }) => {
  const [selectedTactic, setSelectedTactic] = useState(mockTactics[0]);
  const [selectedTacticsList, setSelectedTacticsList] = useState(selectedTactics.slice(0, 3));
  const [previewMode, setPreviewMode] = useState(false);

  const getTacticDuration = (tacticName) => {
    switch (tacticName.toLowerCase()) {
      case 'flame fortress': return '45 seconds';
      case 'mount fuji': return '60 seconds';
      case 'sideline spears': return '30 seconds';
      case 'waxing moon': return '40 seconds';
      case 'diamond defense': return '50 seconds';
      case 'bond protocol': return '35 seconds';
      case 'bull horns': return '25 seconds';
      case 'claymore': return '20 seconds';
      case 'three-pronged attack': return '55 seconds';
      default: return '30 seconds';
    }
  };

  const getTacticIcon = (tacticName) => {
    switch (tacticName.toLowerCase()) {
      case 'flame fortress': return <Flame className="h-5 w-5" />;
      case 'mount fuji': return <Mountain className="h-5 w-5" />;
      case 'sideline spears': return <Sword className="h-5 w-5" />;
      case 'waxing moon': return <Crown className="h-5 w-5" />;
      case 'diamond defense': return <Shield className="h-5 w-5" />;
      case 'bond protocol': return <Zap className="h-5 w-5" />;
      case 'bull horns': return <Target className="h-5 w-5" />;
      case 'claymore': return <Sword className="h-5 w-5" />;
      case 'three-pronged attack': return <Crosshair className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getTacticEffectArea = (tacticName) => {
    switch (tacticName.toLowerCase()) {
      case 'flame fortress':
        return (
          <div className="absolute inset-0 flex items-end justify-center">
            <div className="w-32 h-16 bg-gradient-to-t from-orange-500/60 to-red-500/40 rounded-t-full border-2 border-orange-400/80 animate-pulse">
              <div className="text-center text-white font-bold text-xs mt-1">FLAME WALL</div>
            </div>
          </div>
        );
      case 'mount fuji':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-t from-brown-600/60 to-brown-400/40 rounded-full border-2 border-brown-500/80">
              <div className="text-center text-white font-bold text-xs mt-8">MOUNTAIN</div>
            </div>
          </div>
        );
      case 'sideline spears':
        return (
          <div className="absolute inset-0">
            <div className="absolute left-2 top-1/4 w-2 h-32 bg-gradient-to-b from-yellow-400/80 to-yellow-600/60 border border-yellow-500"></div>
            <div className="absolute right-2 top-1/4 w-2 h-32 bg-gradient-to-b from-yellow-400/80 to-yellow-600/60 border border-yellow-500"></div>
            <div className="absolute left-0 top-1/3 text-white text-xs font-bold transform -rotate-90">SPEAR</div>
            <div className="absolute right-0 top-1/3 text-white text-xs font-bold transform rotate-90">SPEAR</div>
          </div>
        );
      case 'diamond defense':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400/60 to-blue-600/40 transform rotate-45 border-2 border-blue-500/80">
              <div className="text-center text-white font-bold text-xs transform -rotate-45 mt-6">DIAMOND</div>
            </div>
          </div>
        );
      default:
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-500/40 to-red-500/40 rounded-full border-2 border-orange-400/60 animate-pulse">
              <div className="text-center text-white font-bold text-xs mt-8">EFFECT</div>
            </div>
          </div>
        );
    }
  };

  const handleTacticSelect = (tactic) => {
    setSelectedTactic(tactic);
  };

  const handleTacticToggle = (tactic) => {
    setSelectedTacticsList(prev => {
      const isSelected = prev.some(t => t.id === tactic.id);
      if (isSelected) {
        return prev.filter(t => t.id !== tactic.id);
      } else if (prev.length < 3) {
        return [...prev, tactic];
      }
      return prev;
    });
  };

  const handleConfirmSelection = () => {
    onTacticSelect(selectedTacticsList);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white border-blue-400/20 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Change Tactics
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 h-[80vh]">
          {/* Left Panel - Tactics List */}
          <div className="w-80 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white mb-2">Select Tactics ({selectedTacticsList.length}/3)</h3>
              <div className="text-sm text-gray-300">Click to preview, double-click to select/deselect</div>
            </div>
            <div className="space-y-2">
              {mockTactics.map((tactic) => {
                const isSelected = selectedTacticsList.some(t => t.id === tactic.id);
                const isPreviewing = selectedTactic.id === tactic.id;
                
                return (
                  <div
                    key={tactic.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isPreviewing
                        ? 'bg-blue-600/40 border-blue-400 shadow-lg shadow-blue-500/20'
                        : isSelected
                        ? 'bg-green-600/40 border-green-400 shadow-lg shadow-green-500/20'
                        : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-600/40 hover:border-slate-500'
                    }`}
                    onClick={() => handleTacticSelect(tactic)}
                    onDoubleClick={() => handleTacticToggle(tactic)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isPreviewing ? 'bg-blue-500' : isSelected ? 'bg-green-500' : 'bg-slate-600'
                      }`}>
                        {getTacticIcon(tactic.name)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{tactic.name}</div>
                        <div className="text-xs text-gray-300">{tactic.effect}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isPreviewing && (
                          <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                        )}
                        {isSelected && (
                          <Check className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Panel - Field Visualization */}
          <div className="flex-1 bg-gradient-to-br from-green-700/20 to-green-800/20 rounded-lg p-6 relative">
            <div className="text-center mb-4">
              <div className="text-xl font-bold text-white">{selectedTactic.name}</div>
              <div className="text-sm text-gray-300">{selectedTactic.description}</div>
            </div>

            {/* Soccer Field */}
            <div className="relative w-full h-96 bg-gradient-to-b from-green-600 to-green-700 rounded-lg border-4 border-white shadow-2xl overflow-hidden">
              {/* Field Lines */}
              <div className="absolute inset-0">
                {/* Center line */}
                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white"></div>
                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                {/* Goal areas */}
                <div className="absolute top-1/3 left-0 w-16 h-32 border-2 border-white border-l-0"></div>
                <div className="absolute top-1/3 right-0 w-16 h-32 border-2 border-white border-r-0"></div>
                {/* Penalty areas */}
                <div className="absolute top-1/4 left-0 w-24 h-48 border-2 border-white border-l-0"></div>
                <div className="absolute top-1/4 right-0 w-24 h-48 border-2 border-white border-r-0"></div>
              </div>

              {/* Tactic Effect Visualization */}
              {getTacticEffectArea(selectedTactic.name)}
            </div>
          </div>

          {/* Right Panel - Tactic Details */}
          <div className="w-80 space-y-4">
            {/* Selected Tactics Summary */}
            <Card className="bg-slate-800/50 border-slate-600/50 text-white">
              <CardContent className="p-4">
                <div className="text-lg font-bold mb-3 text-green-400">Selected Tactics ({selectedTacticsList.length}/3)</div>
                {selectedTacticsList.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTacticsList.map((tactic, index) => (
                      <div key={tactic.id} className="flex items-center justify-between p-2 bg-green-600/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{tactic.name}</span>
                        </div>
                        <button
                          onClick={() => handleTacticToggle(tactic)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No tactics selected</div>
                )}
              </CardContent>
            </Card>

            {/* Currently Previewing Tactic */}
            <Card className="bg-slate-800/50 border-slate-600/50 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    {getTacticIcon(selectedTactic.name)}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{selectedTactic.name}</div>
                    <div className="text-blue-400 text-sm">{selectedTactic.effect}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-300 mb-4">
                  {selectedTactic.description}
                </div>
              </CardContent>
            </Card>

            {/* Tactic Duration */}
            <Card className="bg-slate-800/50 border-slate-600/50 text-white">
              <CardContent className="p-4">
                <div className="text-lg font-bold mb-2 text-yellow-400">Duration</div>
                <div className="text-2xl font-bold text-white">{getTacticDuration(selectedTactic.name)}</div>
                <div className="text-sm text-gray-400 mt-2">
                  How long this tactic remains active on the field
                </div>
              </CardContent>
            </Card>

            {/* Geoglyph Effect */}
            <Card className="bg-slate-800/50 border-slate-600/50 text-white">
              <CardContent className="p-4">
                <div className="text-lg font-bold mb-2 text-blue-400">Geoglyph Effect</div>
                <div className="text-2xl font-bold text-green-400">{selectedTactic.effect}</div>
                <div className="text-sm text-gray-400 mt-2">
                  {selectedTactic.name === 'Flame Fortress' && 'Conjure a wall of blazing flame in front of the goal, temporarily doubling the potency of your defence.'}
                  {selectedTactic.name === 'Mount Fuji' && 'Immovable mountain defense that increases physical resistance.'}
                  {selectedTactic.name === 'Sideline Spears' && 'Lightning-fast spear attacks from the sidelines boost attack power.'}
                  {selectedTactic.name === 'Diamond Defense' && 'Unbreakable formation that strengthens team defense.'}
                </div>
              </CardContent>
            </Card>

            {/* Overall Effect */}
            <Card className="bg-slate-800/50 border-slate-600/50 text-white">
              <CardContent className="p-4">
                <div className="text-lg font-bold mb-2 text-blue-400">Overall Effect</div>
                <div className="text-lg font-bold text-orange-400">
                  {selectedTactic.name === 'Flame Fortress' && 'KP increase by 10%'}
                  {selectedTactic.name === 'Mount Fuji' && 'Physical +15%'}
                  {selectedTactic.name === 'Sideline Spears' && 'KP +10%'}
                  {selectedTactic.name === 'Diamond Defense' && 'Team DF +50%'}
                  {selectedTactic.name !== 'Flame Fortress' && selectedTactic.name !== 'Mount Fuji' && 
                   selectedTactic.name !== 'Sideline Spears' && selectedTactic.name !== 'Diamond Defense' && 'Special Effect Active'}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleConfirmSelection}
                disabled={selectedTacticsList.length === 0}
                className={`w-full text-white ${
                  selectedTacticsList.length > 0 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm Selection ({selectedTacticsList.length}/3)
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full text-white border-gray-600 hover:bg-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TacticVisualizationModal;