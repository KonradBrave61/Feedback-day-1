import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { mockTactics } from '../data/mock';
import { Check, X, Save, RotateCcw } from 'lucide-react';
import { logoColors } from '../styles/colors';

const TacticsSelector = ({ 
  isOpen, 
  onClose, 
  onTacticSelect, 
  selectedTactics = [], 
  presets = {
    1: { name: 'Preset 1', tactics: [] },
    2: { name: 'Preset 2', tactics: [] }
  },
  currentPreset = 1,
  onPresetsUpdate
}) => {
  const [editingPreset, setEditingPreset] = useState(null);
  const [currentSelection, setCurrentSelection] = useState([]);

  // Initialize presets with selected tactics if they're empty
  useEffect(() => {
    if (selectedTactics.length > 0 && presets[1].tactics.length === 0 && presets[2].tactics.length === 0) {
      const updatedPresets = {
        ...presets,
        1: { name: 'Preset 1', tactics: selectedTactics.slice(0, 3) }
      };
      onPresetsUpdate?.(updatedPresets, currentPreset);
    }
  }, [selectedTactics, presets, currentPreset, onPresetsUpdate]);

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
      const updatedPresets = {
        ...presets,
        [editingPreset]: {
          ...presets[editingPreset],
          tactics: [...currentSelection]
        }
      };
      onPresetsUpdate?.(updatedPresets, currentPreset);
      setEditingPreset(null);
      setCurrentSelection([]);
    }
  };

  const handleCancelEdit = () => {
    setEditingPreset(null);
    setCurrentSelection([]);
  };

  const handlePresetSwitch = (presetId) => {
    onPresetsUpdate?.(presets, presetId);
    onTacticSelect(presets[presetId].tactics);
  };

  const handleConfirm = () => {
    // Apply the current preset tactics but don't close the modal
    onTacticSelect(presets[currentPreset].tactics);
    onClose();
  };

  const handleClose = () => {
    // Reset editing state when closing
    setEditingPreset(null);
    setCurrentSelection([]);
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] text-white border"
                     style={{ 
                       background: logoColors.backgroundGradient,
                       borderColor: logoColors.primaryBlueAlpha(0.2)
                     }}>
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
                <Card key={id} className={`transition-all border ${
                  currentPreset === parseInt(id) 
                    ? 'border' 
                    : 'border hover:opacity-80'
                }`}
                      style={currentPreset === parseInt(id) ? {
                        backgroundColor: logoColors.primaryBlueAlpha(0.3),
                        borderColor: logoColors.primaryBlue
                      } : {
                        backgroundColor: logoColors.blackAlpha(0.2),
                        borderColor: logoColors.primaryBlueAlpha(0.3)
                      }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">{preset.name}</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePresetEdit(parseInt(id))}
                          className="text-white hover:opacity-80"
                          style={{ color: logoColors.primaryBlue }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePresetSwitch(parseInt(id))}
                          className="text-white hover:opacity-80"
                          style={{ color: logoColors.primaryYellow }}
                        >
                          {currentPreset === parseInt(id) ? 'Active' : 'Apply'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map(index => (
                        <div key={index} className="h-12 rounded-lg border flex items-center justify-center"
                             style={{ 
                               backgroundColor: logoColors.blackAlpha(0.2),
                               borderColor: logoColors.primaryBlueAlpha(0.3)
                             }}>
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

            {/* Current Active Tactics */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Currently Active: {presets[currentPreset].name}</h3>
              <div className="grid grid-cols-3 gap-4">
                {getCurrentTactics().map((tactic, index) => (
                  <Card key={index} className="border"
                        style={{ 
                          backgroundColor: logoColors.yellowAlpha(0.2),
                          borderColor: logoColors.primaryYellow
                        }}>
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl mb-2">{getTacticIcon(tactic.name)}</div>
                      <div className="font-medium text-white">{tactic.name}</div>
                      <div className="text-xs text-gray-300 mt-1">{tactic.effect}</div>
                    </CardContent>
                  </Card>
                ))}
                {Array.from({ length: 3 - getCurrentTactics().length }, (_, index) => (
                  <Card key={`empty-${index}`} className="border"
                        style={{ 
                          backgroundColor: logoColors.blackAlpha(0.2),
                          borderColor: logoColors.primaryBlueAlpha(0.3)
                        }}>
                    <CardContent className="p-3 text-center">
                      <div className="text-gray-500 text-sm">Empty Slot</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button 
                onClick={handleClose} 
                className="text-white border hover:opacity-80"
                style={{ 
                  backgroundColor: logoColors.blackAlpha(0.4),
                  borderColor: logoColors.primaryBlueAlpha(0.3)
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              <Button 
                onClick={handleConfirm}
                className="text-white hover:opacity-80"
                style={{ background: logoColors.yellowOrangeGradient, color: logoColors.black }}
              >
                <Check className="h-4 w-4 mr-2" />
                Apply Current Preset
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Editing Mode */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Selected Tactics ({currentSelection.length}/3)</h3>
              <div className="grid grid-cols-3 gap-4">
                {currentSelection.map((tactic, index) => (
                  <Card key={index} className="border"
                        style={{ 
                          backgroundColor: logoColors.yellowAlpha(0.2),
                          borderColor: logoColors.primaryYellow
                        }}>
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl mb-2">{getTacticIcon(tactic.name)}</div>
                      <div className="font-medium text-white">{tactic.name}</div>
                      <div className="text-xs text-gray-300 mt-1">{tactic.effect}</div>
                    </CardContent>
                  </Card>
                ))}
                {Array.from({ length: 3 - currentSelection.length }, (_, index) => (
                  <Card key={`empty-${index}`} className="border"
                        style={{ 
                          backgroundColor: logoColors.blackAlpha(0.2),
                          borderColor: logoColors.primaryBlueAlpha(0.3)
                        }}>
                    <CardContent className="p-3 text-center">
                      <div className="text-gray-500 text-sm">Empty Slot</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Available Tactics */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Available Tactics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {mockTactics.map((tactic) => {
                  const isSelected = currentSelection.some(t => t.id === tactic.id);
                  return (
                    <Card
                      key={tactic.id}
                      className={`cursor-pointer transition-all border ${isSelected ? '' : 'hover:opacity-80'}`}
                      style={isSelected ? {
                        backgroundColor: logoColors.yellowAlpha(0.3),
                        borderColor: logoColors.primaryYellow
                      } : {
                        backgroundColor: logoColors.blackAlpha(0.2),
                        borderColor: logoColors.primaryBlueAlpha(0.3)
                      }}
                      onClick={() => handleTacticToggle(tactic)}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl mb-2">{getTacticIcon(tactic.name)}</div>
                        <div className="font-medium text-white">{tactic.name}</div>
                        <div className="text-xs text-gray-300 mt-1">{tactic.effect}</div>
                        {isSelected && (
                          <Check className="h-4 w-4 mx-auto mt-2" style={{ color: logoColors.primaryYellow }} />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Edit Mode Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button 
                onClick={handleCancelEdit} 
                className="text-white hover:opacity-80"
                style={{ backgroundColor: logoColors.blackAlpha(0.6) }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSavePreset}
                className="text-white hover:opacity-80"
                style={{ background: logoColors.yellowOrangeGradient, color: logoColors.black }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Preset
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TacticsSelector;