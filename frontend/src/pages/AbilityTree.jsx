import React, { useMemo, useState } from 'react';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { logoColors } from '../styles/colors';
import { mockHissatsu } from '../data/mock';
import { Zap, Target, Shield, Footprints, GitBranch, X } from 'lucide-react';

const BG = {
  backgroundImage: `radial-gradient(1200px 700px at 60% 40%, rgba(30,144,255,0.25), transparent 60%), radial-gradient(900px 600px at 20% 70%, rgba(0,191,255,0.22), transparent 60%), radial-gradient(800px 500px at 90% 10%, rgba(255,215,0,0.15), transparent 60%), radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.8), transparent 60%), radial-gradient(2px 2px at 70% 80%, rgba(255,255,255,0.8), transparent 60%), radial-gradient(2px 2px at 45% 50%, rgba(255,255,255,0.7), transparent 60%)`,
  backgroundColor: '#00132A'
};

// Simple element colors for branches
const branchColors = {
  shot: '#FFD700', // yellow glow for highlighted path (like screenshot)
  dribble: '#22C55E',
  pass: '#38BDF8',
  defense: '#F97316'
};

const costBadge = (cost) => (
  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] px-1.5 py-0.5 rounded bg-black/70 border border-white/20 text-white">+{cost}</span>
);

const techniqueIcon = (type) => {
  switch (type) {
    case 'Shot':
      return <Zap className="h-4 w-4" />;
    case 'Dribble':
      return <Footprints className="h-4 w-4" />;
    case 'Pass':
      return <Target className="h-4 w-4" />;
    case 'Block':
    case 'Defense':
      return <Shield className="h-4 w-4" />;
    default:
      return <GitBranch className="h-4 w-4" />;
  }
};

const AbilityTree = () => {
  // Learning Points
  const [totalLP] = useState(25);
  const [usedLP, setUsedLP] = useState(7); // start with some spent to match screenshot vibe

  // Tree Definition (positions are percent of container width/height)
  const [nodes, setNodes] = useState([
    { id: 'root', x: 50, y: 50, type: 'Core', unlocked: true, cost: 0, branch: 'shot' },
    { id: 'shot1', x: 70, y: 42, type: 'Shot', unlocked: false, cost: 6, parent: 'root', branch: 'shot' },
    { id: 'shot2', x: 82, y: 38, type: 'Shot', unlocked: false, cost: 6, parent: 'shot1', branch: 'shot' },
    { id: 'shot3', x: 86, y: 46, type: 'Shot', unlocked: false, cost: 6, parent: 'shot2', branch: 'shot' },

    { id: 'dribble1', x: 44, y: 70, type: 'Dribble', unlocked: false, cost: 6, parent: 'root', branch: 'dribble' },
    { id: 'pass1', x: 32, y: 62, type: 'Pass', unlocked: false, cost: 6, parent: 'dribble1', branch: 'pass' },
    { id: 'defense1', x: 58, y: 62, type: 'Defense', unlocked: false, cost: 6, parent: 'root', branch: 'defense' }
  ]);

  const edges = useMemo(() => nodes
    .filter(n => n.parent)
    .map(n => ({ id: `${n.parent}-${n.id}`, from: n.parent, to: n.id, branch: n.branch })), [nodes]);

  const byId = useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);

  const [selectingNode, setSelectingNode] = useState(null);

  const canAfford = (node) => totalLP - usedLP >= (node?.cost || 0);
  const isAvailable = (node) => node.unlocked || (node.parent ? byId[node.parent]?.unlocked : false);

  const openSelection = (node) => {
    if (!node || node.unlocked) return;
    if (!isAvailable(node)) return;
    if (!canAfford(node)) return;
    setSelectingNode(node);
  };

  const techniquesForType = (type) => {
    if (!type) return [];
    const t = type === 'Defense' ? 'Block' : type;
    return mockHissatsu.filter(h => h.type === t).slice(0, 8);
  };

  const unlockNode = (technique) => {
    if (!selectingNode) return;
    setNodes(prev => prev.map(n => n.id === selectingNode.id ? { ...n, unlocked: true, technique } : n));
    setUsedLP(u => u + (selectingNode.cost || 0));
    setSelectingNode(null);
  };

  const resetTree = () => {
    setNodes(prev => prev.map(n => ({ ...n, unlocked: n.id === 'root', technique: undefined })));
    setUsedLP(0);
  };

  // SVG helpers
  const renderEdges = () => {
    return edges.map(e => {
      const a = byId[e.from];
      const b = byId[e.to];
      if (!a || !b) return null;
      const active = b.unlocked; // glow when child is unlocked
      const color = active ? branchColors[e.branch] : 'rgba(255,255,255,0.25)';
      const glow = active ? branchColors[e.branch] : 'transparent';
      const x1 = `${a.x}%`, y1 = `${a.y}%`, x2 = `${b.x}%`, y2 = `${b.y}%`;
      return (
        <g key={e.id}>
          <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={color}
                strokeWidth={active ? 4 : 2}
                strokeLinecap="round"
                style={{ filter: active ? 'drop-shadow(0 0 6px rgba(255,255,200,0.8))' : 'none' }} />
          {/* pulsing highlight dot at the child when unlocked */}
          {active && (
            <circle cx={x2} cy={y2} r={6} fill={glow} opacity={0.35} />
          )}
        </g>
      );
    });
  };

  const renderNode = (n) => {
    const size = 18;
    const border = n.unlocked ? 'white' : 'rgba(255,255,255,0.5)';
    const fill = n.unlocked ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.6)';
    const branch = branchColors[n.branch] || 'white';
    const available = isAvailable(n) && !n.unlocked;
    const afford = canAfford(n);

    return (
      <g key={n.id} style={{ cursor: available && afford ? 'pointer' : 'default' }} onClick={() => openSelection(n)}>
        <circle cx={`${n.x}%`} cy={`${n.y}%`} r={size}
                fill={fill} stroke={border} strokeWidth={2}
                style={{ filter: n.unlocked ? `drop-shadow(0 0 8px ${branch})` : 'none' }} />
        {/* inner colored orb for branch */}
        <circle cx={`${n.x}%`} cy={`${n.y}%`} r={size - 8} fill={n.unlocked ? branch : 'rgba(255,255,255,0.08)'} opacity={n.unlocked ? 0.9 : 0.25} />
        {/* icon */}
        <foreignObject x={`calc(${n.x}% - 8px)`} y={`calc(${n.y}% - 8px)`} width="16" height="16">
          <div className="w-4 h-4 flex items-center justify-center text-white" style={{ lineHeight: 0 }}>{techniqueIcon(n.type)}</div>
        </foreignObject>
        {/* cost badge when available */}
        {!n.unlocked && n.cost ? (
          <foreignObject x={`calc(${n.x}% - 18px)`} y={`calc(${n.y}% + ${size}px)`} width="36" height="18">
            <div className="w-full h-full flex items-center justify-center text-[11px] text-white bg-black/70 border border-white/20 rounded px-1">+{n.cost}</div>
          </foreignObject>
        ) : null}
      </g>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white">Ability Tree</h1>
          <Card className="border text-white" style={{ backgroundColor: logoColors.blackAlpha(0.5), borderColor: logoColors.primaryBlueAlpha(0.3) }}>
            <CardContent className="px-4 py-2">
              <div className="text-sm text-blue-200">Learning Points</div>
              <div className="text-xl font-bold">{totalLP - usedLP}<span className="text-blue-300">/{totalLP}</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="relative rounded-xl overflow-hidden border"
             style={{ ...BG, borderColor: logoColors.primaryBlueAlpha(0.25), height: 560 }}>
          {/* SVG layer for edges and nodes */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            {renderEdges()}
            {nodes.map(renderNode)}
          </svg>

          {/* Center glow similar to screenshot */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(0, 180, 255, 0.35) 0%, rgba(0, 0, 0, 0) 65%)', filter: 'blur(1px)' }} />

          {/* Controls */}
          <div className="absolute bottom-4 left-4 flex gap-3">
            <Button className="text-black" style={{ background: logoColors.yellowOrangeGradient }} onClick={resetTree}>Reset Tree</Button>
          </div>
        </div>
      </div>

      {/* Technique selection modal */}
      <Dialog open={!!selectingNode} onOpenChange={() => setSelectingNode(null)}>
        <DialogContent className="max-w-2xl text-white border" style={{ backgroundColor: logoColors.blackAlpha(0.95), borderColor: logoColors.primaryBlueAlpha(0.4) }}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Select Technique</h3>
                <p className="text-sm text-gray-300 mt-1">{selectingNode ? `${selectingNode.type} · Cost +${selectingNode.cost} LP` : ''}</p>
              </div>
              <Badge className="bg-blue-600/30 text-blue-200 border-blue-400/30">LP Left: {totalLP - usedLP}</Badge>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto mt-2">
            {techniquesForType(selectingNode?.type).map(t => (
              <div key={t.id} className="rounded-lg border p-3 hover:scale-[1.01] transition-all cursor-pointer"
                   style={{ backgroundColor: logoColors.blackAlpha(0.5), borderColor: logoColors.primaryBlueAlpha(0.25) }}
                   onClick={() => unlockNode(t)}>
                <div className="flex items-center gap-3">
                  <img src={t.icon} alt={t.name} className="w-8 h-8" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{t.name}</div>
                    <div className="text-xs text-gray-300 truncate">{t.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="ghost" className="text-white hover:bg-blue-700/30" onClick={() => setSelectingNode(null)}>
              <X className="h-4 w-4 mr-1" /> Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AbilityTree;