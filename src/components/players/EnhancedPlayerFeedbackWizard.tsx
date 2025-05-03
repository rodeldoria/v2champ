import React, { useState, useEffect } from 'react';
import { Brain, ChevronRight, ChevronLeft, Check, MessageSquare, X, Star, Shield, Activity, TrendingUp, BarChart2 } from 'lucide-react';
import { Player } from '../../types/sleeper';
import { supabase } from '../../lib/supabase';
import { useSleeperStore } from '../../store/sleeperStore';

interface FeedbackStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetElement: string;
}

interface EnhancedPlayerFeedbackWizardProps {
  player: Player | null;
  onComplete: () => void;
}

export const EnhancedPlayerFeedbackWizard: React.FC<EnhancedPlayerFeedbackWizardProps> = ({ player, onComplete }) => {
  const { currentUser } = useSleeperStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [feedbackMessages, setFeedbackMessages] = useState<string[]>([]);
  const [enhancedFeedback, setEnhancedFeedback] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openAIKey, setOpenAIKey] = useState(localStorage.getItem('openai_key') || '');
  const [apiCallCount, setApiCallCount] = useState(parseInt(localStorage.getItem('api_call_count') || '0'));
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState('');
  const [currentEnhancedFeedback, setCurrentEnhancedFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const MAX_API_CALLS = 10; // Maximum number of free API calls

  const steps: FeedbackStep[] = [
    {
      id: 'header',
      title: 'Player Header',
      description: 'How clear and useful is the player header information?',
      icon: <Shield size={20} className="text-primary-500" />,
      targetElement: '.player-header'
    },
    {
      id: 'summary',
      title: 'Season Summary',
      description: 'Are the season summary charts informative and easy to understand?',
      icon: <BarChart2 size={20} className="text-green-500" />,
      targetElement: '.player-season-summary'
    },
    {
      id: 'athletic',
      title: 'Athletic Profile',
      description: 'How useful is the athletic profile information?',
      icon: <Activity size={20} className="text-blue-500" />,
      targetElement: '.player-attributes'
    },
    {
      id: 'performance',
      title: 'Game Performance',
      description: 'Is the game performance data presented effectively?',
      icon: <TrendingUp size={20} className="text-orange-500" />,
      targetElement: '.player-stats-table'
    },
    {
      id: 'news',
      title: 'News & Social',
      description: 'How trustworthy and useful are the news and social feeds?',
      icon: <MessageSquare size={20} className="text-purple-500" />,
      targetElement: '.player-news'
    },
    {
      id: 'ai',
      title: 'AI Scout Analysis',
      description: 'How actionable and insightful is the AI analysis?',
      icon: <Brain size={20} className="text-primary-500" />,
      targetElement: '.ai-scout-notes'
    }
  ];

  // Initialize feedback arrays
  useEffect(() => {
    setFeedbackMessages(Array(steps.length).fill(''));
    setEnhancedFeedback(Array(steps.length).fill(''));
  }, []);

  // Apply overlay to target element
  useEffect(() => {
    const applyOverlay = () => {
      // First, remove any existing overlays
      document.querySelectorAll('.feedback-overlay').forEach(el => el.remove());
      
      // Find the target element
      const targetElement = document.querySelector(steps[currentStep].targetElement);
      if (!targetElement) return;
      
      // Get the position and dimensions of the target element
      const rect = targetElement.getBoundingClientRect();
      
      // Create an overlay div
      const overlay = document.createElement('div');
      overlay.className = 'feedback-overlay';
      overlay.style.position = 'absolute';
      overlay.style.top = `${rect.top + window.scrollY}px`;
      overlay.style.left = `${rect.left + window.scrollX}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.zIndex = '40';
      overlay.style.borderRadius = '8px';
      overlay.style.pointerEvents = 'none';
      
      document.body.appendChild(overlay);
    };
    
    applyOverlay();
    
    // Reapply overlay on scroll or resize
    window.addEventListener('scroll', applyOverlay);
    window.addEventListener('resize', applyOverlay);
    
    return () => {
      window.removeEventListener('scroll', applyOverlay);
      window.removeEventListener('resize', applyOverlay);
      document.querySelectorAll('.feedback-overlay').forEach(el => el.remove());
    };
  }, [currentStep]);

  const enhanceFeedbackWithAI = async () => {
    if (!currentFeedback.trim()) return;
    
    // Check if we've exceeded the API call limit
    if (apiCallCount >= MAX_API_CALLS && !openAIKey) {
      setShowApiKeyForm(true);
      return;
    }
    
    setIsEnhancing(true);
    
    try {
      // Use the user's API key if provided, otherwise use the default key
      const key = openAIKey || import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!key) {
        throw new Error('No OpenAI API key available');
      }
      
      // Simulate AI enhancement with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create enhanced feedback
      const stepInfo = steps[currentStep];
      const enhanced = `Feedback on ${stepInfo.title}:

${currentFeedback}

Key Suggestions:
- ${currentFeedback.split('.')[0]}
- Consider improving the visual hierarchy
- Add more contextual information

Actionable Items:
1. Enhance the ${stepInfo.id} section with more detailed metrics
2. Improve the layout for better readability
3. Add tooltips to explain complex statistics`;

      // Update the enhanced feedback for the current step
      setCurrentEnhancedFeedback(enhanced);
      
      // Increment API call count
      const newCount = apiCallCount + 1;
      setApiCallCount(newCount);
      localStorage.setItem('api_call_count', newCount.toString());
      
    } catch (error) {
      console.error('Error enhancing feedback:', error);
      setCurrentEnhancedFeedback(currentFeedback);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleNext = () => {
    // Save feedback for current step
    const newFeedbackMessages = [...feedbackMessages];
    newFeedbackMessages[currentStep] = currentFeedback;
    setFeedbackMessages(newFeedbackMessages);
    
    const newEnhancedFeedback = [...enhancedFeedback];
    newEnhancedFeedback[currentStep] = currentEnhancedFeedback || currentFeedback;
    setEnhancedFeedback(newEnhancedFeedback);
    
    // Move to next step or complete
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentFeedback('');
      setCurrentEnhancedFeedback('');
    } else {
      handleSubmitAllFeedback();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      // Save current feedback before going back
      const newFeedbackMessages = [...feedbackMessages];
      newFeedbackMessages[currentStep] = currentFeedback;
      setFeedbackMessages(newFeedbackMessages);
      
      const newEnhancedFeedback = [...enhancedFeedback];
      newEnhancedFeedback[currentStep] = currentEnhancedFeedback || currentFeedback;
      setEnhancedFeedback(newEnhancedFeedback);
      
      // Go to previous step
      setCurrentStep(currentStep - 1);
      setCurrentFeedback(feedbackMessages[currentStep - 1]);
      setCurrentEnhancedFeedback(enhancedFeedback[currentStep - 1]);
    }
  };

  const handleSubmitAllFeedback = async () => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    
    try {
      // Combine all feedback into one document
      const combinedFeedback = steps.map((step, index) => {
        return `## ${step.title}\n${enhancedFeedback[index] || feedbackMessages[index] || 'No feedback provided'}\n\n`;
      }).join('');
      
      // Save to database
      await supabase.from('user_preferences').upsert({
        user_id: currentUser.user_id,
        feedback: combinedFeedback,
        onboarding_completed: true
      });
      
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('openai_key', openAIKey);
    setShowApiKeyForm(false);
    enhanceFeedbackWithAI();
  };

  const isCurrentStepValid = () => {
    return currentFeedback.trim().length > 0;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <h2 className="text-2xl font-bold">Player Data Feedback Wizard</h2>
          <p className="text-white/80 mt-1">
            Complete this feedback wizard to unlock all player data and features
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < currentStep
                    ? 'bg-primary-500 text-white'
                    : index === currentStep
                      ? 'bg-primary-100 text-primary-600 border-2 border-primary-500'
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <Check size={16} />
                  ) : (
                    step.icon
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-8 md:w-16 ${
                    index < currentStep ? 'bg-primary-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Step Content */}
        {!feedbackSubmitted ? (
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                {steps[currentStep].icon}
                <span className="ml-2">{steps[currentStep].title}</span>
                <span className="ml-2 text-sm text-gray-500">({currentStep + 1}/{steps.length})</span>
              </h3>
              <p className="text-gray-600 mt-1">{steps[currentStep].description}</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  Please provide feedback on the {steps[currentStep].title.toLowerCase()} section of the player details page.
                  Your insights will help us improve the user experience.
                </p>
              </div>
              
              <textarea
                value={currentFeedback}
                onChange={(e) => setCurrentFeedback(e.target.value)}
                placeholder={`What do you think about the ${steps[currentStep].title.toLowerCase()} section? Is it useful? How could it be improved?`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                rows={4}
                required
              ></textarea>
              
              <div className="flex justify-end">
                <button
                  onClick={enhanceFeedbackWithAI}
                  disabled={!currentFeedback.trim() || isEnhancing}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    !currentFeedback.trim() || isEnhancing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  }`}
                >
                  {isEnhancing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Brain size={16} className="mr-2" />
                      Enhance with AI
                    </>
                  )}
                </button>
              </div>
              
              {currentEnhancedFeedback && (
                <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
                  <h4 className="font-medium text-primary-700 mb-2 flex items-center">
                    <Brain size={16} className="mr-2" />
                    Enhanced Feedback
                  </h4>
                  <pre className="text-sm text-primary-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-primary-100">
                    {currentEnhancedFeedback}
                  </pre>
                </div>
              )}
              
              {/* API Key Form */}
              {showApiKeyForm && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">API Quota Exceeded</h4>
                  <p className="text-yellow-700 text-sm mb-3">
                    You've used all your free AI enhancements. Please provide your own OpenAI API key to continue using the enhancement feature.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={openAIKey}
                      onChange={(e) => setOpenAIKey(e.target.value)}
                      placeholder="sk-..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                    <button
                      onClick={saveApiKey}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                    >
                      Save Key
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Your API key is stored locally and never sent to our servers.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 flex-1 overflow-y-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Thank You for Your Feedback!</h3>
            <p className="text-gray-600 mb-6">
              Your insights will help us improve Fantasy Champs AI. You now have full access to all player data and features.
            </p>
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Explore Player Details
            </button>
          </div>
        )}
        
        {/* Footer */}
        {!feedbackSubmitted && (
          <div className="p-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-lg flex items-center ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={!isCurrentStepValid() || isSubmitting}
              className={`px-4 py-2 rounded-lg flex items-center ${
                !isCurrentStepValid() || isSubmitting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  Finish & Unlock
                  <Check size={16} className="ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};