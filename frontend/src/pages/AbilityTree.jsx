import React, { useMemo, useState, useRef, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { logoColors } from '../styles/colors';
import { mockHissatsu } from '../data/mock';
import { Lock, Zap, Footprints, Target, Shield, X } from 'lucide-react';

// Utility: pick a subset by type
const listByType = (type) => {
  const t = type === 'Defense' ? 'Block' : type;
  return mockHissatsu.filter(h => h.type === t).slice(0, 8);
};

// Icon for type
const TypeIcon = ({ type, className = 'h-4 w-4' }) => {
  switch (type) {
    case 'Shot': return <Zap className={className} />;
    case 'Dribble': return <Footprints className={className} />;
    case 'Pass': return <Target className={className} />;
    case 'Defense':
    case 'Block': return <Shield className={className} />;
    default: return null;
  }
};

// ViewBox coordinate system (fixed) so we can position 1:1
const VIEW_W = 1000; // width units
const VIEW_H = 560;  // height units

// Background star field + energy mesh using layered gradients
const bgStyle = {
  backgroundImage: `radial-gradient(800px 500px at 55% 50%, rgba(0,160,255,0.35), rgba(0,0,0,0) 60%), radial-gradient(1200px 700px at 20% 80%, rgba(0,191,255,0.26), rgba(0,0,0,0) 60%), radial-gradient(1000px 600px at 90% 10%, rgba(255,215,0,0.12), rgba(0,0,0,0) 60%), radial-gradient(2px 2px at 10% 20%, rgba(255,255,255,0.9), rgba(255,255,255,0) 60%), radial-gradient(2px 2px at 25% 60%, rgba(255,255,255,0.9), rgba(255,255,255,0) 60%), radial-gradient(2px 2px at 60% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0) 60%), radial-gradient(2px 2px at 80% 70%, rgba(255,255,255,0.8), rgba(255,255,255,0) 60%)`,
  backgroundColor: '#001327'
};

// Branch palette to match screenshot accents
const branchColors = {
  shot: '#FFD94A',      // glowing yellow
  dribble: '#22C55E',   // green
  pass: '#38BDF8',      // blue
  defense: '#F59E0B'    // amber/orange
};

// Nodes definition positioned to mimic the screenshot layout
const initialNodes = [
  // center card anchor root
  { id: 'root', x: 500, y: 300, type: 'Core', unlocked: true, cost: 0, branch: 'shot' },

  // highlighted shot path on the right-top
  { id: 'shot1', x: 650, y: 260, type: 'Shot', unlocked: false, cost: 6, parent: 'root', branch: 'shot' },
  { id: 'shot2', x: 760, y: 225, type: 'Shot', unlocked: false, cost: 6, parent: 'shot1', branch: 'shot' },
  { id: 'shot3', x: 840, y: 270, type: 'Shot', unlocked: false, cost: 6, parent: 'shot2', branch: 'shot' },

  // lower-left branch like green/blue chain with +6 clips
  { id: 'dribble1', x: 450, y: 420, type: 'Dribble', unlocked: false, cost: 6, parent: 'root', branch: 'dribble' },
  { id: 'pass1', x: 380, y: 470, type: 'Pass', unlocked: false, cost: 6, parent: 'dribble1', branch: 'pass' },
  { id: 'plus1', x: 500, y: 470, type: 'Plus', value: 6, unlocked: false, cost: 0, parent: 'dribble1', branch: 'dribble' },

  // right-lower gate
  { id: 'defense1', x: 600, y: 350, type: 'Defense', unlocked: false, cost: 6, parent: 'root', branch: 'defense' },
  { id: 'gate1', x: 560, y: 440, type: 'Gate', unlocked: false, cost: 0, parent: 'defense1', branch: 'defense' },

  // sample plus circles on vertical chain (like screenshot middle)
  { id: 'plus2', x: 500, y: 360, type: 'Plus', value: 6, unlocked: false, cost: 0, parent: 'root', branch: 'pass' },
  { id: 'plus3', x: 500, y: 420, type: 'Plus', value: 6, unlocked: false, cost: 0, parent: 'plus2', branch: 'pass' }
];

// Edges are polylines with right-angle segments (to mimic image)
const initialEdges = [
  // root to shot path
  { id: 'e_r_s1', branch: 'shot', points: [[500,300],[580,300],[650,260]] },
  { id: 'e_s1_s2', branch: 'shot', points: [[650,260],[710,240],[760,225]] },
  { id: 'e_s2_s3', branch: 'shot', points: [[760,225],[800,240],[840,270]] },

  // left lower chain
  { id: 'e_r_d1', branch: 'dribble', points: [[500,300],[480,340],[450,420]] },
  { id: 'e_d1_p1', branch: 'pass', points: [[450,420],[420,450],[380,470]] },
  { id: 'e_d1_plus1', branch: 'dribble', points: [[450,420],[470,440],[500,470]] },

  // defense gate path
  { id: 'e_r_def1', branch: 'defense', points: [[500,300],[560,320],[600,350]] },
  { id: 'e_def1_gate', branch: 'defense', points: [[600,350],[580,390],[560,440]] },

  // middle vertical small pluses
  { id: 'e_r_plus2', branch: 'pass', points: [[500,300],[500,360]] },
  { id: 'e_plus2_plus3', branch: 'pass', points: [[500,360],[500,420]] }
];

const AbilityTree = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selecting, setSelecting] = useState(null); // node for technique selection
  const totalLP = 25;
  const [usedLP, setUsedLP] = useState(7); // some pre-spent

  const nodeById = useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);

  const lpLeft = totalLP - usedLP;

  const isUnlockable = (n) => {
    if (!n) return false;
    if (n.unlocked) return false;
    if (!n.parent) return true;
    return !!nodeById[n.parent]?.unlocked;
  };

  const handleNodeClick = (n) => {
    if (!n) return;
    if (n.type === 'Plus' || n.type === 'Gate') return; // not selectable
    if (!isUnlockable(n)) return;
    if ((n.cost || 0) > lpLeft) return;
    if (n.type === 'Shot' || n.type === 'Dribble' || n.type === 'Pass' || n.type === 'Defense') {
      setSelecting(n);
    }
  };

  const unlockWithTechnique = (tech) => {
    if (!selecting) return;
    setNodes(prev => prev.map(x => x.id === selecting.id ? { ...x, unlocked: true, technique: tech } : x));
    setUsedLP(v => v + (selecting.cost || 0));
    setSelecting(null);
  };

  // SVG helpers
  const renderGlowDefs = () => (
    <defs>
      <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <radialGradient id="orb-red" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FF5A3C"/>
        <stop offset="70%" stopColor="#D63A2A"/>
        <stop offset="100%" stopColor="#6B1D14"/>
      </radialGradient>
      <radialGradient id="orb-blue" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#7DD3FC"/>
        <stop offset="70%" stopColor="#38BDF8"/>
        <stop offset="100%" stopColor="#0EA5E9"/>
      </radialGradient>
      <radialGradient id="orb-green" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#86EFAC"/>
        <stop offset="70%" stopColor="#22C55E"/>
        <stop offset="100%" stopColor="#16A34A"/>
      </radialGradient>
      <radialGradient id="orb-purple" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#E9D5FF"/>
        <stop offset="70%" stopColor="#A78BFA"/>
        <stop offset="100%" stopColor="#7C3AED"/>
      </radialGradient>
    </defs>
  );

  const Edge = ({ points, branch, active }) => {
    const color = active ? branchColors[branch] : 'rgba(255,255,255,0.28)';
    const width = active ? 4 : 2;
    const glow = active ? 'url(#glow-strong)' : 'none';
    const d = points.map((p,i) => `${i===0?'M':'L'} ${p[0]} ${p[1]}`).join(' ');
    return (
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" filter={active ? 'url(#glow-strong)' : undefined} />
    );
  };

  const Node = ({ n }) => {
    const unlockable = isUnlockable(n) && (lpLeft >= (n.cost || 0));
    const commonProps = { onClick: () => handleNodeClick(n), style: { cursor: unlockable ? 'pointer' : 'default' } };

    if (n.type === 'Shot') {
      const active = n.unlocked;
      return (
        <g {...commonProps}>
          {active && (<circle cx={n.x} cy={n.y} r={26} fill={branchColors['shot']} opacity="0.3" />)}
          <circle cx={n.x} cy={n.y} r={22} fill="url(#orb-red)" stroke="#0B0B0B" strokeWidth={3} filter={active ? 'url(#glow-strong)' : undefined} />
          <circle cx={n.x} cy={n.y} r={12} fill="#B91C1C" opacity="0.9" />
          {/* icon */}
          <foreignObject x={n.x-8} y={n.y-8} width="16" height="16">
            <div className="w-4 h-4 text-white" style={{ lineHeight: 0 }}><TypeIcon type="Shot" /></div>
          </foreignObject>
          {!n.unlocked && n.cost ? (
            <foreignObject x={n.x-18} y={n.y+24} width="36" height="18">
              <div className="w-full h-full text-[11px] text-white bg-black/70 border border-white/20 rounded px-1 flex items-center justify-center">+{n.cost}</div>
            </foreignObject>
          ) : null}
        </g>
      );
    }

    if (n.type === 'Dribble' || n.type === 'Pass' || n.type === 'Defense') {
      const grad = n.type === 'Dribble' ? 'url(#orb-green)' : n.type === 'Pass' ? 'url(#orb-blue)' : 'url(#orb-purple)';
      const active = n.unlocked;
      return (
        <g {...commonProps}>
          {active && (<circle cx={n.x} cy={n.y} r={24} fill={branchColors[n.branch]} opacity="0.3" />)}
          <circle cx={n.x} cy={n.y} r={20} fill={grad} stroke="#0B0B0B" strokeWidth={3} filter={active ? 'url(#glow-strong)' : undefined} />
          <circle cx={n.x} cy={n.y} r={10} fill="rgba(0,0,0,0.35)" />
          <foreignObject x={n.x-8} y={n.y-8} width="16" height="16">
            <div className="w-4 h-4 text-white" style={{ lineHeight: 0 }}><TypeIcon type={n.type} /></div>
          </foreignObject>
          {!n.unlocked && n.cost ? (
            <foreignObject x={n.x-18} y={n.y+22} width="36" height="18">
              <div className="w-full h-full text-[11px] text-white bg-black/70 border border-white/20 rounded px-1 flex items-center justify-center">+{n.cost}</div>
            </foreignObject>
          ) : null}
        </g>
      );
    }

    if (n.type === 'Plus') {
      return (
        <g>
          <circle cx={n.x} cy={n.y} r={15} fill="url(#orb-blue)" stroke="#0B0B0B" strokeWidth={2} />
          <text x={n.x} y={n.y+4} textAnchor="middle" fontSize="12" fill="#00111E" fontWeight="700">+{n.value || 6}</text>
        </g>
      );
    }

    if (n.type === 'Gate') {
      return (
        <g>
          <circle cx={n.x} cy={n.y} r={16} fill="url(#orb-purple)" stroke="#0B0B0B" strokeWidth={3} />
          <foreignObject x={n.x-7} y={n.y-7} width="14" height="14">
            <div className="w-3.5 h-3.5 text-white" style={{ lineHeight: 0 }}><Lock className="h-3.5 w-3.5" /></div>
          </foreignObject>
        </g>
      );
    }

    // Core
    return (
      <g>
        <circle cx={n.x} cy={n.y} r={22} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
      </g>
    );
  };

  // Edge active if child unlocked (so path glows progressively)
  const edgeActive = (edge) => {
    // infer by closest end point mapping to a node and checking unlocked
    const last = edge.points[edge.points.length - 1];
    // find closest node to the end
    let closest = null, dmin = 999999;
    nodes.forEach(n => {
      const dx = n.x - last[0], dy = n.y - last[1];
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < dmin) { dmin = d; closest = n; }
    });
    return closest?.unlocked;
  };

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        {/* Top bar mimic */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-white text-2xl font-semibold tracking-wider">SPEC</div>
          <div className="rounded-xl px-4 py-2 text-right" style={{ background: 'linear-gradient(180deg, rgba(21,94,239,0.9), rgba(7,89,196,0.9))', boxShadow: '0 6px 20px rgba(0,0,0,0.25)' }}>
            <div className="text-[12px] text-blue-200">Learning Points</div>
            <div className="text-white text-lg font-bold">{lpLeft}<span className="text-blue-200">/{totalLP}p</span></div>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative rounded-xl overflow-hidden border" style={{ ...bgStyle, borderColor: 'rgba(56,189,248,0.4)' }}>
          {/* soft energy core */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,180,255,0.35) 0%, rgba(0,0,0,0) 65%)', filter: 'blur(1px)' }} />

          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" height="560" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
            {renderGlowDefs()}
            {/* edges */}
            {edges.map(e => (
              <Edge key={e.id} points={e.points} branch={e.branch} active={edgeActive(e)} />
            ))}
            {/* nodes */}
            {nodes.map(n => <Node key={n.id} n={n} />)}
          </svg>

          {/* bottom-left helper (placeholder) */}
          <div className="absolute left-2 bottom-2 text-[11px] text-blue-200/80">Use LP to unlock nodes → choose technique</div>

          {/* action buttons */}
          <div className="absolute right-3 bottom-3 flex gap-2">
            <Button className="text-black" style={{ background: logoColors.yellowOrangeGradient }} onClick={() => { setNodes(initialNodes); setEdges(initialEdges); setUsedLP(7); }}>Reset</Button>
          </div>
        </div>
      </div>

      {/* Technique Selection Modal */}
      <Dialog open={!!selecting} onOpenChange={() => setSelecting(null)}>
        <DialogContent className="max-w-2xl text-white border" style={{ backgroundColor: logoColors.blackAlpha(0.95), borderColor: logoColors.primaryBlueAlpha(0.4) }}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Select Technique</h3>
                <p className="text-sm text-gray-300 mt-1">{selecting ? `${selecting.type} · Cost +${selecting.cost} LP` : ''}</p>
              </div>
              <Badge className="bg-blue-600/30 text-blue-200 border-blue-400/30">LP Left: {lpLeft}</Badge>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto mt-2">
            {listByType(selecting?.type).map(t => (
              <div key={t.id} className="rounded-lg border p-3 hover:scale-[1.01] transition-all cursor-pointer" style={{ backgroundColor: logoColors.blackAlpha(0.5), borderColor: logoColors.primaryBlueAlpha(0.25) }} onClick={() => unlockWithTechnique(t)}>
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
            <Button variant="ghost" className="text-white hover:bg-blue-700/30" onClick={() => setSelecting(null)}>
              <X className="h-4 w-4 mr-1" /> Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AbilityTree;