import React, { useState, useRef, useContext } from 'react';
import Navigation from '../components/Navigation';
import { AuthContext } from '../contexts/AuthContext';
import { logoColors } from '../styles/colors';
import { Lock, Zap, X } from 'lucide-react';

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
  const { user } = useContext(AuthContext) || {};
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
        React.createElement('line', {
          key: `${conn.from}-${conn.to}`,
          x1: fromNode.x,
          y1: fromNode.y,
          x2: toNode.x,
          y2: toNode.y,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          opacity: isActive ? 1 : 0.6,
          filter: isActive ? 'url(#glow)' : 'none'
        })
      );
    });
  };

  // Render individual nodes
  const renderNode = (node) => {
    const isClickable = canUnlockNode(node);
    const isUnlocked = node.unlocked;

    if (node.type === 'character') {
      return (
        React.createElement('g', { key: node.id }, [
          React.createElement('circle', {
            key: 'char-circle',
            cx: node.x,
            cy: node.y,
            r: 35,
            fill: 'url(#characterGradient)',
            stroke: '#FFFFFF',
            strokeWidth: 3,
            filter: 'url(#glow)'
          }),
          React.createElement('foreignObject', {
            key: 'char-content',
            x: node.x - 30,
            y: node.y - 30,
            width: 60,
            height: 60
          }, React.createElement('div', {
            className: 'w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg'
          }, '12'))
        ])
      );
    }

    if (node.type === 'technique') {
      const orbColor = isUnlocked ? '#FF6B47' : (isClickable ? '#FF8B6B' : '#666666');
      return (
        React.createElement('g', { 
          key: node.id, 
          style: { cursor: isClickable ? 'pointer' : 'default' },
          onClick: () => handleNodeClick(node)
        }, [
          React.createElement('circle', {
            key: 'tech-circle',
            cx: node.x,
            cy: node.y,
            r: 25,
            fill: orbColor,
            stroke: '#FFFFFF',
            strokeWidth: isUnlocked ? 3 : 2,
            opacity: isUnlocked ? 1 : (isClickable ? 0.8 : 0.4),
            filter: isUnlocked ? 'url(#glow)' : 'none'
          }),
          !isUnlocked && React.createElement('foreignObject', {
            key: 'tech-icon',
            x: node.x - 8,
            y: node.y - 8,
            width: 16,
            height: 16
          }, React.createElement('div', {
            className: 'w-4 h-4 text-white'
          }, React.createElement(Zap, { className: 'w-4 h-4' }))),
          !isUnlocked && node.cost > 0 && React.createElement('foreignObject', {
            key: 'tech-cost',
            x: node.x - 12,
            y: node.y + 30,
            width: 24,
            height: 16
          }, React.createElement('div', {
            className: 'bg-black/70 text-white text-xs px-1 py-0.5 rounded text-center border border-white/30'
          }, `+${node.cost}`))
        ])
      );
    }

    if (node.type === 'stat_boost') {
      const orbColor = isUnlocked ? '#4A9EFF' : (isClickable ? '#6AB5FF' : '#666666');
      return (
        React.createElement('g', { 
          key: node.id, 
          style: { cursor: isClickable ? 'pointer' : 'default' },
          onClick: () => handleNodeClick(node)
        }, [
          React.createElement('circle', {
            key: 'stat-circle',
            cx: node.x,
            cy: node.y,
            r: 20,
            fill: orbColor,
            stroke: '#FFFFFF',
            strokeWidth: isUnlocked ? 3 : 2,
            opacity: isUnlocked ? 1 : (isClickable ? 0.8 : 0.4)
          }),
          React.createElement('text', {
            key: 'stat-text',
            x: node.x,
            y: node.y + 4,
            textAnchor: 'middle',
            fill: 'white',
            fontSize: '12',
            fontWeight: 'bold'
          }, `+${node.boost?.value || 5}`),
          !isUnlocked && node.cost > 0 && React.createElement('foreignObject', {
            key: 'stat-cost',
            x: node.x - 12,
            y: node.y + 25,
            width: 24,
            height: 16
          }, React.createElement('div', {
            className: 'bg-black/70 text-white text-xs px-1 py-0.5 rounded text-center border border-white/30'
          }, `+${node.cost}`))
        ])
      );
    }

    if (node.type === 'gate') {
      return (
        React.createElement('g', { key: node.id }, [
          React.createElement('circle', {
            key: 'gate-circle',
            cx: node.x,
            cy: node.y,
            r: 18,
            fill: '#A855F7',
            stroke: '#FFFFFF',
            strokeWidth: 2,
            opacity: 0.7
          }),
          React.createElement('foreignObject', {
            key: 'gate-icon',
            x: node.x - 8,
            y: node.y - 8,
            width: 16,
            height: 16
          }, React.createElement('div', {
            className: 'w-4 h-4 text-white'
          }, React.createElement(Lock, { className: 'w-4 h-4' })))
        ])
      );
    }

    return null;
  };

  return (
    React.createElement('div', { 
      className: 'min-h-screen text-white',
      style: cosmicBackground
    }, [
      React.createElement(Navigation, { key: 'nav' }),
      
      React.createElement('div', { 
        key: 'container',
        className: 'container mx-auto px-4 pt-6'
      }, [
        // Top Character Info Panel
        React.createElement('div', { 
          key: 'top-panel',
          className: 'flex items-center justify-between mb-4'
        }, [
          // SPEC Label
          React.createElement('div', {
            key: 'spec-label',
            className: 'text-white text-3xl font-bold tracking-wider'
          }, 'SPEC'),
          
          // Character Info Card
          React.createElement('div', {
            key: 'char-info',
            className: 'flex items-center gap-4 bg-blue-900/30 rounded-lg px-4 py-2 border border-blue-500/30'
          }, [
            React.createElement('img', {
              key: 'char-avatar',
              src: abilityTreeData.character.avatar,
              alt: abilityTreeData.character.name,
              className: 'w-12 h-12 rounded-full border-2 border-white/50'
            }),
            React.createElement('div', { key: 'char-details' }, [
              React.createElement('div', {
                key: 'char-name',
                className: 'text-white font-medium'
              }, abilityTreeData.character.name),
              React.createElement('div', {
                key: 'char-level',
                className: 'text-blue-300 text-sm'
              }, `Lv. ${abilityTreeData.character.level}`)
            ])
          ]),
          
          // Learning Points
          React.createElement('div', {
            key: 'lp-display',
            className: 'bg-blue-600/80 rounded-lg px-4 py-2 text-center border border-blue-400/30'
          }, [
            React.createElement('div', {
              key: 'lp-label',
              className: 'text-blue-200 text-xs font-medium'
            }, 'ラーニングポイント'),
            React.createElement('div', {
              key: 'lp-value',
              className: 'text-white text-xl font-bold'
            }, [
              availableLP,
              React.createElement('span', {
                key: 'lp-total',
                className: 'text-blue-300'
              }, `/${abilityTreeData.learningPoints.total}P`)
            ])
          ])
        ]),

        // Ability Tree Canvas
        React.createElement('div', {
          key: 'canvas',
          className: 'relative bg-black/20 rounded-xl border border-blue-500/30 overflow-hidden'
        }, [
          React.createElement('svg', {
            key: 'svg',
            ref: svgRef,
            viewBox: '0 0 1000 600',
            className: 'w-full h-[600px]',
            preserveAspectRatio: 'xMidYMid meet'
          }, [
            // Gradients and Effects
            React.createElement('defs', { key: 'defs' }, [
              React.createElement('filter', {
                key: 'glow-filter',
                id: 'glow',
                x: '-50%',
                y: '-50%',
                width: '200%',
                height: '200%'
              }, [
                React.createElement('feGaussianBlur', {
                  key: 'blur',
                  stdDeviation: '4',
                  result: 'coloredBlur'
                }),
                React.createElement('feMerge', { key: 'merge' }, [
                  React.createElement('feMergeNode', {
                    key: 'merge-blur',
                    in: 'coloredBlur'
                  }),
                  React.createElement('feMergeNode', {
                    key: 'merge-source',
                    in: 'SourceGraphic'
                  })
                ])
              ]),
              
              React.createElement('radialGradient', {
                key: 'char-gradient',
                id: 'characterGradient',
                cx: '50%',
                cy: '50%',
                r: '50%'
              }, [
                React.createElement('stop', {
                  key: 'stop1',
                  offset: '0%',
                  stopColor: '#60A5FA'
                }),
                React.createElement('stop', {
                  key: 'stop2',
                  offset: '50%',
                  stopColor: '#3B82F6'
                }),
                React.createElement('stop', {
                  key: 'stop3',
                  offset: '100%',
                  stopColor: '#1E40AF'
                })
              ])
            ]),

            // Connection Lines
            ...renderConnections(),
            
            // Skill Nodes
            ...nodes.map(renderNode)
          ])
        ])
      ]),

      // Technique Detail Modal
      showTechniqueDetail && selectedNode && React.createElement('div', {
        key: 'modal',
        className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50',
        onClick: () => setShowTechniqueDetail(false)
      }, [
        React.createElement('div', {
          key: 'modal-content',
          className: 'bg-gradient-to-br from-blue-900/95 to-purple-900/95 rounded-lg border border-blue-400/50 p-6 max-w-md mx-4',
          onClick: e => e.stopPropagation()
        }, [
          React.createElement('div', {
            key: 'modal-header',
            className: 'flex items-center justify-between mb-4'
          }, [
            React.createElement('div', {
              key: 'modal-title',
              className: 'text-blue-300 text-sm font-medium'
            }, '選択アビリティを装備しよう'),
            React.createElement('button', {
              key: 'modal-close',
              onClick: () => setShowTechniqueDetail(false),
              className: 'text-white/70 hover:text-white'
            }, React.createElement(X, { className: 'w-5 h-5' }))
          ]),
          
          React.createElement('div', {
            key: 'technique-info',
            className: 'bg-blue-800/30 rounded-lg p-4 mb-4'
          }, [
            React.createElement('div', {
              key: 'technique-header',
              className: 'flex items-center gap-3 mb-3'
            }, [
              React.createElement('div', {
                key: 'technique-icon',
                className: 'w-8 h-8 bg-red-500 rounded-full flex items-center justify-center'
              }, React.createElement(Zap, { className: 'w-4 h-4 text-white' })),
              React.createElement('div', { key: 'technique-details' }, [
                React.createElement('div', {
                  key: 'technique-name',
                  className: 'text-white font-bold text-lg'
                }, selectedNode.technique?.name),
                React.createElement('div', {
                  key: 'technique-type',
                  className: 'text-blue-300 text-sm'
                }, selectedNode.technique?.type)
              ]),
              React.createElement('div', {
                key: 'technique-power',
                className: 'ml-auto text-right'
              }, [
                React.createElement('div', {
                  key: 'power-value',
                  className: 'text-white font-bold text-lg'
                }, selectedNode.technique?.power),
                React.createElement('div', {
                  key: 'power-label',
                  className: 'text-blue-300 text-xs'
                }, 'TENSION')
              ])
            ]),
            
            React.createElement('div', {
              key: 'technique-description',
              className: 'text-white/90 text-sm leading-relaxed'
            }, selectedNode.technique?.description)
          ]),
          
          React.createElement('div', {
            key: 'modal-buttons',
            className: 'flex gap-3'
          }, [
            React.createElement('button', {
              key: 'cancel-btn',
              onClick: () => setShowTechniqueDetail(false),
              className: 'flex-1 bg-gray-600/50 text-white px-4 py-2 rounded-lg border border-gray-500/30 hover:bg-gray-600/70 transition-colors'
            }, 'キャンセル'),
            React.createElement('button', {
              key: 'equip-btn',
              onClick: () => unlockNode(selectedNode),
              className: 'flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg border border-blue-500/30 hover:bg-blue-700 transition-colors font-medium'
            }, '装備')
          ])
        ])
      ])
    ])
  );
};

export default AbilityTree;