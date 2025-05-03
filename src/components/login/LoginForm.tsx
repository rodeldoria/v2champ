import React, { useState } from 'react';
import { useSleeperStore } from '../../store/sleeperStore';
import { ArrowRight, Loader2, Mail, MessageSquare, User, Lock, AlertTriangle } from 'lucide-react';
import { supabase, signIn, signUp, resetPassword } from '../../lib/supabase';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showFeedbackBot, setShowFeedbackBot] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  const { fetchUserByUsername, userError } = useSleeperStore();
  
  const handleSleeperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter your Sleeper username');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await fetchUserByUsername(username.trim());
    } catch (err) {
      setError('Invalid username. Please check your Sleeper username and try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
    setError('');
    
    try {
      if (isSignUp) {
        // Sign up
        await signUp(email, password, username);
        setSubmitted(true);
        
        // Show feedback bot after submission
        setTimeout(() => {
          setShowFeedbackBot(true);
        }, 2000);
      } else {
        // Sign in
        await signIn(email, password);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await resetPassword(email);
      alert('Password reset email sent. Please check your inbox.');
      setShowPasswordReset(false);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'An error occurred while sending the reset email');
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
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {showPasswordReset ? 'Reset Password' : 
             showEmailForm ? 'Get Early Access' : 
             isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="text-white/80 mt-2">
            {showPasswordReset ? 'Enter your email to reset your password' : 
             showEmailForm ? 'Be the first to know when we launch new features' : 
             isSignUp ? 'Join Fantasy Champs AI' : 'Welcome back'}
          </p>
        </div>
        
        {showPasswordReset ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-white/90 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="email"
                  id="reset-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-white placeholder-white/50"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
                {error}
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
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setShowPasswordReset(false)}
              className="w-full text-white/80 hover:text-white py-2 px-4 rounded-lg font-medium"
            >
              Back to Sign In
            </button>
          </form>
        ) : showEmailForm ? (
          <>
            {!submitted ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1">
                    Your Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-white placeholder-white/50"
                      placeholder="Enter your email for updates"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  Get Early Access
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(false);
                    setIsSignUp(false);
                  }}
                  className="w-full text-white/80 hover:text-white py-2 px-4 rounded-lg font-medium"
                >
                  Back to Sign In
                </button>
              </form>
            ) : (
              <div className="bg-green-500/20 text-green-100 p-4 rounded-lg">
                <p className="font-medium">Thanks for your interest!</p>
                <p className="text-sm mt-1">We'll notify you when we launch new features.</p>
                <button
                  onClick={() => {
                    setShowEmailForm(false);
                    setIsSignUp(false);
                    setSubmitted(false);
                  }}
                  className="mt-4 w-full bg-white/10 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </>
        ) : (
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
              <label htmlFor="auth-email" className="block text-sm font-medium text-white/90 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="email"
                  id="auth-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-white placeholder-white/50"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium text-white/90 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="password"
                  id="auth-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-white placeholder-white/50"
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg flex items-start">
                <AlertTriangle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                <span>{error}</span>
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
                <Loader2 className="w-5 h-5 animate-spin" />
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
                  onClick={() => setShowPasswordReset(true)}
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
                onClick={() => setShowEmailForm(true)}
                className="text-white/70 hover:text-white text-sm"
              >
                Just want updates? Sign up for our newsletter
              </button>
            </div>
            
            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/10 flex-grow"></div>
              <span className="mx-4 text-white/60 text-sm">or</span>
              <div className="border-t border-white/10 flex-grow"></div>
            </div>
            
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full bg-white/10 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              Continue as Guest
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            By signing up, you agree to our{' '}
            <a 
              href="#" 
              className="text-primary-300 hover:text-primary-200 font-medium"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a 
              href="#" 
              className="text-primary-300 hover:text-primary-200 font-medium"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Feedback Chatbot */}
      {showFeedbackBot && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden w-80">
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
                  <p className="text-gray-700 mb-3">
                    Thanks for your interest in Fantasy Champs AI! We'd love to hear what features you're most excited about.
                  </p>
                  <form onSubmit={handleFeedbackSubmit}>
                    <textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Share your thoughts or feature requests..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 mb-3"
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
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">Thank You!</h4>
                  <p className="text-gray-600">
                    Your feedback has been submitted. We appreciate your input!
                  </p>
                  <button
                    onClick={() => setShowFeedbackBot(false)}
                    className="mt-3 text-primary-600 hover:text-primary-700 font-medium"
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