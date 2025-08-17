import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

const ComparisonContext = createContext();

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

export const ComparisonProvider = ({ children }) => {
  // Separate comparison arrays for each category
  const [comparisonData, setComparisonData] = useState({
    characters: [],
    items: [],
    techniques: [],
    coaches: []
  });

  const getItemCategory = (item) => {
    // Determine category based on item properties
    if (item.position && item.base_stats) return 'characters';
    if (item.category && item.rarity && item.stats) return 'items';
    if (item.technique_type || item.type) return 'techniques';
    if (item.title && item.bonuses) return 'coaches';
    return 'characters'; // default fallback
  };

  const addToComparison = (item, category = null) => {
    const itemCategory = category || getItemCategory(item);
    const currentItems = comparisonData[itemCategory] || [];
    
    // Check if item is already in comparison for this category
    if (currentItems.find(i => i.id === item.id)) {
      toast.info(`${item.name} is already in comparison`);
      return;
    }
    
    // Limit to maximum 6 items per category
    if (currentItems.length >= 6) {
      toast.warning('Maximum 6 items can be compared per category. Remove an item first.');
      return;
    }
    
    setComparisonData(prev => ({
      ...prev,
      [itemCategory]: [...currentItems, item]
    }));
    toast.success(`${item.name} added to ${itemCategory} comparison!`);
  };

  const removeFromComparison = (itemId, category = null) => {
    if (category) {
      setComparisonData(prev => ({
        ...prev,
        [category]: prev[category].filter(i => i.id !== itemId)
      }));
    } else {
      // Remove from all categories if no category specified
      setComparisonData(prev => ({
        characters: prev.characters.filter(i => i.id !== itemId),
        items: prev.items.filter(i => i.id !== itemId),
        techniques: prev.techniques.filter(i => i.id !== itemId),
        coaches: prev.coaches.filter(i => i.id !== itemId)
      }));
    }
  };

  const clearComparison = (category = null) => {
    if (category) {
      setComparisonData(prev => ({
        ...prev,
        [category]: []
      }));
      toast.success(`${category} comparison cleared!`);
    } else {
      setComparisonData({
        characters: [],
        items: [],
        techniques: [],
        coaches: []
      });
      toast.success('All comparisons cleared!');
    }
  };

  const isInComparison = (itemId, category = null) => {
    if (category) {
      return comparisonData[category]?.some(i => i.id === itemId) || false;
    }
    // Check all categories if no category specified
    return Object.values(comparisonData).some(items => items.some(i => i.id === itemId));
  };

  const getCompareItems = (category) => {
    return comparisonData[category] || [];
  };

  const canAddMore = (category) => {
    return (comparisonData[category]?.length || 0) < 6;
  };

  const value = {
    comparisonData,
    compareItems: [], // Keep for backward compatibility, will be overridden in ComparisonTool
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    getCompareItems,
    canAddMore
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};