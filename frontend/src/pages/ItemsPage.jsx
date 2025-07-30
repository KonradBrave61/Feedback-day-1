import React from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Package } from 'lucide-react';

const ItemsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-orange-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Items</h1>
          <p className="text-gray-300">Manage your character items and equipment</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-400" />
                Items System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                The items system is currently under development. This page will contain:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Character equipment and items</li>
                <li>Item inventory management</li>
                <li>Equipment upgrades and enhancements</li>
                <li>Item crafting and fusion</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ItemsPage;