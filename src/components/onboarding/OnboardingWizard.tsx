import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, MessageSquare, User, Star, Shield, Brain, X } from 'lucide-react';
import { useSleeperStore } from '../../store/sleeperStore';
import { supabase } from '../../lib/supabase';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useSleeperStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [showFeedbackBot, setShowFeedbackBot] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [enhancedFeedback, setEnhancedFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isGeneratingEnhancement, setIsGeneratingEnhancement] = useState(false);
  const [username, setUsername] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [favoritePosition, setFavoritePosition] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [isWizardCompleted, setIsWizardCompleted] = useState(false);

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!currentUser) return;
      
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', currentUser.user_id)
          .single();
        
        if (data && data.onboarding_completed) {
          setIsWizardCompleted(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };
    
    checkOnboardingStatus();
  }, [currentUser]);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Fantasy Champs AI',
      description: 'Let\'s get to know you better so we can personalize your experience.',
      component: (
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Tell us your name</h3>
          <div className="max-w-md mx-auto">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name or username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 mb-4"
              required
            />
            <p className="text-gray-500 text-sm">
              This helps us personalize your experience and address you properly.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'favorite-team',
      title: 'Your Favorite Team',
      description: 'Tell us which NFL team you support.',
      component: (
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={40} className="text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Select your favorite NFL team</h3>
          <div className="max-w-md mx-auto">
            <select
              value={favoriteTeam}
              onChange={(e) => setFavoriteTeam(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 mb-4"
              required
            >
              <option value="">Select a team</option>
              <option value="ARI">Arizona Cardinals</option>
              <option value="ATL">Atlanta Falcons</option>
              <option value="BAL">Baltimore Ravens</option>
              <option value="BUF">Buffalo Bills</option>
              <option value="CAR">Carolina Panthers</option>
              <option value="CHI">Chicago Bears</option>
              <option value="CIN">Cincinnati Bengals</option>
              <option value="CLE">Cleveland Browns</option>
              <option value="DAL">Dallas Cowboys</option>
              <option value="DEN">Denver Broncos</option>
              <option value="DET">Detroit Lions</option>
              <option value="GB">Green Bay Packers</option>
              <option value="HOU">Houston Texans</option>
              <option value="IND">Indianapolis Colts</option>
              <option value="JAX">Jacksonville Jaguars</option>
              <option value="KC">Kansas City Chiefs</option>
              <option value="LV">Las Vegas Raiders</option>
              <option value="LAC">Los Angeles Chargers</option>
              <option value="LAR">Los Angeles Rams</option>
              <option value="MIA">Miami Dolphins</option>
              <option value="MIN">Minnesota Vikings</option>
              <option value="NE">New England Patriots</option>
              <option value="NO">New Orleans Saints</option>
              <option value="NYG">New York Giants</option>
              <option value="NYJ">New York Jets</option>
              <option value="PHI">Philadelphia Eagles</option>
              <option value="PIT">Pittsburgh Steelers</option>
              <option value="SF">San Francisco 49ers</option>
              <option value="SEA">Seattle Seahawks</option>
              <option value="TB">Tampa Bay Buccaneers</option>
              <option value="TEN">Tennessee Titans</option>
              <option value="WAS">Washington Commanders</option>
            </select>
            <p className="text-gray-500 text-sm">
              We'll highlight news and players from your favorite team.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'favorite-position',
      title: 'Favorite Position',
      description: 'Which position do you prioritize in fantasy football?',
      component: (
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star size={40} className="text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Select your favorite position</h3>
          <div className="max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setFavoritePosition(pos)}
                  className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                    favoritePosition === pos
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-sm">
              This helps us tailor player recommendations to your preferences.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'experience',
      title: 'Fantasy Experience',
      description: 'Tell us about your fantasy football experience.',
      component: (
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain size={40} className="text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">What's your experience level?</h3>
          <div className="max-w-md mx-auto">
            <div className="space-y-3 mb-4">
              {[
                { id: 'beginner', label: 'Beginner (1-2 years)' },
                { id: 'intermediate', label: 'Intermediate (3-5 years)' },
                { id: 'advanced', label: 'Advanced (6-10 years)' },
                { id: 'expert', label: 'Expert (10+ years)' }
              ].map((level) => (
                <button
                  key={level.id}
                  onClick={() => setExperienceLevel(level.id)}
                  className={`w-full py-3 px-4 rounded-lg border-2 text-left transition-colors ${
                    experienceLevel === level.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-sm">
              We'll adjust our AI recommendations based on your experience level.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'feedback',
      title: 'Share Your Feedback',
      description: 'Help us improve Fantasy Champs AI with your feedback.',
      component: (
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare size={40} className="text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">What features are you most excited about?</h3>
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setShowFeedbackBot(true)}
              className="w-full py-3 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center"
            >
              <MessageSquare size={18} className="mr-2" />
              Open Feedback Chat
            </button>
            <p className="text-gray-500 text-sm mt-4">
              Your feedback helps us prioritize features and improve the platform.
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    // Mark current step as completed
    setCompleted(prev => ({
      ...prev,
      [steps[currentStep].id]: true
    }));

    // Move to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepCompleted = (stepIndex: number): boolean => {
    return !!completed[steps[stepIndex].id];
  };

  const isCurrentStepValid = (): boolean => {
    const currentStepId = steps[currentStep].id;
    
    switch (currentStepId) {
      case 'welcome':
        return !!username.trim();
      case 'favorite-team':
        return !!favoriteTeam;
      case 'favorite-position':
        return !!favoritePosition;
      case 'experience':
        return !!experienceLevel;
      case 'feedback':
        return feedbackSubmitted || showFeedbackBot;
      default:
        return true;
    }
  };

  const enhanceFeedback = async (feedback: string) => {
    setIsGeneratingEnhancement(true);
    
    try {
      // Simulate AI enhancement with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create enhanced feedback
      const enhanced = `User Feedback Summary:
      
Name: ${username}
Favorite Team: ${favoriteTeam}
Favorite Position: ${favoritePosition}
Experience Level: ${experienceLevel}

Feedback: ${feedback}

Key Points:
- ${feedback.split('.')[0]}
- User is interested in ${favoritePosition} position analysis
- User has ${experienceLevel} experience level
- ${favoriteTeam} team-specific insights would be valuable

Suggested Features:
- Enhanced ${favoritePosition} player analytics
- ${favoriteTeam} team coverage
- Difficulty level adjusted for ${experienceLevel} users`;

      setEnhancedFeedback(enhanced);
    } catch (error) {
      console.error('Error enhancing feedback:', error);
      setEnhancedFeedback(feedback);
    } finally {
      setIsGeneratingEnhancement(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackMessage.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Enhance the feedback first
      await enhanceFeedback(feedbackMessage);
      
      // Save user preferences and mark onboarding as completed
      if (currentUser) {
        await supabase.from('user_preferences').upsert({
          user_id: currentUser.user_id,
          favorite_teams: [favoriteTeam],
          onboarding_completed: true,
          feedback: enhancedFeedback || feedbackMessage,
          username: username,
          favorite_position: favoritePosition,
          experience_level: experienceLevel
        });
      }
      
      setFeedbackSubmitted(true);
      setShowFeedbackBot(false);
      
      // Mark the feedback step as completed
      setCompleted(prev => ({
        ...prev,
        feedback: true
      }));
      
      // Update the current user with the username if provided
      if (username && currentUser) {
        setCurrentUser({
          ...currentUser,
          display_name: username
        });
      }
      
      // Set wizard as completed
      setIsWizardCompleted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If the wizard is already completed, don't show it
  if (isWizardCompleted) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary-600 text-white p-6">
          <h2 className="text-2xl font-bold">Fantasy Champs AI Setup</h2>
          <p className="text-white/80 mt-1">
            Complete this quick setup to unlock all player data and features
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isStepCompleted(index)
                    ? 'bg-primary-500 text-white'
                    : index === currentStep
                      ? 'bg-primary-100 text-primary-600 border-2 border-primary-500'
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {isStepCompleted(index) ? (
                    <Check size={16} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-12 md:w-24 ${
                    isStepCompleted(index) ? 'bg-primary-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{steps[0].title}</span>
            <span className="text-right">{steps[steps.length - 1].title}</span>
          </div>
        </div>
        
        {/* Step Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700">{steps[currentStep].title}</h3>
            <p className="text-gray-500">{steps[currentStep].description}</p>
          </div>
          
          <div className="py-4">
            {steps[currentStep].component}
          </div>
        </div>
        
        {/* Footer */}
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
            disabled={!isCurrentStepValid() || currentStep === steps.length - 1}
            className={`px-4 py-2 rounded-lg flex items-center ${
              !isCurrentStepValid() || currentStep === steps.length - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
      
      {/* Feedback Chatbot */}
      {showFeedbackBot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-primary-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center">
                <MessageSquare size={18} className="mr-2" />
                <h3 className="font-semibold">AI Feedback Assistant</h3>
              </div>
              <button 
                onClick={() => setShowFeedbackBot(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              {!feedbackSubmitted ? (
                <>
                  <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">
                      Hi {username || 'there'}! I'm your AI feedback assistant. I'll help you provide valuable feedback about Fantasy Champs AI.
                    </p>
                    <p className="text-gray-700 mt-2">
                      What features are you most excited about? Any suggestions for improvement?
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Share your thoughts, feature requests, or suggestions..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                      rows={6}
                      required
                    ></textarea>
                    
                    {enhancedFeedback && (
                      <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
                        <h4 className="font-medium text-primary-700 mb-2 flex items-center">
                          <Brain size={16} className="mr-2" />
                          Enhanced Feedback
                        </h4>
                        <pre className="text-sm text-primary-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-primary-100">
                          {enhancedFeedback}
                        </pre>
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => enhanceFeedback(feedbackMessage)}
                        disabled={!feedbackMessage.trim() || isGeneratingEnhancement}
                        className={`flex-1 py-2 px-4 rounded-lg border border-primary-500 text-primary-600 flex items-center justify-center ${
                          !feedbackMessage.trim() || isGeneratingEnhancement
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-primary-50'
                        }`}
                      >
                        {isGeneratingEnhancement ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Brain size={16} className="mr-2" />
                            Enhance Feedback
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={handleFeedbackSubmit}
                        disabled={!feedbackMessage.trim() || isSubmitting}
                        className={`flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg flex items-center justify-center ${
                          !feedbackMessage.trim() || isSubmitting
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-primary-600'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          'Submit Feedback'
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">Thank You!</h4>
                  <p className="text-gray-600 mb-6">
                    Your feedback has been submitted successfully. You now have full access to all player data and features!
                  </p>
                  <button
                    onClick={() => {
                      setShowFeedbackBot(false);
                      setIsWizardCompleted(true);
                    }}
                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Start Exploring
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};