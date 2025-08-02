import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Heart, 
  MessageSquare, 
  Eye, 
  Star, 
  Users, 
  Calendar,
  Trophy
} from 'lucide-react';
import { logoColors, componentColors } from '../styles/colors';

const TeamCard = ({ 
  team, 
  showAuthor = true, 
  showStats = true, 
  onLike, 
  onComment, 
  onView 
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLike = () => {
    if (onLike) onLike(team.id);
  };

  const handleComment = () => {
    if (onComment) onComment(team.id);
  };

  const handleView = () => {
    if (onView) onView(team.id);
  };

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer"
      style={{ 
        background: logoColors.backgroundGradient,
        border: `1px solid ${logoColors.primaryBlueAlpha(0.3)}`,
        boxShadow: `0 4px 20px ${logoColors.primaryBlueAlpha(0.1)}`
      }}
      onClick={handleView}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle 
              className="text-lg font-bold truncate"
              style={{ color: logoColors.primaryBlue }}
            >
              {team.team_name || 'Unnamed Team'}
            </CardTitle>
            {showAuthor && team.creator && (
              <p className="text-sm text-gray-300 mt-1">
                by {team.creator.username || 'Unknown'}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {team.formation && (
              <Badge 
                variant="outline" 
                className="bg-opacity-20 text-xs"
                style={{ 
                  backgroundColor: logoColors.lightBlueAlpha(0.2),
                  borderColor: logoColors.lightBlue,
                  color: logoColors.lightBlue
                }}
              >
                {team.formation}
              </Badge>
            )}
            {team.is_public !== undefined && (
              <Badge 
                variant={team.is_public ? "default" : "secondary"}
                className="text-xs"
                style={{
                  backgroundColor: team.is_public 
                    ? logoColors.primaryBlueAlpha(0.8) 
                    : logoColors.darkBlueAlpha(0.8),
                  color: 'white'
                }}
              >
                {team.is_public ? 'Public' : 'Private'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Team Description */}
        {team.description && (
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
            {team.description}
          </p>
        )}

        {/* Team Rating */}
        {team.average_rating && (
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4" style={{ color: logoColors.yellowOrange }} />
            <span className="text-sm text-white font-medium">
              {team.average_rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({team.total_ratings || 0} rating{team.total_ratings !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        {/* Team Tags */}
        {team.tags && team.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {team.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-2 py-0.5"
                style={{ 
                  backgroundColor: logoColors.yellowOrangeAlpha(0.1),
                  borderColor: logoColors.yellowOrange,
                  color: logoColors.yellowOrange
                }}
              >
                {tag}
              </Badge>
            ))}
            {team.tags.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5"
                style={{ 
                  backgroundColor: logoColors.darkBlueAlpha(0.2),
                  borderColor: logoColors.darkBlue,
                  color: logoColors.darkBlue
                }}
              >
                +{team.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Team Stats */}
        {showStats && (
          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{team.likes || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{team.comments ? team.comments.length : 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{team.views || 0}</span>
              </div>
            </div>
            {team.created_at && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">{formatDate(team.created_at)}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            style={{
              borderColor: logoColors.primaryBlue,
              color: logoColors.primaryBlue,
              backgroundColor: 'transparent'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
          >
            <Heart className="h-3 w-3 mr-1" />
            Like
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            style={{
              borderColor: logoColors.lightBlue,
              color: logoColors.lightBlue,
              backgroundColor: 'transparent'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleComment();
            }}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Comment
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            style={{
              borderColor: logoColors.yellowOrange,
              color: logoColors.yellowOrange,
              backgroundColor: 'transparent'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleView();
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamCard;