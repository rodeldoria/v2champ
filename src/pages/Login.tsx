import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSleeperStore } from '../store/sleeperStore';
import { Brain, Trophy, Star, TrendingUp, ChevronRight, Mail, ArrowRight, MessageSquare, User, Lock, AlertTriangle, Moon, Sun } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useThemeStore } from '../store/themeStore';

const Login: React.FC = () => {
  const { currentUser, setCurrentUser } = useSleeperStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showFeedbackBot, setShowFeedbackBot] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthUI, setShowAuthUI] = useState(false);
  const [bypassLogin, setBypassLogin] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Auto-bypass login
  useEffect(() => {
    // Create a guest user
    const guestUser = {
      user_id: 'guest-' + Math.random().toString(36).substring(2, 9),
      username: 'guest',
      display_name: 'Guest User',
      avatar: null
    };
    
    // Set the guest user in the store
    setCurrentUser(guestUser);
    
    // Navigate to the dashboard
    navigate('/');
  }, [navigate, setCurrentUser]);
  
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Send email to info@fantasychamps.com (which redirects to rodeliodoria@gmail.com)
      const mailtoLink = `mailto:info@fantasychamps.com?subject=Fantasy Champs AI Interest&body=I'm interested in learning more about Fantasy Champs AI. Please contact me at: ${email}`;
      window.open(mailtoLink, '_blank');
      
      setSubmitted(true);
      setEmail('');
      
      // Show feedback bot after submission
      setTimeout(() => {
        setShowFeedbackBot(true);
      }, 2000);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username
            }
          }
        });
        
        if (error) throw error;
        
        // Create user preferences record
        if (data.user) {
          await supabase.from('user_preferences').upsert({
            user_id: data.user.id,
            username: username,
            theme: theme,
            onboarding_completed: false
          });
        }
        
        // Show success message
        setSubmitted(true);
        setEmail('');
        setPassword('');
        setUsername('');
        
        // Show feedback bot after submission
        setTimeout(() => {
          setShowFeedbackBot(true);
        }, 2000);
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        // Navigate to dashboard on successful login
        navigate('/');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setAuthError(error.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackMessage.trim()) {
      // Send feedback to info@fantasychamps.com
      const mailtoLink = `mailto:info@fantasychamps.com?subject=Fantasy Champs AI Feedback&body=${encodeURIComponent(feedbackMessage)}`;
      window.open(mailtoLink, '_blank');
      
      setFeedbackSubmitted(true);
      setFeedbackMessage('');
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setAuthError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      alert('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      setAuthError(error.message || 'An error occurred while sending the reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipLogin = () => {
    // Create a guest user
    const guestUser = {
      user_id: 'guest-' + Math.random().toString(36).substring(2, 9),
      username: 'guest',
      display_name: 'Guest User',
      avatar: null
    };
    
    // Set the guest user in the store
    setCurrentUser(guestUser);
    
    // Navigate to the dashboard
    navigate('/');
  };
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900'}`}>
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white text-primary-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold">
              FC
            </div>
            <span className="text-white font-semibold">Fantasy Champs AI</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={handleSkipLogin}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Skip Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm mb-6">
          <span className="text-white/80 text-sm font-medium">🚀 Early Access Preview</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          AI-Powered Fantasy Football <br className="hidden md:block" />
          <span className={theme === 'dark' ? 'text-blue-300' : 'text-primary-300'}>Domination</span>
        </h1>
        
        <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
          Get AI-powered insights, real-time analytics, and smart predictions to make winning decisions in your fantasy leagues.
        </p>

        {/* Email Signup */}
        <div className="max-w-md mx-auto mb-16">
          {!submitted ? (
            showAuthUI ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </h2>
                  <p className="text-white/80 mt-2">
                    {isSignUp ? 'Join Fantasy Champs AI' : 'Welcome back'}
                  </p>
                </div>
                
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-white/90 mb-1">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                        <input
                          type="text"
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-white placeholder-white/50"
                          placeholder="Choose a username"
                          required={isSignUp}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-white placeholder-white/50"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-white placeholder-white/50"
                        placeholder={isSignUp ? "Create a password" : "Enter your password"}
                        required
                      />
                    </div>
                  </div>
                  
                  {authError && (
                    <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg flex items-start">
                      <AlertTriangle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-primary-500 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-600'
                    }`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        {isSignUp ? 'Create Account' : 'Sign In'}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>
                  
                  {!isSignUp && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-white/70 hover:text-white text-sm"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-primary-300 hover:text-primary-200 font-medium"
                    >
                      {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowAuthUI(false)}
                      className="text-white/70 hover:text-white"
                    >
                      Back to Email Signup
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-grow">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for early access"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-white placeholder-white/50"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center"
                >
                  Get Early Access
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </form>
            )
          ) : (
            <div className="bg-green-500/20 text-green-100 p-4 rounded-lg">
              <p className="font-medium">Thanks for your interest!</p>
              <p className="text-sm mt-1">We'll notify you when we launch new features.</p>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button 
                  onClick={() => navigate('/players')}
                  className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg font-medium"
                >
                  Try the MVP Now
                </button>
                <button 
                  onClick={() => setShowAuthUI(true)}
                  className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features Grid with Agent Workflow Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <Brain className="w-8 h-8 mb-4 text-primary-300" />
            <h3 className="text-lg font-semibold mb-2">AI Draft Assistant</h3>
            <p className="text-white/80">Get personalized draft recommendations and real-time analysis of your picks</p>
            <img 
              src="https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
              alt="AI Draft Assistant" 
              className="w-full h-32 object-cover rounded-lg mt-4"
            />
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <Trophy className="w-8 h-8 mb-4 text-primary-300" />
            <h3 className="text-lg font-semibold mb-2">Juggernaut Mode</h3>
            <p className="text-white/80">Coming soon: Dominate your league with advanced AI strategies and custom game modes</p>
            <img 
              src="https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
              alt="Juggernaut Mode" 
              className="w-full h-32 object-cover rounded-lg mt-4"
            />
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <TrendingUp className="w-8 h-8 mb-4 text-primary-300" />
            <h3 className="text-lg font-semibold mb-2">Coin Economy & Buffs</h3>
            <p className="text-white/80">Coming soon: Earn coins for accurate predictions and spend them on player buffs and modifiers</p>
            <img 
              src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
              alt="Coin Economy" 
              className="w-full h-32 object-cover rounded-lg mt-4"
            />
          </div>
        </div>

        {/* Coming Soon Section */}
        <section className="py-12 border-t border-white/10">
          <h2 className="text-3xl font-bold text-white mb-8">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-left">
              <h3 className="text-xl font-semibold text-white mb-3">Advanced Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <ChevronRight className="text-primary-300 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-white/90">Custom AI-powered trade analyzer</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-primary-300 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-white/90">Player comparison with predictive analytics</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-primary-300 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-white/90">Matchup probability forecasting</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-primary-300 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-white/90">Waiver wire recommendations</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-left">
              <h3 className="text-xl font-semibold text-white mb-3">Premium Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <ChevronRight className="text-primary-300 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-white/90">Player Buffs & Modifiers</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-primary-300 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-white/90">In-app coin economy for rewards</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-primary-300 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-white/90">Advanced player injury analysis</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="text-primary-300 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-white/90">Weather impact reports</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12">
          <div className="bg-gradient-to-r from-primary-800 to-primary-900 backdrop-blur-sm rounded-xl p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Try the MVP Today</h2>
            <p className="text-white/80 mb-6">
              Our MVP is available now with basic features. Sign up to be notified when we launch new features and get early access to premium tools.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/players')}
                className="bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-lg font-medium"
              >
                Try the MVP
              </button>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg font-medium"
              >
                Sign Up for Updates
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-white/60">
        <p>© {new Date().getFullYear()} Fantasy Champs AI. All rights reserved.</p>
        <p className="text-sm mt-2">
          This is an MVP for demonstration purposes. Features and data may not be complete.
        </p>
        <p className="text-sm mt-2">
          <a href="mailto:info@fantasychamps.com" className="hover:text-white">info@fantasychamps.com</a>
        </p>
      </footer>

      {/* Feedback Chatbot */}
      {showFeedbackBot && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden w-80">
            <div className="bg-primary-600 text-white p-3 flex justify-between items-center">
              <div className="flex items-center">
                <MessageSquare size={18} className="mr-2" />
                <h3 className="font-semibold">Feedback Bot</h3>
              </div>
              <button 
                onClick={() => setShowFeedbackBot(false)}
                className="text-white/80 hover:text-white"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              {!feedbackSubmitted ? (
                <>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Thanks for your interest in Fantasy Champs AI! We'd love to hear what features you're most excited about.
                  </p>
                  <form onSubmit={handleFeedbackSubmit}>
                    <textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Share your thoughts or feature requests..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 mb-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      rows={4}
                      required
                    ></textarea>
                    <button
                      type="submit"
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium"
                    >
                      Submit Feedback
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Thank You!</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your feedback has been submitted. We appreciate your input!
                  </p>
                  <button
                    onClick={() => setShowFeedbackBot(false)}
                    className="mt-3 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                  >
                    Close
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

export default Login;