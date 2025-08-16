import React, { useEffect, useState, useMemo } from 'react';
import { X, MessageSquare, Send, CornerDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { logoColors } from '../styles/colors';
import { useAuth } from '../contexts/AuthContext';

const CommentsModal = ({ isOpen, onClose, team }) => {
  const { commentOnTeam, loadTeamDetails } = useAuth();
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const teamTitle = useMemo(() => team?.name || team?.team_name || 'Team', [team]);

  useEffect(() => {
    if (!isOpen || !team?.id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await loadTeamDetails(team.id);
        const teamData = res?.team?.team || res?.team || res;
        let list = teamData?.comments || [];
        // Normalize comments if backend returned an object or dict
        if (!Array.isArray(list)) {
          list = Object.values(list);
        }
        // Sort by created_at asc and keep as flat list; we'll render threaded by parent_id
        const normalized = (Array.isArray(list) ? list : []).sort((a,b)=> new Date(a.created_at)-new Date(b.created_at));
        setComments(normalized);
      } catch (e) {
        setComments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, team?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const result = await commentOnTeam(team.id, input.trim());
      if (result?.success && result.comment) {
        setComments((prev) => [...prev, result.comment]);
        setInput('');
      }
    } catch (_) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-2xl mx-4 rounded-lg overflow-hidden" style={{ background: logoColors.blackAlpha(0.6), border: `1px solid ${logoColors.primaryBlueAlpha(0.2)}` }}>
        <Card className="bg-transparent border-0 text-white">
          <CardHeader className="pb-3 border-b" style={{ borderColor: logoColors.primaryBlueAlpha(0.2) }}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                Comments · {teamTitle}
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-white hover:opacity-80" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[55vh] overflow-y-auto divide-y" style={{ borderColor: logoColors.primaryBlueAlpha(0.1) }}>
              {loading ? (
                <div className="p-6 text-center text-gray-300">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="p-6 text-center text-gray-300">No comments yet. Be the first to comment!</div>
              ) : (
                // Recursive render
                (() => {
                  const byParent = comments.reduce((acc, c) => {
                    const pid = c.parent_id || 'root';
                    (acc[pid] = acc[pid] || []).push(c);
                    return acc;
                  }, {});
                  const renderThread = (parentId, depth=0) => {
                    const nodes = byParent[parentId || 'root'] || [];
                    return nodes.map((c) => (
                      <div key={c.id} className={`p-4 ${depth? 'pt-2' : ''}`} style={{ paddingLeft: depth? 24: 16 }}>
                        <div className="flex gap-3">
                          <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gray-600/40 flex items-center justify-center text-sm font-bold">
                            {(c.username || 'U')[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold text-white truncate">{c.username || 'User'}</span>
                              <span className="text-gray-400 truncate">{new Date(c.created_at).toLocaleString()}</span>
                            </div>
                            <div className="text-gray-200 mt-1 whitespace-pre-wrap break-words">{String(c.content || '')}</div>
                            <button onClick={() => setReplyTo(c)} className="mt-2 text-xs text-blue-300 hover:underline inline-flex items-center gap-1"><CornerDownRight className="h-3 w-3" /> Reply</button>
                            {renderThread(c.id, depth+1)}
                          </div>
                        </div>
                      </div>
                    ));
                  };
                  return renderThread(null, 0);
                })()
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 flex gap-2 border-t" style={{ borderColor: logoColors.primaryBlueAlpha(0.2) }}>
              <Input
                placeholder="Write a comment..."
                className="flex-1 text-white border"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ backgroundColor: logoColors.blackAlpha(0.5), borderColor: logoColors.primaryBlueAlpha(0.3) }}
              />
              <Button type="submit" className="text-black font-bold" style={{ background: logoColors.yellowOrangeGradient }}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommentsModal;