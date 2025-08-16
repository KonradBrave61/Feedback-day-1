import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { logoColors } from '../styles/colors';
import { MessageSquare, Send, ShieldBan, CheckCircle2, Bell } from 'lucide-react';

const ChatPage = () => {
  const { user, listConversations, startConversation, getMessages, sendMessage, loadFollowing, updateChatSettings, blockUser, unblockUser } = useAuth();
  const [following, setFollowing] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [settings, setSettings] = useState({ accept_messages_from: 'following', read_receipts: true, notifications: true });
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    (async () => {
      const res = await loadFollowing();
      if (res?.success) setFollowing(res.following || []);
      const convos = await listConversations();
      if (convos?.success) setConversations(convos.conversations || []);
    })();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const partnerFromConvo = (c) => c?.partner || {};

  const openConversation = async (c) => {
    if (!c) return;
    setActiveConvo(c);
    setDraft('');
    const res = await getMessages(c.id);
    if (res?.success) setMessages(res.messages || []);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const r = await getMessages(c.id);
      if (r?.success) setMessages(r.messages || []);
    }, 5000);
  };

  const handleStartWith = async (u) => {
    const res = await startConversation(u.id);
    if (res?.success) {
      const convRes = await listConversations();
      if (convRes?.success) setConversations(convRes.conversations || []);
    }
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !activeConvo) return;
    const res = await sendMessage(activeConvo.id, text);
    if (res?.success) {
      setDraft('');
      setMessages((prev) => [...prev, res.message]);
    }
  };

  const applySettings = async () => {
    await updateChatSettings(settings);
  };

  const toggleBlock = async () => {
    if (!activeConvo) return;
    const pid = activeConvo?.partner?.id;
    if (!pid) return;
    const isBlocked = false; // simple UI — we could fetch
    if (isBlocked) await unblockUser(pid); else await blockUser(pid);
  };

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Following list */}
        <Card className="lg:col-span-1 backdrop-blur-lg text-white border" style={{ backgroundColor: logoColors.blackAlpha(0.3), borderColor: logoColors.primaryBlueAlpha(0.2) }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Chats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {following.map((f) => (
                <div key={f.id} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-white/5">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={f.profile_picture || ''} />
                      <AvatarFallback>{(f.username || 'U')[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{f.username}</div>
                      <div className="text-xs text-gray-400">Lv {f.coach_level || 1}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleStartWith(f)}>Chat</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Middle: Conversations */}
        <Card className="lg:col-span-1 backdrop-blur-lg text-white border" style={{ backgroundColor: logoColors.blackAlpha(0.3), borderColor: logoColors.primaryBlueAlpha(0.2) }}>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conversations.map((c) => (
                <div key={c.id} className="p-2 rounded hover:bg-white/5 cursor-pointer" onClick={() => openConversation(c)}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={partnerFromConvo(c).profile_picture || ''} />
                      <AvatarFallback>{(partnerFromConvo(c).username || 'U')[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{partnerFromConvo(c).username || 'Unknown'}</div>
                      <div className="text-xs text-gray-400 truncate">{c.last_message?.content || 'No messages'}</div>
                    </div>
                    {!!c.unread && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600">{c.unread}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Active chat */}
        <Card className="lg:col-span-2 backdrop-blur-lg text-white border flex flex-col" style={{ backgroundColor: logoColors.blackAlpha(0.3), borderColor: logoColors.primaryBlueAlpha(0.2) }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{activeConvo?.partner?.username || 'Select a conversation'}</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={toggleBlock}><ShieldBan className="h-4 w-4 mr-1" /> Block</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[70%] rounded px-3 py-2 ${m.sender_id === user?.id ? 'ml-auto bg-blue-600/60' : 'mr-auto bg-white/10'}`}>
                  <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
                  <div className="text-[10px] text-gray-300 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t flex gap-2" style={{ borderColor: logoColors.primaryBlueAlpha(0.2) }}>
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." className="text-white border flex-1" style={{ backgroundColor: logoColors.blackAlpha(0.5), borderColor: logoColors.primaryBlueAlpha(0.3) }} />
              <Button onClick={handleSend} className="text-black font-bold" style={{ background: logoColors.yellowOrangeGradient }}><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="lg:col-span-4 backdrop-blur-lg text-white border" style={{ backgroundColor: logoColors.blackAlpha(0.3), borderColor: logoColors.primaryBlueAlpha(0.2) }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Chat Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Who can message you</label>
                <select value={settings.accept_messages_from} onChange={(e) => setSettings(s => ({ ...s, accept_messages_from: e.target.value }))} className="w-full bg-transparent border rounded p-2">
                  <option value="everyone">Everyone</option>
                  <option value="following">People I follow</option>
                  <option value="mutual">Mutual follows only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Read receipts</label>
                <select value={settings.read_receipts ? 'on' : 'off'} onChange={(e) => setSettings(s => ({ ...s, read_receipts: e.target.value === 'on' }))} className="w-full bg-transparent border rounded p-2">
                  <option value="on">On</option>
                  <option value="off">Off</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Notifications</label>
                <select value={settings.notifications ? 'on' : 'off'} onChange={(e) => setSettings(s => ({ ...s, notifications: e.target.value === 'on' }))} className="w-full bg-transparent border rounded p-2">
                  <option value="on">On</option>
                  <option value="off">Off</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={applySettings} variant="outline">Save Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;