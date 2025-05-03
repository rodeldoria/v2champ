import React, { useState, useEffect, useRef } from 'react';
import { Brain, ChevronRight, ChevronLeft, Check, MessageSquare, X, Star, Shield, Activity, TrendingUp, BarChart2 } from 'lucide-react';
import { Player } from '../../types/sleeper';
import { supabase } from '../../lib/supabase';
import { useSleeperStore } from '../../store/sleeperStore';
import { useThemeStore } from '../../store/themeStore';

interface FeedbackStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetElement: string;
}

interface PlayerFeedbackWizardProps {
  player: Player | null;
  onComplete: () => void;
}

export const PlayerFeedbackWizard: React.FC<PlayerFeedbackWizardProps> = ({ player, onComplete }) => {
  const { currentUser } = useSleeperStore();
  const { theme } = useThemeStore();
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
  const [overlayVisible, setOverlayVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  
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
      overlay.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
      overlay.style.zIndex = '40';
      overlay.style.borderRadius = '8px';
      overlay.style.pointerEvents = 'none';
      overlay.style.transition = 'all 0.3s ease-in-out';
      overlay.style.animation = 'pulse 2s infinite';
      overlay.style.border = '2px solid rgba(99, 102, 241, 0.5)';
      
      document.body.appendChild(overlay);
      setOverlayVisible(true);
    };
    
    // Apply overlay after a short delay to ensure elements are rendered
    const timer = setTimeout(() => {
      applyOverlay();
    }, 300);
    
    // Reapply overlay on scroll or resize
    window.addEventListener('scroll', applyOverlay);
    window.addEventListener('resize', applyOverlay);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', applyOverlay);
      window.removeEventListener('resize', applyOverlay);
      document.querySelectorAll('.feedback-overlay').forEach(el => el.remove());
      setOverlayVisible(false);
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          transform: 'translateY(0)',
          opacity: 1,
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
        }}
      >
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
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index < currentStep
                      ? 'bg-primary-500 text-white transform scale-110'
                      : index === currentStep
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-2 border-primary-500 transform scale-110'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {index < currentStep ? (
                    <Check size={16} className="animate-fade-in" />
                  ) : (
                    step.icon
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`h-1 w-8 md:w-16 transition-all duration-500 ${
                      index < currentStep ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Step Content */}
        {!feedbackSubmitted ? (
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="mb-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                {steps[currentStep].icon}
                <span className="ml-2">{steps[currentStep].title}</span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({currentStep + 1}/{steps.length})</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{steps[currentStep].description}</p>
            </div>
            
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  Please provide feedback on the {steps[currentStep].title.toLowerCase()} section of the player details page.
                  Your insights will help us improve the user experience.
                </p>
              </div>
              
              <textarea
                value={currentFeedback}
                onChange={(e) => setCurrentFeedback(e.target.value)}
                placeholder={`What do you think about the ${steps[currentStep].title.toLowerCase()} section? Is it useful? How could it be improved?`}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
                rows={4}
                required
              ></textarea>
              
              <div className="flex justify-end">
                <button
                  onClick={enhanceFeedbackWithAI}
                  disabled={!currentFeedback.trim() || isEnhancing}
                  className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 ${
                    !currentFeedback.trim() || isEnhancing
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800/30'
                  }`}
                >
                  {isEnhancing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-500 dark:border-primary-400 border-t-transparent rounded-full animate-spin mr-2"></div>
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
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50 rounded-lg p-4 animate-fade-in">
                  <h4 className="font-medium text-primary-700 dark:text-primary-400 mb-2 flex items-center">
                    <Brain size={16} className="mr-2" />
                    Enhanced Feedback
                  </h4>
                  <pre className="text-sm text-primary-800 dark:text-primary-300 whitespace-pre-wrap font-mono bg-white dark:bg-gray-800 p-3 rounded border border-primary-100 dark:border-primary-800/50">
                    {currentEnhancedFeedback}
                  </pre>
                </div>
              )}
              
              {/* API Key Form */}
              {showApiKeyForm && (
                <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-4 animate-fade-in">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">API Quota Exceeded</h4>
                  <p className="text-yellow-700 dark:text-yellow-500 text-sm mb-3">
                    You've used all your free AI enhancements. Please provide your own OpenAI API key to continue using the enhancement feature.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={openAIKey}
                      onChange={(e) => setOpenAIKey(e.target.value)}
                      placeholder="sk-..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    />
                    <button
                      onClick={saveApiKey}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-400 transition-colors"
                    >
                      Save Key
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Your API key is stored locally and never sent to our servers.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 flex-1 overflow-y-auto text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Thank You for Your Feedback!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your insights will help us improve Fantasy Champs AI. You now have full access to all player data and features.
            </p>
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-400 transition-colors transform hover:scale-105"
            >
              Explore Player Details
            </button>
          </div>
        )}
        
        {/* Footer */}
        {!feedbackSubmitted && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 ${
                currentStep === 0
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm'
              }`}
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={!isCurrentStepValid() || isSubmitting}
              className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 ${
                !isCurrentStepValid() || isSubmitting
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-primary-500 text-white hover:bg-primary-600 dark:hover:bg-primary-400 hover:shadow-md transform hover:translate-y-[-1px]'
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
      
      {/* Shadow overlay for the rest of the page */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-30 pointer-events-none"
        style={{
          opacity: overlayVisible ? 0.5 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      ></div>
    </div>
  );
};