import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { mockCoaches } from '../data/mock';
import { Check, X } from 'lucide-react';
import { logoColors } from '../styles/colors';

const CoachSelector = ({ isOpen, onClose, onCoachSelect, selectedCoach }) => {
  const [currentSelection, setCurrentSelection] = useState(selectedCoach);

  const handleCoachToggle = (coach) => {
    setCurrentSelection(currentSelection?.id === coach.id ? null : coach);
  };

  const handleConfirm = () => {
    onCoachSelect(currentSelection);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] text-white border"
                     style={{ 
                       background: logoColors.backgroundGradient,
                       borderColor: logoColors.primaryBlueAlpha(0.2)
                     }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Select Coach</DialogTitle>
          <p className="text-gray-300">Choose a coach to boost your team's performance</p>
        </DialogHeader>

        {/* Selected Coach */}
        {currentSelection && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Selected Coach</h3>
            <Card className="border"
                  style={{ 
                    backgroundColor: logoColors.yellowAlpha(0.2),
                    borderColor: logoColors.primaryYellow
                  }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={currentSelection.portrait}
                    alt={currentSelection.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{currentSelection.name}</h4>
                    <p className="text-sm text-gray-300">{currentSelection.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{currentSelection.bonuses.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {currentSelection.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs border"
                               style={{ color: logoColors.primaryYellow, borderColor: logoColors.primaryYellow }}>
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 text-xs" style={{ color: logoColors.primaryBlue }}>
                      Stat Bonuses: {Object.entries(currentSelection.bonuses.teamStats).map(([stat, value]) => 
                        `${stat}: +${value}`
                      ).join(', ')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Available Coaches */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Available Coaches</h3>
          <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
            {mockCoaches.map((coach) => {
              const isSelected = currentSelection?.id === coach.id;
              return (
                <Card
                  key={coach.id}
                  className={`cursor-pointer transition-all border ${isSelected ? '' : 'hover:opacity-80'}`}
                  style={isSelected ? {
                    backgroundColor: logoColors.yellowAlpha(0.3),
                    borderColor: logoColors.primaryYellow
                  } : {
                    backgroundColor: logoColors.blackAlpha(0.2),
                    borderColor: logoColors.primaryBlueAlpha(0.3)
                  }}
                  onClick={() => handleCoachToggle(coach)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={coach.portrait}
                        alt={coach.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{coach.name}</h4>
                        <p className="text-sm text-gray-300">{coach.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{coach.bonuses.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {coach.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs border"
                                   style={{ 
                                     borderColor: logoColors.primaryBlueAlpha(0.3),
                                     backgroundColor: logoColors.blackAlpha(0.3),
                                     color: logoColors.lightBlue
                                   }}>
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-4 text-xs" style={{ color: logoColors.primaryBlue }}>
                          Bonuses: {Object.entries(coach.bonuses.teamStats).map(([stat, value]) => 
                            `${stat}: +${value}`
                          ).join(', ')}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 flex-shrink-0" style={{ color: logoColors.primaryYellow }} />
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
          <Button 
            onClick={onClose} 
            className="text-white border hover:opacity-80"
            style={{ 
              backgroundColor: logoColors.blackAlpha(0.4),
              borderColor: logoColors.primaryBlueAlpha(0.3)
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="text-white hover:opacity-80"
            style={{ background: logoColors.yellowOrangeGradient, color: logoColors.black }}
          >
            <Check className="h-4 w-4 mr-2" />
            Select Coach
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoachSelector;