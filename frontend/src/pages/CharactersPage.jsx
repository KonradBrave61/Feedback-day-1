import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CharactersPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-6 text-white border-white/20 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Main
        </Button>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Characters Page
          </h1>
          <p className="text-gray-300 mb-8">
            This will redirect back to the main page as requested.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Character Gallery
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CharactersPage;