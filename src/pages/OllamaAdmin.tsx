import React, { useState, useEffect } from 'react';
import { useSleeperStore } from '../store/sleeperStore';
import { processAllPlayerInsights, getMostViewedPlayersWithInsights } from '../services/playerInsightsService';
import { checkOllamaAvailability } from '../services/aiInsightsService';
import { Brain, RefreshCw, AlertTriangle, CheckCircle, Server, Database, List, User } from 'lucide-react';

const OllamaAdmin: React.FC = () => {
  const { players } = useSleeperStore();
  const [isOllamaAvailable, setIsOllamaAvailable] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStats, setProcessingStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mostViewedPlayers, setMostViewedPlayers] = useState<any[]>([]);
  const [isLoadingMostViewed, setIsLoadingMostViewed] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    const checkOllama = async () => {
      try {
        setCheckingStatus(true);
        console.log("Checking Ollama availability...");
        const available = await checkOllamaAvailability();
        console.log("Ollama availability result:", available);
        setIsOllamaAvailable(available);
      } catch (error) {
        console.error('Error checking Ollama availability:', error);
        setIsOllamaAvailable(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkOllama();
    loadMostViewedPlayers();
  }, []);

  const handleProcessAllPlayers = async () => {
    if (!isOllamaAvailable) {
      setError('Ollama is not available. Please make sure it is running on your machine.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await processAllPlayerInsights();
      setProcessingStats(result);
    } catch (error) {
      console.error('Error processing all players:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while processing players');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadMostViewedPlayers = async () => {
    setIsLoadingMostViewed(true);
    try {
      const players = await getMostViewedPlayersWithInsights(10);
      setMostViewedPlayers(players);
    } catch (error) {
      console.error('Error loading most viewed players:', error);
    } finally {
      setIsLoadingMostViewed(false);
    }
  };

  const checkOllamaStatus = async () => {
    try {
      setCheckingStatus(true);
      const available = await checkOllamaAvailability();
      setIsOllamaAvailable(available);
    } catch (error) {
      console.error('Error checking Ollama status:', error);
      setIsOllamaAvailable(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Ollama AI Admin</h1>
        <button
          onClick={checkOllamaStatus}
          disabled={checkingStatus}
          className="p-2 rounded-lg bg-white shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={20} className={checkingStatus ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Ollama Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Ollama Status</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isOllamaAvailable === null ? 'bg-gray-100 text-gray-600' :
            isOllamaAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {isOllamaAvailable === null ? 'Checking...' :
             isOllamaAvailable ? 'Available' : 'Unavailable'}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${
              isOllamaAvailable ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Server size={24} className={
                isOllamaAvailable ? 'text-green-600' : 'text-red-600'
              } />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Ollama Server</h3>
              <p className="text-sm text-gray-500">
                {isOllamaAvailable 
                  ? 'Ollama is running and ready to process player insights' 
                  : 'Ollama is not available. Please make sure it is running on your machine.'}
              </p>
            </div>
          </div>

          {!isOllamaAvailable && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-red-700">Ollama Not Available</h4>
                  <p className="text-sm text-red-600 mt-1">
                    Please make sure Ollama is running on your machine. You can start it by running:
                  </p>
                  <pre className="mt-2 p-3 bg-red-900/10 rounded text-red-700 text-sm overflow-x-auto">
                    ollama serve
                  </pre>
                  <p className="text-sm text-red-600 mt-2">
                    If you haven't installed Ollama yet, you can download it from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-red-700 underline">https://ollama.ai</a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {isOllamaAvailable && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-green-700">Ollama is Running</h4>
                  <p className="text-sm text-green-600 mt-1">
                    Ollama is available and ready to process player insights.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Process All Players */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Process All Players</h2>
        
        <div className="mb-4">
          <p className="text-gray-600">
            This will process all players in the database and generate AI insights for each one. This may take a while depending on the number of players.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleProcessAllPlayers}
            disabled={isProcessing || !isOllamaAvailable}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              isProcessing || !isOllamaAvailable
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>Process All Players</span>
              </>
            )}
          </button>

          <div className="text-sm text-gray-500">
            {Object.keys(players).length} players in database
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-4 text-red-600">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {processingStats && (
          <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-4">
            <h3 className="font-medium text-green-700 mb-2">Processing Complete</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-green-600">Processed: {processingStats.processed}</p>
                <p className="text-sm text-red-600">Errors: {processingStats.errors}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {processingStats.processed > 0 
                    ? `Success rate: ${Math.round((processingStats.processed / (processingStats.processed + processingStats.errors)) * 100)}%` 
                    : 'No players processed'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Most Viewed Players */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Most Viewed Players</h2>
          <button
            onClick={loadMostViewedPlayers}
            disabled={isLoadingMostViewed}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <RefreshCw className={`w-5 h-5 ${isLoadingMostViewed ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoadingMostViewed ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : mostViewedPlayers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Has Insights
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mostViewedPlayers.map((item) => (
                  <tr key={item.player?.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {item.player?.first_name?.charAt(0)}{item.player?.last_name?.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.player?.first_name} {item.player?.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.player?.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.player?.team}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.views}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.insights ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.insights ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No player view data available
          </div>
        )}
      </div>
    </div>
  );
};

export default OllamaAdmin;