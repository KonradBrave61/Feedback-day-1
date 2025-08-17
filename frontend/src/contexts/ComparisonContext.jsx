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
  const [compareItems, setCompareItems] = useState([]);

  const addToComparison = (item) => {
    // Check if item is already in comparison
    if (compareItems.find(i => i.id === item.id)) {
      toast.info(`${item.name} is already in comparison`);
      return;
    }
    
    // Limit to maximum 6 items for comparison
    if (compareItems.length >= 6) {
      toast.warning('Maximum 6 items can be compared. Remove an item first.');
      return;
    }
    
    setCompareItems(prev => [...prev, item]);
    toast.success(`${item.name} added to comparison!`);
  };

  const removeFromComparison = (itemId) => {
    setCompareItems(prev => prev.filter(i => i.id !== itemId));
  };

  const clearComparison = () => {
    setCompareItems([]);
    toast.success('Comparison cleared!');
  };

  const isInComparison = (itemId) => {
    return compareItems.some(i => i.id === itemId);
  };

  const value = {
    compareItems,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddMore: compareItems.length < 6
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};