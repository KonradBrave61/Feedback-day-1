import React from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { HelpCircle } from 'lucide-react';
import { logoColors } from '../styles/colors';

const HelperPage = () => {
  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Helper</h1>
          <p className="text-gray-300">Get help and guidance for your journey</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="backdrop-blur-lg text-white border"
                style={{ 
                  backgroundColor: logoColors.blackAlpha(0.3),
                  borderColor: logoColors.primaryBlueAlpha(0.2)
                }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                Helper System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                The helper system is currently under development. This page will contain:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Game guides and tutorials</li>
                <li>Tips and strategies</li>
                <li>FAQ and common questions</li>
                <li>Interactive help system</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelperPage;