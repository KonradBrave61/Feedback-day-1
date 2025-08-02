import React from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Zap } from 'lucide-react';
import { logoColors } from '../styles/colors';

const TechniquesPage = () => {
  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Techniques</h1>
          <p className="text-gray-300">Master powerful techniques and special moves</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="backdrop-blur-lg text-white border"
                style={{ 
                  backgroundColor: logoColors.blackAlpha(0.3),
                  borderColor: logoColors.primaryBlueAlpha(0.2)
                }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                Techniques System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                The techniques system is currently under development. This page will contain:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Character special moves and techniques</li>
                <li>Technique learning and mastery</li>
                <li>Combo techniques and team moves</li>
                <li>Technique training and upgrades</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TechniquesPage;