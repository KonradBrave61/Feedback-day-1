import React, { useState, useRef, useEffect, useContext } from 'react';
import Navigation from '../components/Navigation';
import { AuthContext } from '../contexts/AuthContext';
import { logoColors } from '../styles/colors';
import { mockHissatsu } from '../data/mock';
import { Lock, Zap, Footprints, Target, Shield, X, Sparkles } from 'lucide-react';

// Ability tree data structure matching the screenshot layout
const abilityTreeData = {
  // Character info displayed at top
  character: {
    id: 'sakuya',
    name: '桜井スゴ',
    level: 12,
    avatar: '/api/placeholder/80/80',
    element: 'Fire'
  },
  
  // Learning points system
  learningPoints: {
    current: 18,
    total: 25
  },
  
  // Skill nodes positioned to match the screenshot
  nodes: [
    // Central character node
    { 
      id: 'center', 
      x: 500, y: 280, 
      type: 'character', 
      unlocked: true, 
      technique: null 
    },
    
    // Upper right branch (red orbs from screenshot)
    { 
      id: 'upper_right_1', 
      x: 650, y: 200, 
      type: 'technique', 
      unlocked: false, 
      cost: 6, 
      parent: 'center',
      technique: { name: '音雷', type: 'Shot', power: 138, description: 'シュート技かかった低空飛弾でかく乱する連続シュート。' }
    },
    { 
      id: 'upper_right_2', 
      x: 750, y: 170, 
      type: 'technique', 
      unlocked: false, 
      cost: 6, 
      parent: 'upper_right_1',
      technique: { name: '剛乱', type: 'Shot', power: 145, description: '剛鉄一回転をかけた低空飛弾で撹乱する連続シュート。' }
    },
    
    // Left side nodes (blue/purple nodes)
    { 
      id: 'left_1', 
      x: 350, y: 320, 
      type: 'stat_boost', 
      unlocked: false, 
      cost: 6, 
      parent: 'center',
      boost: { type: 'kick', value: 5 }
    },
    { 
      id: 'left_2', 
      x: 280, y: 380, 
      type: 'technique', 
      unlocked: false, 
      cost: 6, 
      parent: 'left_1',
      technique: { name: 'ドリブル技', type: 'Dribble', power: 98, description: 'スクリュー回転をかけた低空飛弾で攪乱する連続ドリブル。' }
    },
    
    // Lower center vertical chain
    { 
      id: 'lower_1', 
      x: 500, y: 380, 
      type: 'stat_boost', 
      unlocked: false, 
      cost: 6, 
      parent: 'center',
      boost: { type: 'technique', value: 5 }
    },
    { 
      id: 'lower_2', 
      x: 500, y: 450, 
      type: 'stat_boost', 
      unlocked: false, 
      cost: 6, 
      parent: 'lower_1',
      boost: { type: 'control', value: 5 }
    },
    
    // Right side defensive node
    { 
      id: 'right_1', 
      x: 650, y: 350, 
      type: 'technique', 
      unlocked: false, 
      cost: 6, 
      parent: 'center',
      technique: { name: 'ブロック技', type: 'Block', power: 112, description: 'スクリュー回転をかけた低空飛弾で攪乱する連続ブロック。' }
    },
    
    // Lower right gate/special node
    { 
      id: 'gate_1', 
      x: 600, y: 480, 
      type: 'gate', 
      unlocked: false, 
      cost: 0, 
      parent: 'right_1'
    }
  ],
  
  // Connection paths between nodes
  connections: [
    { from: 'center', to: 'upper_right_1', color: '#FF6B47' },
    { from: 'upper_right_1', to: 'upper_right_2', color: '#FF6B47' },
    { from: 'center', to: 'left_1', color: '#4A9EFF' },
    { from: 'left_1', to: 'left_2', color: '#4A9EFF' },
    { from: 'center', to: 'lower_1', color: '#22C55E' },
    { from: 'lower_1', to: 'lower_2', color: '#22C55E' },
    { from: 'center', to: 'right_1', color: '#A855F7' },
    { from: 'right_1', to: 'gate_1', color: '#A855F7' }
  ]
};

// Cosmic background style matching the screenshot
const cosmicBackground = {
  background: `
    radial-gradient(circle at 20% 50%, rgba(30, 144, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(0, 191, 255, 0.1) 0%, transparent 50%),
    radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.7), transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.5), transparent),
    radial-gradient(2px 2px at 160px 30px, rgba(255,255,255,0.9), transparent),
    linear-gradient(125deg, #001827 0%, #003785 35%, #0066CC 100%)
  `
};

const AbilityTree = () => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selecting, setSelecting] = useState(null); // selected node for inline card
  const [anchor, setAnchor] = useState(null); // {left, top} relative to container
  const totalLP = 25;
  const [usedLP, setUsedLP] = useState(7); // some pre-spent

  const nodeById = useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);

  const lpLeft = totalLP - usedLP;

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSelecting(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isUnlockable = (n) => {
    if (!n) return false;
    if (n.unlocked) return false;
    if (!n.parent) return true;
    return !!nodeById[n.parent]?.unlocked;
  };

  const handleNodeClick = (n, evt) => {
    if (!n) return;
    if (n.type === 'Plus' || n.type === 'Gate') return; // not selectable
    if (!isUnlockable(n)) return;
    if ((n.cost || 0) > lpLeft) return;
    if (n.type === 'Shot' || n.type === 'Dribble' || n.type === 'Pass' || n.type === 'Defense') {
      // Anchor relative to container so it sticks during scroll and layout
      const svgRect = svgRef.current?.getBoundingClientRect();
      const contRect = containerRef.current?.getBoundingClientRect();
      if (svgRect && contRect) {
        const px = svgRect.left + (n.x / VIEW_W) * svgRect.width;
        const py = svgRect.top + (n.y / VIEW_H) * svgRect.height;
        setAnchor({ left: px - contRect.left, top: py - contRect.top });
      } else {
        setAnchor({ left: window.innerWidth / 2, top: window.innerHeight / 2 });
      }
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
    const commonProps = { onClick: (evt) => handleNodeClick(n, evt), style: { cursor: unlockable ? 'pointer' : 'default' } };

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
          {/* inline selection state popup */}
          {selecting && anchor && (
            <div
              className="absolute z-50 w-[340px] rounded-lg border shadow-xl"
              style={{
                left: Math.max(12, Math.min(anchor.x - 160, window.innerWidth - 360)) - (document.querySelector('body')?.getBoundingClientRect()?.left || 0),
                top: Math.max(12, anchor.y + 16) - (document.querySelector('body')?.getBoundingClientRect()?.top || 0),
                backgroundColor: logoColors.blackAlpha(0.92),
                borderColor: logoColors.primaryBlueAlpha(0.35)
              }}
            >
              <div className="p-3 border-b" style={{ borderColor: logoColors.primaryBlueAlpha(0.2) }}>
                <div className="flex items-center justify-between">
                  <div className="text-white text-sm font-semibold">Select {selecting.type}</div>
                  <div className="text-[11px] px-2 py-0.5 rounded bg-blue-600/30 text-blue-200 border" style={{ borderColor: logoColors.primaryBlueAlpha(0.3) }}>Cost +{selecting.cost} LP</div>
                </div>
              </div>
              <div className="max-h-[260px] overflow-y-auto">
                {listByType(selecting.type).map(t => (
                  <button
                    key={t.id}
                    onClick={() => unlockWithTechnique(t)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-800/30 flex items-center gap-3"
                    style={{ borderBottom: `1px solid ${logoColors.primaryBlueAlpha(0.12)}` }}
                  >
                    <img src={t.icon} alt={t.name} className="w-7 h-7" />
                    <div className="min-w-0">
                      <div className="text-white text-sm font-medium truncate">{t.name}</div>
                      <div className="text-[11px] text-gray-300 truncate">{t.description}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-2 flex justify-end">
                <Button variant="ghost" className="text-white hover:bg-blue-700/30" onClick={() => setSelecting(null)}>
                  <X className="h-4 w-4 mr-1" /> Close
                </Button>
              </div>
            </div>
          )}


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
        <div ref={containerRef} className="relative rounded-xl overflow-hidden border" style={{ ...bgStyle, borderColor: 'rgba(56,189,248,0.4)' }}>
          {/* soft energy core */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,180,255,0.35) 0%, rgba(0,0,0,0) 65%)', filter: 'blur(1px)' }} />

          <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" height="560" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
            {renderGlowDefs()}
            {/* edges */}
            {edges.map(e => (
              <Edge key={e.id} points={e.points} branch={e.branch} active={edgeActive(e)} />
            ))}
            {/* nodes */}
            {nodes.map(n => <Node key={n.id} n={n} />)}
          </svg>

          {/* inline selection state popup */}
          {selecting && anchor && (
            <div
              className="absolute z-50 w-[340px] rounded-lg border shadow-xl"
              style={{
                left: Math.min(Math.max(12, anchor.left - 160), (containerRef.current?.clientWidth || 360) - 360),
                top: Math.min(Math.max(12, anchor.top + 18), (560 - 300)),
                backgroundColor: logoColors.blackAlpha(0.92),
                borderColor: logoColors.primaryBlueAlpha(0.35)
              }}
            >
              <div className="p-3 border-b" style={{ borderColor: logoColors.primaryBlueAlpha(0.2) }}>
                <div className="flex items-center justify-between">
                  <div className="text-white text-sm font-semibold">Select {selecting.type}</div>
                  <div className="text-[11px] px-2 py-0.5 rounded bg-blue-600/30 text-blue-200 border" style={{ borderColor: logoColors.primaryBlueAlpha(0.3) }}>Cost +{selecting.cost} LP</div>
                </div>
              </div>
              <div className="max-h-[260px] overflow-y-auto">
                {listByType(selecting.type).map(t => (
                  <button
                    key={t.id}
                    onClick={() => unlockWithTechnique(t)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-800/30 flex items-center gap-3"
                    style={{ borderBottom: `1px solid ${logoColors.primaryBlueAlpha(0.12)}` }}
                  >
                    <img src={t.icon} alt={t.name} className="w-7 h-7" />
                    <div className="min-w-0">
                      <div className="text-white text-sm font-medium truncate">{t.name}</div>
                      <div className="text-[11px] text-gray-300 truncate">{t.description}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-2 flex justify-end">
                <Button variant="ghost" className="text-white hover:bg-blue-700/30" onClick={() => setSelecting(null)}>
                  <X className="h-4 w-4 mr-1" /> Close
                </Button>
              </div>
            </div>
          )}

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