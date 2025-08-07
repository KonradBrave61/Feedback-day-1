import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, Save, Lock, Globe, Tag } from 'lucide-react';
import { toast } from 'sonner';

const SaveTeamModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  teamData = null,
  isEditing = false 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: teamData?.name || '',
    description: teamData?.description || '',
    is_public: teamData?.is_public !== undefined ? teamData.is_public : true,
    tags: teamData?.tags || []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success('Team saved successfully!');
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-orange-900 via-red-800 to-orange-900 p-1 rounded-lg max-w-md w-full mx-4">
        <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5 text-orange-400" />
                {isEditing ? 'Edit Team' : 'Save Team'}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-orange-700/30"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
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
                  className="bg-orange-900/30 border-orange-400/30 text-white placeholder-gray-400"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your team strategy, playstyle, or key players..."
                  className="bg-orange-900/30 border-orange-400/30 text-white placeholder-gray-400 resize-none"
                  rows={3}
                />
              </div>

              {/* Public/Private Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {formData.is_public ? (
                    <Globe className="h-4 w-4 text-green-400" />
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
                    className="bg-orange-900/30 border-orange-400/30 text-white placeholder-gray-400"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    className="text-white border-orange-400/30 hover:bg-orange-700/30"
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
                        className="text-white border-orange-400/50 flex items-center gap-1"
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

              {/* Save Button */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 text-white border-orange-400/30 hover:bg-orange-700/30"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || !formData.name.trim()}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SaveTeamModal;