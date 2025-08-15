import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, Save, Globe, Lock, Tag, Plus } from 'lucide-react';
import { logoColors } from '../styles/colors';
import { toast } from 'sonner';

const SaveTeamModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  teamData = null,
  isEditing = false,
  onOverwrite = null,
  editTargetName = ''
}) => {
  const [formData, setFormData] = useState({
    name: teamData?.name || '',
    description: teamData?.description || '',
    is_public: teamData?.is_public !== undefined ? teamData.is_public : true,
    tags: teamData?.tags || []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showOverwriteChoice, setShowOverwriteChoice] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    // If we came from editing a loaded team and consumer provided overwrite handler, show choice first
    if (!isEditing && onOverwrite) {
      setShowOverwriteChoice(true);
      return;
    }

    setIsSaving(true);
    try {
      // If user is editing existing, default description to team name automatically
      const payload = { ...formData, description: formData.description?.trim() ? formData.description : formData.name };
      await onSave(payload);
      toast.success(isEditing ? 'Team updated successfully!' : 'Team saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving team:', error);
      toast.error('Failed to save team');
    } finally {
      setIsSaving(false);
    }
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
            <p className="text-gray-400 text-sm mt-2">
              Fill in your team details below to save your configuration
            </p>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto">
            {showOverwriteChoice ? (
              <div className="space-y-4">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-semibold text-white mb-2">How do you want to save?</h3>
                  <p className="text-gray-300 text-sm">You have a team loaded{editTargetName ? `: ${editTargetName}` : ''}. You can overwrite it or save as a new team.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={async () => {
                      setIsSaving(true);
                      try {
                        const payload = { ...formData, description: formData.description?.trim() ? formData.description : formData.name };
                        await onOverwrite(payload);
                        toast.success('Team overwritten successfully!');
                        onClose();
                      } catch (e) {
                        console.error('Overwrite failed', e);
                        toast.error('Failed to overwrite team');
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    className="w-full text-black font-bold hover:opacity-80"
                    style={{ background: logoColors.yellowOrangeGradient }}
                    disabled={isSaving}
                  >
                    Overwrite Current Team
                  </Button>
                  <Button
                    onClick={async () => {
                      setIsSaving(true);
                      try {
                        await onSave(formData);
                        toast.success('Team saved as new successfully!');
                        onClose();
                      } catch (e) {
                        console.error('Save new failed', e);
                        toast.error('Failed to save as new');
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    className="w-full text-white hover:opacity-80"
                    style={{ backgroundColor: logoColors.primaryBlueAlpha(0.4), borderColor: logoColors.primaryBlueAlpha(0.3) }}
                    disabled={isSaving}
                  >
                    Save as New Team
                  </Button>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowOverwriteChoice(false)}
                    className="w-full text-white border hover:opacity-80"
                    style={{ borderColor: logoColors.primaryBlueAlpha(0.3) }}
                  >
                    Back
                  </Button>
                </div>
              </div>
            ) : (
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
                      {isEditing ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Update Team' : 'Save Team'}
                    </>
                  )}
                </Button>
              </div>
            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SaveTeamModal;