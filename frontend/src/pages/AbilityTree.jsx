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
  const { user } = useContext(AuthContext);
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showTechniqueDetail, setShowTechniqueDetail] = useState(false);
  const [nodes, setNodes] = useState(abilityTreeData.nodes);
  const [availableLP, setAvailableLP] = useState(abilityTreeData.learningPoints.current);

  // Get node by ID
  const getNodeById = (id) => nodes.find(n => n.id === id);

  // Check if a node can be unlocked
  const canUnlockNode = (node) => {
    if (node.unlocked) return false;
    if (node.cost > availableLP) return false;
    if (!node.parent) return true; // Root nodes
    const parent = getNodeById(node.parent);
    return parent && parent.unlocked;
  };

  // Handle node click
  const handleNodeClick = (node) => {
    if (node.type === 'character') return;
    
    if (canUnlockNode(node)) {
      if (node.type === 'technique') {
        setSelectedNode(node);
        setShowTechniqueDetail(true);
      } else {
        // Unlock stat boost or other nodes directly
        unlockNode(node);
      }
    }
  };

  // Unlock a node
  const unlockNode = (node) => {
    setNodes(prev => prev.map(n => 
      n.id === node.id ? { ...n, unlocked: true } : n
    ));
    setAvailableLP(prev => prev - node.cost);
    setShowTechniqueDetail(false);
  };

  // Render connection lines
  const renderConnections = () => {
    return abilityTreeData.connections.map(conn => {
      const fromNode = getNodeById(conn.from);
      const toNode = getNodeById(conn.to);
      if (!fromNode || !toNode) return null;

      const isActive = fromNode.unlocked && toNode.unlocked;
      const strokeColor = isActive ? conn.color : 'rgba(255,255,255,0.3)';
      const strokeWidth = isActive ? 3 : 2;

      return (
        <line
          key={`${conn.from}-${conn.to}`}
          x1={fromNode.x}
          y1={fromNode.y}
          x2={toNode.x}
          y2={toNode.y}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity={isActive ? 1 : 0.6}
          filter={isActive ? 'url(#glow)' : 'none'}
        />
      );
    });
  };

  // Render individual nodes
  const renderNode = (node) => {
    const isClickable = canUnlockNode(node);
    const isUnlocked = node.unlocked;

    if (node.type === 'character') {
      return (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={35}
            fill="url(#characterGradient)"
            stroke="#FFFFFF"
            strokeWidth={3}
            filter="url(#glow)"
          />
          <foreignObject x={node.x - 30} y={node.y - 30} width={60} height={60}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              12
            </div>
          </foreignObject>
        </g>
      );
    }

    if (node.type === 'technique') {
      const orbColor = isUnlocked ? '#FF6B47' : (isClickable ? '#FF8B6B' : '#666666');
      return (
        <g key={node.id} style={{ cursor: isClickable ? 'pointer' : 'default' }} onClick={() => handleNodeClick(node)}>
          <circle
            cx={node.x}
            cy={node.y}
            r={25}
            fill={orbColor}
            stroke="#FFFFFF"
            strokeWidth={isUnlocked ? 3 : 2}
            opacity={isUnlocked ? 1 : (isClickable ? 0.8 : 0.4)}
            filter={isUnlocked ? 'url(#glow)' : 'none'}
          />
          {!isUnlocked && (
            <foreignObject x={node.x - 8} y={node.y - 8} width={16} height={16}>
              <div className="w-4 h-4 text-white">
                <Zap className="w-4 h-4" />
              </div>
            </foreignObject>
          )}
          {!isUnlocked && node.cost > 0 && (
            <foreignObject x={node.x - 12} y={node.y + 30} width={24} height={16}>
              <div className="bg-black/70 text-white text-xs px-1 py-0.5 rounded text-center border border-white/30">
                +{node.cost}
              </div>
            </foreignObject>
          )}
        </g>
      );
    }

    if (node.type === 'stat_boost') {
      const orbColor = isUnlocked ? '#4A9EFF' : (isClickable ? '#6AB5FF' : '#666666');
      return (
        <g key={node.id} style={{ cursor: isClickable ? 'pointer' : 'default' }} onClick={() => handleNodeClick(node)}>
          <circle
            cx={node.x}
            cy={node.y}
            r={20}
            fill={orbColor}
            stroke="#FFFFFF"
            strokeWidth={isUnlocked ? 3 : 2}
            opacity={isUnlocked ? 1 : (isClickable ? 0.8 : 0.4)}
          />
          <text
            x={node.x}
            y={node.y + 4}
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            +{node.boost?.value || 5}
          </text>
          {!isUnlocked && node.cost > 0 && (
            <foreignObject x={node.x - 12} y={node.y + 25} width={24} height={16}>
              <div className="bg-black/70 text-white text-xs px-1 py-0.5 rounded text-center border border-white/30">
                +{node.cost}
              </div>
            </foreignObject>
          )}
        </g>
      );
    }

    if (node.type === 'gate') {
      return (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={18}
            fill="#A855F7"
            stroke="#FFFFFF"
            strokeWidth={2}
            opacity={0.7}
          />
          <foreignObject x={node.x - 8} y={node.y - 8} width={16} height={16}>
            <div className="w-4 h-4 text-white">
              <Lock className="w-4 h-4" />
            </div>
          </foreignObject>
        </g>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen text-white" style={cosmicBackground}>
      <Navigation />
      
      {/* Top Character Info Panel */}
      <div className="container mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          {/* SPEC Label */}
          <div className="text-white text-3xl font-bold tracking-wider">
            SPEC
          </div>
          
          {/* Character Info Card */}
          <div className="flex items-center gap-4 bg-blue-900/30 rounded-lg px-4 py-2 border border-blue-500/30">
            <img 
              src={abilityTreeData.character.avatar} 
              alt={abilityTreeData.character.name}
              className="w-12 h-12 rounded-full border-2 border-white/50"
            />
            <div>
              <div className="text-white font-medium">{abilityTreeData.character.name}</div>
              <div className="text-blue-300 text-sm">Lv. {abilityTreeData.character.level}</div>
            </div>
          </div>
          
          {/* Learning Points */}
          <div className="bg-blue-600/80 rounded-lg px-4 py-2 text-center border border-blue-400/30">
            <div className="text-blue-200 text-xs font-medium">ラーニングポイント</div>
            <div className="text-white text-xl font-bold">
              {availableLP}<span className="text-blue-300">/{abilityTreeData.learningPoints.total}P</span>
            </div>
          </div>
        </div>

        {/* Ability Tree Canvas */}
        <div className="relative bg-black/20 rounded-xl border border-blue-500/30 overflow-hidden">
          <svg 
            ref={svgRef}
            viewBox="0 0 1000 600" 
            className="w-full h-[600px]"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Gradients and Effects */}
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <radialGradient id="characterGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#60A5FA"/>
                <stop offset="50%" stopColor="#3B82F6"/>
                <stop offset="100%" stopColor="#1E40AF"/>
              </radialGradient>
            </defs>

            {/* Connection Lines */}
            {renderConnections()}
            
            {/* Skill Nodes */}
            {nodes.map(renderNode)}
          </svg>
        </div>
      </div>

      {/* Technique Detail Modal */}
      {showTechniqueDetail && selectedNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTechniqueDetail(false)}>
          <div 
            className="bg-gradient-to-br from-blue-900/95 to-purple-900/95 rounded-lg border border-blue-400/50 p-6 max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-blue-300 text-sm font-medium">選択アビリティを装備しよう</div>
              <button 
                onClick={() => setShowTechniqueDetail(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-blue-800/30 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">{selectedNode.technique?.name}</div>
                  <div className="text-blue-300 text-sm">{selectedNode.technique?.type}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-white font-bold text-lg">{selectedNode.technique?.power}</div>
                  <div className="text-blue-300 text-xs">TENSION</div>
                </div>
              </div>
              
              <div className="text-white/90 text-sm leading-relaxed">
                {selectedNode.technique?.description}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowTechniqueDetail(false)}
                className="flex-1 bg-gray-600/50 text-white px-4 py-2 rounded-lg border border-gray-500/30 hover:bg-gray-600/70 transition-colors"
              >
                キャンセル
              </button>
              <button 
                onClick={() => unlockNode(selectedNode)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg border border-blue-500/30 hover:bg-blue-700 transition-colors font-medium"
              >
                装備
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbilityTree;