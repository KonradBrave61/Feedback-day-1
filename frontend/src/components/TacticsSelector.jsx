import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { mockTactics } from '../data/mock';
import { Check, X } from 'lucide-react';

const TacticsSelector = ({ isOpen, onClose, onTacticSelect, selectedTactics = [] }) => {
  const [currentSelection, setCurrentSelection] = useState(selectedTactics);

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

  const handleConfirm = () => {
    onTacticSelect(currentSelection);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Change Tactics</DialogTitle>
          <p className="text-gray-300">Select up to 3 tactics for your team</p>
        </DialogHeader>

        {/* Selected Tactics */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Selected Tactics ({currentSelection.length}/3)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[0, 1, 2].map(index => (
              <div key={index} className="h-16 bg-black/20 rounded-lg border border-white/20 flex items-center justify-center">
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
                      ? 'bg-blue-600/30 border-blue-500' 
                      : 'bg-black/20 border-white/20 hover:bg-black/30'
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="text-white border-white/20">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700"
            disabled={currentSelection.length === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Apply Tactics
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TacticsSelector;