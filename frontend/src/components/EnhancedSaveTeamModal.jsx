import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, Save, Lock, Globe, Tag, Plus, Archive, Edit2, Trash2 } from 'lucide-react';
import { logoColors } from '../styles/colors';
import { toast } from 'sonner';

const SaveTeamModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  teamData = null,
  isEditing = false 
}) => {
  const { user, loadSaveSlots, saveTeamToSlot } = useAuth();
  const [formData, setFormData] = useState({
    name: teamData?.name || '',
    description: teamData?.description || '',
    is_public: teamData?.is_public !== undefined ? teamData.is_public : true,
    tags: teamData?.tags || []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSlotSelection, setShowSlotSelection] = useState(false);
  const [saveSlots, setSaveSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [newSlotName, setNewSlotName] = useState('');
  const [isCreatingNewSlot, setIsCreatingNewSlot] = useState(false);

  useEffect(() => {
    if (isOpen && !isEditing) {
      loadSlots();
    }
  }, [isOpen, isEditing]);

  const loadSlots = async () => {
    try {
      const result = await loadSaveSlots();
      if (result.success) {
        setSaveSlots(result.saveSlots);
      }
    } catch (error) {
      console.error('Failed to load save slots:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    if (isEditing) {
      // Direct save for editing
      setIsSaving(true);
      try {
        await onSave(formData);
        toast.success('Team updated successfully!');
        onClose();
      } catch (error) {
        console.error('Error saving team:', error);
        toast.error('Failed to save team');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Show slot selection for new saves
      setShowSlotSelection(true);
    }
  };

  const handleSlotSave = async (slotNumber, overwrite = false) => {
    setIsSaving(true);
    try {
      console.log('HandleSlotSave: Starting save process', { slotNumber, overwrite, teamName: formData.name });
      
      // First save the team
      const saveResult = await onSave(formData);
      console.log('HandleSlotSave: Team save result', saveResult);
      
      if (saveResult.success) {
        // Then save to slot
        const slotData = {
          slot_number: slotNumber,
          slot_name: newSlotName || `Slot ${slotNumber}`,
          overwrite: overwrite
        };
        
        console.log('HandleSlotSave: Saving to slot', slotData);
        const slotResult = await saveTeamToSlot(saveResult.team.id, slotData);
        
        if (slotResult.success) {
          console.log('HandleSlotSave: Successfully saved to slot');
          toast.success(`Team saved to slot ${slotNumber} successfully!`);
          onClose();
        } else {
          throw new Error(slotResult.error || 'Failed to save team to slot');
        }
      } else {
        throw new Error(saveResult.error || 'Failed to save team');
      }
    } catch (error) {
      console.error('HandleSlotSave: Error saving team to slot:', error);
      toast.error(`Failed to save team: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewSlot = () => {
    setIsCreatingNewSlot(true);
    setNewSlotName('');
  };

  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
    setNewSlotName(slot.slot_name);
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="p-1 rounded-lg max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col"
           style={{ background: logoColors.backgroundGradient }}>
        <Card className="backdrop-blur-lg border text-white flex-1 flex flex-col"
              style={{ 
                backgroundColor: logoColors.blackAlpha(0.3),
                borderColor: logoColors.primaryBlueAlpha(0.2)
              }}>
          <CardHeader className="pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                {isEditing ? 'Edit Team' : 'Save Team'}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:opacity-80"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {!showSlotSelection && (
              <p className="text-gray-400 text-sm mt-2">
                Fill in your team details below to save your configuration
              </p>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto">
            {!showSlotSelection ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Team Name */}
                <div>
                  <Label htmlFor="name" className="text-white">Team Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter team name"
                    className="text-white placeholder-gray-400 border"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.3)
                    }}
                    required
                  />
                </div>

                {/* Team Info/Description */}
                <div>
                  <Label htmlFor="description" className="text-white">Team Info/Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your team strategy, playstyle, key players, or any other info..."
                    className="text-white placeholder-gray-400 resize-none border"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.3)
                    }}
                    rows={3}
                  />
                </div>

                {/* Public/Private Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {formData.is_public ? (
                      <Globe className="h-4 w-4" style={{ color: logoColors.primaryYellow }} />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                    <Label htmlFor="is_public" className="text-white">
                      {formData.is_public ? 'Public Team' : 'Private Team'}
                    </Label>
                  </div>
                  <Switch
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                  />
                </div>
                
                <div className="text-xs text-gray-400">
                  {formData.is_public 
                    ? 'Team will be visible in the Community Hub and can be liked/commented on'
                    : 'Team will only be visible to you'
                  }
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags" className="text-white flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="tags"
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag (e.g., attacking, defensive, 4-3-3)"
                      className="text-white placeholder-gray-400 border"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.3)
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTag}
                      className="text-white border hover:opacity-80"
                      style={{ borderColor: logoColors.primaryBlueAlpha(0.3) }}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-white border flex items-center gap-1"
                          style={{ borderColor: logoColors.primaryBlueAlpha(0.5) }}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 text-white border hover:opacity-80"
                    style={{ borderColor: logoColors.primaryBlueAlpha(0.3) }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || !formData.name.trim()}
                    className="flex-1 text-white hover:opacity-80"
                    style={{ background: logoColors.yellowOrangeGradient, color: logoColors.black }}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        {isEditing ? 'Updating...' : 'Continue...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditing ? 'Update Team' : 'Continue to Save'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Choose Save Slot</h3>
                  <p className="text-gray-400 text-sm">Select an existing slot to overwrite or create a new slot</p>
                </div>

                {/* Display existing save slots if any */}
                {saveSlots && saveSlots.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Existing Save Slots:</h4>
                    {saveSlots.map((slot) => (
                      <div
                        key={slot.slot_number}
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:opacity-80 ${
                          selectedSlot?.slot_number === slot.slot_number
                            ? 'border-blue-400 bg-blue-400/20'
                            : 'border hover:border-gray-400'
                        }`}
                        style={selectedSlot?.slot_number === slot.slot_number ? {
                          borderColor: logoColors.primaryBlue,
                          backgroundColor: logoColors.primaryBlueAlpha(0.2)
                        } : {
                          borderColor: logoColors.primaryBlueAlpha(0.3)
                        }}
                        onClick={() => handleSlotSelection(slot)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4" style={{ color: logoColors.primaryBlue }} />
                            <span className="text-white font-medium">{slot.slot_name || `Slot ${slot.slot_number}`}</span>
                            {slot.is_occupied && (
                              <Badge variant="outline" className="text-xs border text-yellow-400 border-yellow-400/50">
                                Occupied
                              </Badge>
                            )}
                          </div>
                          {slot.is_occupied && slot.team_name && (
                            <div className="text-xs text-gray-400 max-w-32 truncate">
                              {slot.team_name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Create New Slot Section */}
                <div className="border-t pt-4" style={{ borderColor: logoColors.primaryBlueAlpha(0.3) }}>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Create New Slot:</h4>
                  <Button
                    onClick={handleCreateNewSlot}
                    className="w-full text-white hover:opacity-80 mb-3"
                    style={{ background: logoColors.yellowOrangeGradient, color: logoColors.black }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Save Slot
                  </Button>
                </div>

                {/* New Slot Creation Form */}
                {isCreatingNewSlot && (
                  <div className="space-y-2 p-3 rounded-lg border" style={{ borderColor: logoColors.primaryBlueAlpha(0.3), backgroundColor: logoColors.blackAlpha(0.2) }}>
                    <Label htmlFor="newSlotName" className="text-white">New Slot Name</Label>
                    <Input
                      id="newSlotName"
                      type="text"
                      value={newSlotName}
                      onChange={(e) => setNewSlotName(e.target.value)}
                      placeholder="Enter slot name"
                      className="text-white placeholder-gray-400 border"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.3)
                      }}
                      autoFocus
                    />
                  </div>
                )}

                {/* Selected Slot Name Edit */}
                {selectedSlot && !isCreatingNewSlot && (
                  <div className="space-y-2 p-3 rounded-lg border" style={{ borderColor: logoColors.primaryBlueAlpha(0.3), backgroundColor: logoColors.blackAlpha(0.2) }}>
                    <Label htmlFor="slotName" className="text-white">
                      {selectedSlot.is_occupied ? 'Overwrite Slot Name:' : 'Edit Slot Name:'}
                    </Label>
                    <Input
                      id="slotName"
                      type="text"
                      value={newSlotName}
                      onChange={(e) => setNewSlotName(e.target.value)}
                      placeholder="Enter slot name"
                      className="text-white placeholder-gray-400 border"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.3)
                      }}
                    />
                    {selectedSlot.is_occupied && (
                      <p className="text-yellow-400 text-xs">
                        Warning: This will overwrite the existing team "{selectedSlot.team_name}"
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowSlotSelection(false);
                      setIsCreatingNewSlot(false);
                      setSelectedSlot(null);
                      setNewSlotName('');
                    }}
                    className="flex-1 text-white border hover:opacity-80"
                    style={{ borderColor: logoColors.primaryBlueAlpha(0.3) }}
                  >
                    Back
                  </Button>
                  
                  {isCreatingNewSlot ? (
                    <Button
                      onClick={() => handleSlotSave(saveSlots.length + 1, false)}
                      disabled={isSaving || !newSlotName.trim()}
                      className="flex-1 text-white hover:opacity-80"
                      style={{ background: logoColors.yellowOrangeGradient, color: logoColors.black }}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create & Save
                        </>
                      )}
                    </Button>
                  ) : selectedSlot ? (
                    <Button
                      onClick={() => handleSlotSave(selectedSlot.slot_number, selectedSlot.is_occupied)}
                      disabled={isSaving || !newSlotName.trim()}
                      className="flex-1 text-white hover:opacity-80"
                      style={{ background: logoColors.yellowOrangeGradient, color: logoColors.black }}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {selectedSlot.is_occupied ? 'Overwrite Slot' : 'Save to Slot'}
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SaveTeamModal;