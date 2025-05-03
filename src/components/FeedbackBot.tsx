import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Brain, Send } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useSleeperStore } from '../store/sleeperStore';

interface FeedbackBotProps {
  onClose?: () => void;
  onSubmit?: (feedback: string, enhanced: string) => void;
  initialMessage?: string;
}

export const FeedbackBot: React.FC<FeedbackBotProps> = ({ 
  onClose, 
  onSubmit,
  initialMessage = "Thanks for your interest in Fantasy Champs AI! We'd love to hear what features you're most excited about."
}) => {
  const { theme } = useThemeStore();
  const { currentUser } = useSleeperStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [enhancedFeedback, setEnhancedFeedback] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [messages, setMessages] = useState<{role: 'bot' | 'user', content: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Open the bot after a short delay
    const timer = setTimeout(() => {
      setIsOpen(true);
      // Add initial message
      setMessages([
        { 
          role: 'bot', 
          content: `Hi ${currentUser?.display_name || 'there'}! ${initialMessage}`
        }
      ]);
    }, 2000);

    return () => clearTimeout(timer);
  }, [initialMessage, currentUser]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const enhanceFeedback = async () => {
    if (!feedbackMessage.trim()) return;
    
    setIsEnhancing(true);
    
    try {
      // Add user message to chat
      setMessages(prev => [...prev, { role: 'user', content: feedbackMessage }]);
      
      // Simulate AI enhancement with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create enhanced feedback
      const enhanced = `I've analyzed your feedback:

${feedbackMessage}

Key Points:
- ${feedbackMessage.split('.')[0]}
- You're interested in AI-powered features
- You want personalized insights

Suggested Features:
- Enhanced player analytics
- Personalized recommendations
- Real-time updates`;

      setEnhancedFeedback(enhanced);
      
      // Add enhanced feedback to chat
      setMessages(prev => [...prev, { role: 'bot', content: enhanced }]);
      
      // Clear input
      setFeedbackMessage('');
    } catch (error) {
      console.error('Error enhancing feedback:', error);
      setEnhancedFeedback(feedbackMessage);
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "I'm sorry, I couldn't enhance your feedback. Would you like to try again?" 
      }]);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: feedbackMessage }]);
    
    setIsSubmitting(true);
    
    try {
      // Enhance the feedback
      await enhanceFeedback();
      
      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(feedbackMessage, enhancedFeedback || feedbackMessage);
      }
      
      // Add thank you message
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "Thank you for your feedback! Your insights will help us improve Fantasy Champs AI." 
      }]);
      
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "I'm sorry, there was an error submitting your feedback. Please try again." 
      }]);
    } finally {
      setIsSubmitting(false);
      setFeedbackMessage('');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return null;
  }

  if (isMinimized) {
    return (
      <button
        onClick={toggleMinimize}
        className="fixed bottom-4 right-4 z-50 p-4 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-all duration-300 transform hover:scale-110 animate-fade-in"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden w-80 md:w-96 flex flex-col transition-all duration-300 transform`}>
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-3 flex justify-between items-center">
          <div className="flex items-center">
            <MessageSquare size={18} className="mr-2" />
            <h3 className="font-semibold">Feedback Assistant</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleMinimize}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Minimize"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button 
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {/* Chat messages */}
        <div className="p-4 flex-1 overflow-y-auto max-h-80 bg-gray-50 dark:bg-gray-900">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isEnhancing && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <input
              type="text"
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="Type your feedback..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              disabled={isSubmitting || feedbackSubmitted}
            />
            <button
              type="submit"
              disabled={!feedbackMessage.trim() || isSubmitting || feedbackSubmitted}
              className={`px-3 py-2 rounded-r-lg flex items-center justify-center transition-colors ${
                !feedbackMessage.trim() || isSubmitting || feedbackSubmitted
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-primary-500 text-white hover:bg-primary-600 dark:hover:bg-primary-400'
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          
          {feedbackSubmitted && (
            <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              Thank you for your feedback! You can close this chat now.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};