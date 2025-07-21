import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { mockTactics } from '../data/mock';
import { Check, X, Save, RotateCcw } from 'lucide-react';

const TacticsSelector = ({ isOpen, onClose, onTacticSelect, selectedTactics = [] }) => {
  const [currentPreset, setCurrentPreset] = useState(1);
  const [presets, setPresets] = useState({
    1: { name: 'Preset 1', tactics: [] },
    2: { name: 'Preset 2', tactics: [] }
  });
  const [editingPreset, setEditingPreset] = useState(null);
  const [currentSelection, setCurrentSelection] = useState([]);

  // Initialize presets only once when component mounts or selectedTactics changes significantly
  useEffect(() => {
    if (selectedTactics.length > 0 && presets[1].tactics.length === 0 && presets[2].tactics.length === 0) {
      setPresets(prev => ({
        ...prev,
        1: { name: 'Preset 1', tactics: selectedTactics.slice(0, 3) }
      }));
    }
  }, [selectedTactics]);

  const handleTacticToggle = (tactic) => {
    setCurrentSelection(prev => {
      const isSelected = prev.some(t => t.id === tactic.id);
      if (isSelected) {
        return prev.filter(t => t.id !== tactic.id);
      } else if (prev.length < 3) {
        return [...prev, tactic];
      }
      return prev;
    });
  };

  const handlePresetEdit = (presetId) => {
    setEditingPreset(presetId);
    setCurrentSelection([...presets[presetId].tactics]);
  };

  const handleSavePreset = () => {
    if (editingPreset) {
      setPresets(prev => ({
        ...prev,
        [editingPreset]: {
          ...prev[editingPreset],
          tactics: [...currentSelection]
        }
      }));
      setEditingPreset(null);
      setCurrentSelection([]);
    }
  };

  const handleCancelEdit = () => {
    setEditingPreset(null);
    setCurrentSelection([]);
  };

  const handlePresetSwitch = (presetId) => {
    setCurrentPreset(presetId);
    onTacticSelect(presets[presetId].tactics);
  };

  const handleConfirm = () => {
    onTacticSelect(presets[currentPreset].tactics);
    onClose();
  };

  const getTacticIcon = (tacticName) => {
    const iconMap = {
      'Flame Fortress': '🔥',
      'Sideline Spears': '⚡',
      'Mount Fuji': '🏔️',
      'Waxing Moon': '🌙',
      'Diamond Defense': '💎',
      'Bond Protocol': '🤝',
      'Bull Horns': '🐂',
      'Claymore': '⚔️',
      'Three-Pronged Attack': '🔱'
    };
    return iconMap[tacticName] || '⚽';
  };

  const getCurrentTactics = () => {
    return editingPreset ? currentSelection : presets[currentPreset].tactics;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-orange-900 via-red-800 to-orange-900 text-white border-orange-400/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {editingPreset ? `Edit ${presets[editingPreset].name}` : 'Tactics Presets'}
          </DialogTitle>
          <p className="text-gray-300">
            {editingPreset ? 'Select up to 3 tactics for this preset' : 'Manage your tactics presets'}
          </p>
        </DialogHeader>

        {!editingPreset ? (
          <>
            {/* Preset Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {Object.entries(presets).map(([id, preset]) => (
                <Card key={id} className={`cursor-pointer transition-all ${
                  currentPreset === parseInt(id) 
                    ? 'bg-orange-600/30 border-orange-500' 
                    : 'bg-black/20 border-orange-400/30 hover:bg-orange-700/30'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{preset.name}</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePresetEdit(parseInt(id))}
                          className="text-orange-400 hover:bg-orange-700/30"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePresetSwitch(parseInt(id))}
                          className="text-green-400 hover:bg-green-700/30"
                        >
                          {currentPreset === parseInt(id) ? 'Active' : 'Switch'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map(index => (
                        <div key={index} className="h-12 bg-black/20 rounded-lg border border-orange-400/30 flex items-center justify-center">
                          {preset.tactics[index] ? (
                            <div className="text-center">
                              <div className="text-lg mb-1">{getTacticIcon(preset.tactics[index].name)}</div>
                              <div className="text-xs font-medium truncate">{preset.tactics[index].name}</div>
                            </div>
                          ) : (
                            <div className="text-gray-500 text-xs">Empty</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Current Active Preset Details */}
            <Card className="bg-black/20 border-orange-400/30 mb-4">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Active Preset: {presets[currentPreset].name}</h3>
                <div className="space-y-2">
                  {presets[currentPreset].tactics.map((tactic, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-orange-600/20 rounded-lg">
                      <div className="text-xl">{getTacticIcon(tactic.name)}</div>
                      <div className="flex-1">
                        <div className="font-medium">{tactic.name}</div>
                        <div className="text-sm text-gray-300">{tactic.description}</div>
                      </div>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        {tactic.effect}
                      </Badge>
                    </div>
                  ))}
                  {presets[currentPreset].tactics.length === 0 && (
                    <div className="text-center py-4 text-gray-400">
                      <p>No tactics in this preset</p>
                      <p className="text-sm">Click "Edit" to add tactics</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Preset Editing Mode */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Selected Tactics ({currentSelection.length}/3)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[0, 1, 2].map(index => (
                  <div key={index} className="h-16 bg-black/20 rounded-lg border border-orange-400/30 flex items-center justify-center">
                    {currentSelection[index] ? (
                      <div className="text-center">
                        <div className="text-2xl mb-1">{getTacticIcon(currentSelection[index].name)}</div>
                        <div className="text-xs font-medium">{currentSelection[index].name}</div>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">Empty Slot</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Available Tactics */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Available Tactics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {mockTactics.map((tactic) => {
                  const isSelected = currentSelection.some(t => t.id === tactic.id);
                  return (
                    <Card
                      key={tactic.id}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-orange-600/30 border-orange-500' 
                          : 'bg-black/20 border-orange-400/30 hover:bg-orange-700/30'
                      }`}
                      onClick={() => handleTacticToggle(tactic)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{getTacticIcon(tactic.name)}</div>
                            <div className="flex-1">
                              <h4 className="font-medium text-white">{tactic.name}</h4>
                              <p className="text-sm text-gray-300 mt-1">{tactic.description}</p>
                              <Badge variant="outline" className="mt-2 text-green-400 border-green-400">
                                {tactic.effect}
                              </Badge>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={editingPreset ? handleCancelEdit : onClose}
            className="text-white border-orange-400/30"
          >
            <X className="h-4 w-4 mr-2" />
            {editingPreset ? 'Cancel' : 'Close'}
          </Button>
          
          {editingPreset ? (
            <Button 
              onClick={handleSavePreset}
              className="bg-green-600 hover:bg-green-700"
              disabled={currentSelection.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Preset
            </Button>
          ) : (
            <Button 
              onClick={handleConfirm}
              className="bg-orange-600 hover:bg-orange-700"
              disabled={presets[currentPreset].tactics.length === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              Apply Preset
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TacticsSelector;