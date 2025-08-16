import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { mockCoaches as mockManagers } from '../data/mock';
import { Check, X } from 'lucide-react';
import { logoColors } from '../styles/colors';

const ManagerSelector = ({ isOpen, onClose, onConfirm, selectedManagers = [] }) => {
  const [current, setCurrent] = useState(selectedManagers || []);

  useEffect(() => { setCurrent(selectedManagers || []); }, [selectedManagers, isOpen]);

  const isSelected = (m) => current.some(cm => (cm.id || cm?.coach_id) === (m.id || m?.coach_id));

  const toggle = (m) => {
    const id = m.id || m?.coach_id;
    if (isSelected(m)) {
      setCurrent(prev => prev.filter(x => (x.id || x?.coach_id) !== id));
    } else {
      if (current.length >= 3) return; // up to 3
      setCurrent(prev => [...prev, m]);
    }
  };

  const handleConfirm = () => {
    onConfirm(Array.isArray(current) ? current.slice(0, 3) : []);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] text-white border" style={{ background: logoColors.backgroundGradient, borderColor: logoColors.primaryBlueAlpha(0.2) }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Select Managers (up to 3)</DialogTitle>
          <p className="text-gray-300">Pick 1-3 managers. Display matches coaches.</p>
        </DialogHeader>

        {/* Selected */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Selected</h3>
          {current.length === 0 ? (
            <div className="text-gray-400 text-sm">No managers selected</div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {current.map((m) => (
                <Card key={m.id} className="border" style={{ backgroundColor: logoColors.blackAlpha(0.25), borderColor: logoColors.primaryBlueAlpha(0.3) }}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <img src={m.portrait} alt={m.name} className="w-10 h-10 rounded-full" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">{m.name}</div>
                      <div className="text-xs text-gray-300 truncate">{m.title}</div>
                    </div>
                    <Button size="icon" variant="ghost" className="ml-auto text-white/80 hover:text-white" onClick={() => toggle(m)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Available */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold mb-2">Available</h3>
          <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-1">
            {mockManagers.map((m) => {
              const picked = isSelected(m);
              return (
                <Card key={m.id} className={`cursor-pointer transition-all border ${picked ? '' : 'hover:opacity-80'}`} style={picked ? { backgroundColor: logoColors.yellowAlpha(0.3), borderColor: logoColors.primaryYellow } : { backgroundColor: logoColors.blackAlpha(0.2), borderColor: logoColors.primaryBlueAlpha(0.3) }} onClick={() => toggle(m)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img src={m.portrait} alt={m.name} className="w-12 h-12 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{m.name}</div>
                        <div className="text-sm text-gray-300 truncate">{m.title}</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(m.specialties || []).map((s, i) => (
                            <Badge key={i} variant="outline" className="text-xs border" style={{ borderColor: logoColors.primaryBlueAlpha(0.3), backgroundColor: logoColors.blackAlpha(0.3), color: logoColors.lightBlue }}>
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {picked && <Check className="h-5 w-5 flex-shrink-0" style={{ color: logoColors.primaryYellow }} />}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} className="text-white border hover:opacity-80" style={{ backgroundColor: logoColors.blackAlpha(0.4), borderColor: logoColors.primaryBlueAlpha(0.3) }}>
            <X className="h-4 w-4 mr-2" />Cancel
          </Button>
          <Button onClick={handleConfirm} className="text-white hover:opacity-80" style={{ background: logoColors.yellowOrangeGradient, color: logoColors.black }}>
            <Check className="h-4 w-4 mr-2" />Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManagerSelector;
