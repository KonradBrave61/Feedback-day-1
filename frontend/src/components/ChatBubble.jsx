import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { logoColors } from '../styles/colors';
import { MessageSquare, X, ArrowLeft } from 'lucide-react';

const ChatBubble = () => {
  const { user, listConversations, getMessages, sendMessage, loadFollowing, startConversation } = useAuth();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'chat' | 'new'
  const [conversations, setConversations] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');

  const convPollRef = useRef(null);
  const msgPollRef = useRef(null);
  const endRef = useRef(null);

  const totalUnread = useMemo(() => (conversations || []).reduce((acc, c) => acc + (c.unread || 0), 0), [conversations]);

  useEffect(() => {
    if (!open) {
      // Cleanup on close
      if (convPollRef.current) clearInterval(convPollRef.current);
      if (msgPollRef.current) clearInterval(msgPollRef.current);
      setView('list');
      setActiveConvo(null);
      setMessages([]);
      setDraft('');
      return;
    }

    // When opening – load data
    (async () => {
      const convos = await listConversations();
      if (convos?.success) setConversations(convos.conversations || []);
      const fol = await loadFollowing();
      if (fol?.success) setFollowing(fol.following || []);
    })();

    // Poll conversations while open
    convPollRef.current = setInterval(async () => {
      const convos = await listConversations();
      if (convos?.success) setConversations(convos.conversations || []);
    }, 10000);

    return () => {
      if (convPollRef.current) clearInterval(convPollRef.current);
    };
  }, [open, listConversations, loadFollowing]);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const openConversation = async (c) => {
    if (!c) return;
    setActiveConvo(c);
    setView('chat');
    setDraft('');
    const res = await getMessages(c.id);
    if (res?.success) setMessages(res.messages || []);
    if (msgPollRef.current) clearInterval(msgPollRef.current);
    msgPollRef.current = setInterval(async () => {
      const r = await getMessages(c.id);
      if (r?.success) setMessages(r.messages || []);
    }, 5000);
  };

  const handleStartWith = async (u) => {
    const res = await startConversation(u.id);
    if (res?.success) {
      // Refresh conversations and open the one with this partner
      const convRes = await listConversations();
      if (convRes?.success) {
        const list = convRes.conversations || [];
        setConversations(list);
        const target = list.find((c) => c?.partner?.id === u.id) || list[0];
        if (target) openConversation(target);
        setView('chat');
      } else {
        setView('list');
      }
    }
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !activeConvo) return;
    const res = await sendMessage(activeConvo.id, text);
    if (res?.success && res.message) {
      setDraft('');
      setMessages((prev) => [...prev, res.message]);
    }
  };

  const closePanel = () => {
    setOpen(false);
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none" style={{ zIndex: 2147483647, pointerEvents: 'auto' }}>
      {/* Floating button */}
      {!open && (
        <button
          aria-label="Open chat"
          onClick={() => setOpen(true)}
          className="relative h-14 w-14 rounded-full shadow-xl flex items-center justify-center border"
          style={{ background: logoColors.yellowOrangeGradient, color: '#111', borderColor: logoColors.primaryBlueAlpha(0.2) }}
        >
          <MessageSquare className="h-6 w-6" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 text-xs font-semibold px-1.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: '#ef4444' }}>
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          className="w-[380px] max-w-[95vw] h-[520px] fixed bottom-20 right-4 rounded-xl overflow-hidden shadow-2xl border flex flex-col"
          style={{ backgroundColor: logoColors.blackAlpha(0.7), borderColor: logoColors.primaryBlueAlpha(0.25), backdropFilter: 'blur(8px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: logoColors.primaryBlueAlpha(0.2) }}>
            <div className="flex items-center gap-2 text-white">
              {view !== 'list' && (
                <button className="p-1 rounded hover:bg-white/10" onClick={() => { setView('list'); setActiveConvo(null); if (msgPollRef.current) clearInterval(msgPollRef.current); }}>
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <span className="font-semibold">Chat</span>
            </div>
            <div className="flex items-center gap-2">
              {view === 'list' && (
                <button className="text-xs px-2 py-1 rounded border text-white hover:bg-white/10" onClick={() => setView('new')}>
                  New Chat
                </button>
              )}
              <button aria-label="Close" className="p-1 rounded hover:bg-white/10 text-white" onClick={closePanel}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col">
            {view === 'list' && (
              <div className="flex-1 overflow-y-auto p-2">
                {(conversations || []).length === 0 && (
                  <div className="text-center text-gray-300 text-sm mt-8">No conversations yet. Click New Chat to start one.</div>
                )}
                {(conversations || []).map((c) => (
                  <div key={c.id} className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer" onClick={() => openConversation(c)}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={c?.partner?.profile_picture || ''} />
                      <AvatarFallback>{(c?.partner?.username || 'U')[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white font-medium truncate">{c?.partner?.username || 'Unknown'}</div>
                      <div className="text-xs text-gray-400 truncate">{c?.last_message?.content || 'No messages yet'}</div>
                    </div>
                    {!!c.unread && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600">{c.unread}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {view === 'new' && (
              <div className="flex-1 overflow-y-auto p-2">
                {(following || []).length === 0 && (
                  <div className="text-center text-gray-300 text-sm mt-8">You are not following anyone yet.</div>
                )}
                {(following || []).map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-white/5">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={f.profile_picture || ''} />
                        <AvatarFallback>{(f.username || 'U')[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm text-white font-medium">{f.username}</div>
                        <div className="text-xs text-gray-400">Lv {f.coach_level || 1}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleStartWith(f)}>Chat</Button>
                  </div>
                ))}
              </div>
            )}

            {view === 'chat' && (
              <div className="flex-1 flex flex-col">
                {/* Partner header */}
                <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: logoColors.primaryBlueAlpha(0.2) }}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activeConvo?.partner?.profile_picture || ''} />
                    <AvatarFallback>{(activeConvo?.partner?.username || 'U')[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-white text-sm font-medium">{activeConvo?.partner?.username || 'Unknown'}</div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                  {(messages || []).map((m) => (
                    <div key={m.id} className={`max-w-[75%] rounded px-3 py-2 ${m.sender_id === user?.id ? 'ml-auto bg-blue-600/60' : 'mr-auto bg-white/10'} text-white`}>
                      <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
                      <div className="text-[10px] text-gray-300 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>

                {/* Composer */}
                <div className="p-2 border-t flex gap-2" style={{ borderColor: logoColors.primaryBlueAlpha(0.2) }}>
                  <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." className="text-white border flex-1" style={{ backgroundColor: logoColors.blackAlpha(0.5), borderColor: logoColors.primaryBlueAlpha(0.3) }} />
                  <Button onClick={handleSend} className="text-black font-bold" style={{ background: logoColors.yellowOrangeGradient }}>
                    Send
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;