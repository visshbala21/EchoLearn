import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  DocumentTextIcon, 
  SparklesIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MicrophoneIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';

import AudioRecorder from '../components/AudioRecorder';
import ASLAvatar from '../components/ASLAvatar';
import ParticleBackground from '../components/ParticleBackground';
import { apiService } from '../services/api';

const LearningSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [session, setSession] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [aslData, setAslData] = useState(null);
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState('transcribe');
  const [showDetailsView, setShowDetailsView] = useState(false);

  // Check URL parameters for direct navigation to details view
  useEffect(() => {
    console.log('=== URL PARAMETER CHECK ===');
    console.log('Current location:', window.location.href);
    console.log('Location search:', location.search);
    
    const searchParams = new URLSearchParams(location.search);
    const viewParam = searchParams.get('view');
    
    console.log('View parameter:', viewParam);
    console.log('Session ID:', sessionId);
    
    if (viewParam === 'details') {
      console.log('Details view requested via URL parameter');
      setShowDetailsView(true);
      setActiveTab('details');
      
      // Show user feedback that we're loading the details view
      toast.success('Loading session details...', {
        icon: '📋',
        duration: 2000,
      });
      
      // Force load session data if not already loaded
      if (sessionId && !session) {
        console.log('Loading session for details view...');
        loadSession();
      }
    }
    console.log('=========================');
  }, [location.search, sessionId]);

  // Check if user came from history (has session data already)
  useEffect(() => {
    console.log('=== SESSION LOADING CHECK ===');
    console.log('Session ID:', sessionId);
    console.log('Is processing:', isProcessing);
    
    if (sessionId && !isProcessing) {
      console.log('Loading session and checking for existing content...');
      // Always load session first, then check for existing content
      loadSession().then(() => {
        console.log('Session loaded, now checking for existing content...');
        checkForExistingContent();
      });
    }
    console.log('============================');
  }, [sessionId]);

  const checkForExistingContent = async () => {
    try {
      console.log('=== CONTENT CHECK ===');
      console.log('Checking for existing content...');
      const sessionData = await apiService.getSession(sessionId);
      console.log('Session data for content check:', sessionData);
      
      const hasContent = sessionData.transcription || sessionData.summary || sessionData.sign_language_data;
      console.log('Has existing content:', hasContent);
      console.log('Transcription exists:', !!sessionData.transcription);
      console.log('Summary exists:', !!sessionData.summary);
      console.log('ASL data exists:', !!sessionData.sign_language_data);
      
      if (hasContent) {
        console.log('Setting showDetailsView to true');
        setShowDetailsView(true);
        
        // Only auto-switch to details if coming from URL parameter
        const searchParams = new URLSearchParams(location.search);
        const viewParam = searchParams.get('view');
        console.log('Current view param:', viewParam);
        
        if (viewParam === 'details') {
          console.log('Auto-switching to details tab');
          setActiveTab('details');
        }
      } else {
        console.log('No existing content found');
      }
      console.log('===================');
    } catch (error) {
      console.error('Error checking session content:', error);
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    if (!sessionId) {
      console.error('No sessionId provided to loadSession');
      return;
    }

    try {
      console.log('Loading session data for ID:', sessionId);
      const sessionData = await apiService.getSession(sessionId);
      console.log('Session data loaded:', sessionData);
      
      setSession(sessionData);
      
      // Load existing data if available
      if (sessionData.transcription) {
        console.log('Found existing transcription:', sessionData.transcription);
        setTranscription(sessionData.transcription);
      }
      
      if (sessionData.sign_language_data) {
        console.log('Found existing ASL data');
        try {
          const aslData = JSON.parse(sessionData.sign_language_data);
          setAslData(aslData);
        } catch (e) {
          console.error('Error parsing ASL data:', e);
        }
      }
      
      if (sessionData.summary) {
        console.log('Found existing summary:', sessionData.summary);
        setSummary(sessionData.summary);
      } else {
        console.log('No summary found in session data');
        setSummary('');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session data');
    }
  };

  const handleTranscription = async (audioBlob) => {
    setIsProcessing(true);
    try {
      console.log('Starting transcription for audio blob:', audioBlob);
      console.log('Session ID for transcription:', sessionId);
      console.log('Current session object:', session);
      
      // Validate audio blob
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Invalid audio file - no content');
      }

      if (!sessionId) {
        throw new Error('No active session ID - please refresh the page');
      }

      // Ensure session exists in database
      if (!session) {
        console.log('Session not loaded, attempting to load...');
        await loadSession();
        if (!session) {
          throw new Error('Session could not be loaded - please refresh the page');
        }
      }

      console.log('Audio blob size:', audioBlob.size, 'bytes');
      console.log('Audio blob type:', audioBlob.type);

      const result = await apiService.transcribeAudio(audioBlob, sessionId);
      
      console.log('Transcription result:', result);
      
      // Validate the response
      if (!result) {
        throw new Error('No response from transcription service');
      }

      if (!result.success) {
        throw new Error('Transcription service returned failure status');
      }

      // Set transcription with fallback
      const transcriptionText = result.transcription || result.text || 'No transcription available';
      setTranscription(transcriptionText);
      
      // Set ASL data with error handling
      if (result.asl_translation) {
        setAslData(result.asl_translation);
      } else {
        console.warn('No ASL translation in response');
      }

      toast.success('Audio transcribed successfully!', {
        icon: '🎉',
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
        },
      });
      
      // Reload the session to ensure database is updated
      console.log('Reloading session to verify database update...');
      await loadSession();
      
      setActiveTab('results');
    } catch (error) {
      console.error('Error transcribing audio:', error);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Failed to transcribe audio. Please try again.';
      
      toast.error(errorMessage, {
        icon: '❌',
        duration: 6000,
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcription) {
      toast.error('No transcription available to summarize');
      return;
    }

    setIsGeneratingSummary(true);
    try {
      console.log('Generating summary for session:', sessionId);
      const result = await apiService.summarizeContent(sessionId);
      console.log('Summary generation result:', result);
      
      // Update only the summary state
      setSummary(result.summary);
      
      toast.success('Summary generated!', {
        icon: '✨',
        style: {
          borderRadius: '12px',
          background: '#3b82f6',
          color: '#fff',
        },
      });
      
    } catch (error) {
      console.error('Error generating summary:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Failed to generate summary. Please try again.';
      
      toast.error(errorMessage, {
        icon: '❌',
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateQuiz = async () => {
    console.log('Quiz generation requested');
    console.log('Current transcription state:', transcription);
    console.log('Current session state:', session);
    console.log('Session transcription:', session?.transcription);
    
    // Check both local state and session data
    const hasTranscription = transcription || session?.transcription;
    
    if (!hasTranscription) {
      toast.error('No transcription available for quiz generation. Please record or upload audio first.');
      return;
    }

    if (!sessionId) {
      toast.error('No active session. Please refresh the page and try again.');
      return;
    }

    console.log('Generating quiz for session:', sessionId, 'with transcription available');

    try {
      // Add loading state
      setIsGeneratingQuiz(true);
      
      const result = await apiService.generateQuiz(sessionId, 3);
      
      console.log('Quiz generation result:', result);
      
      toast.success('Quiz generated! Check the Quiz tab.', {
        icon: '🎯',
        style: {
          borderRadius: '12px',
          background: '#3b82f6',
          color: '#fff',
        },
      });
      
      // Force reload of session to get updated quiz data
      await loadSession();
      
      // Auto-switch to quiz tab to show the generated quiz
      setActiveTab('quiz');
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Failed to generate quiz. Please try again.';
      
      toast.error(errorMessage, {
        icon: '❌',
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const tabs = [
    { 
      id: 'transcribe', 
      label: 'Transcribe', 
      icon: MicrophoneIcon, 
      color: 'from-green-500 to-emerald-500',
      description: 'Record or upload audio'
    },
    { 
      id: 'results', 
      label: 'Results', 
      icon: SparklesIcon, 
      color: 'from-blue-500 to-indigo-500',
      description: 'View transcription and ASL'
    },
    { 
      id: 'quiz', 
      label: 'Quiz', 
      icon: AcademicCapIcon, 
      color: 'from-purple-500 to-pink-500',
      description: 'Test your knowledge'
    }
  ];

  // Add details tab conditionally
  if (showDetailsView) {
    tabs.unshift({
      id: 'details',
      label: 'Session Details',
      icon: DocumentTextIcon,
      color: 'from-amber-500 to-orange-500',
      description: 'Comprehensive session overview'
    });
  }

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-10 space-y-4 md:space-y-0"
        >
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back</span>
            </motion.button>
            
            <div>
              <motion.h1 
                className="text-3xl md:text-4xl font-black gradient-text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {session?.title || 'Learning Session'}
              </motion.h1>
              {session?.created_at && (
                <motion.div 
                  className="flex items-center space-x-2 text-gray-500 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <ClockIcon className="h-4 w-4" />
                  <span className="font-medium">
                    Created {new Date(session.created_at).toLocaleDateString()}
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {transcription && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="btn-secondary disabled:opacity-50 flex items-center space-x-2"
                >
                  {isGeneratingSummary ? (
                    <>
                      <div className="spinner h-4 w-4"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-5 w-5" />
                      <span>Generate Summary</span>
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <div className="spinner h-5 w-5"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <AcademicCapIcon className="h-5 w-5" />
                      <span>Create Quiz</span>
                    </>
                  )}
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-10"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-xl">
            <nav className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                      isActive
                        ? 'text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-lg">{tab.label}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBg"
                        className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl`}
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
          >
            {activeTab === 'transcribe' && (
              <div className="max-w-3xl mx-auto">
                <AudioRecorder 
                  onTranscription={handleTranscription}
                  isProcessing={isProcessing}
                />
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-8">
                {/* Transcription Results */}
                {transcription && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="card"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                      <DocumentTextIcon className="h-7 w-7 text-blue-600" />
                      <span>Transcription</span>
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    </h3>
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200/50">
                      <p className="text-gray-800 leading-relaxed text-lg">{transcription}</p>
                    </div>
                  </motion.div>
                )}

                {/* ASL Translation */}
                {aslData && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <ASLAvatar aslData={aslData} />
                  </motion.div>
                )}

                {/* Summary - Only show when generated */}
                {summary && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="card"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                      <SparklesIcon className="h-7 w-7 text-purple-600" />
                      <span>AI Summary</span>
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    </h3>
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200/50">
                      <div className="prose text-gray-800 text-lg" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br>') }} />
                    </div>
                  </motion.div>
                )}

                {!transcription && (
                  <motion.div 
                    className="text-center py-20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <ExclamationTriangleIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Content Yet</h3>
                    <p className="text-gray-500 text-lg mb-8">
                      Start by recording or uploading audio in the Transcribe tab
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('transcribe')}
                      className="btn-primary"
                    >
                      Go to Transcribe
                    </motion.button>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'quiz' && (
              <QuizSection sessionId={sessionId} activeTab={activeTab} onNavigateToTab={setActiveTab} />
            )}

            {activeTab === 'details' && (
              <SessionDetailsView 
                session={session}
                transcription={transcription}
                summary={summary}
                aslData={aslData}
                onNavigateToTab={setActiveTab}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Enhanced Quiz Section Component
const QuizSection = ({ sessionId, activeTab, onNavigateToTab }) => {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizLoaded, setQuizLoaded] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testSelected, setTestSelected] = useState(null);

  // Only load quiz once when component mounts or sessionId changes
  useEffect(() => {
    if (sessionId && !quizLoaded) {
      console.log('Loading quiz for first time, sessionId:', sessionId);
      loadQuizQuestions();
    }
  }, [sessionId, quizLoaded]);

  const loadQuizQuestions = async () => {
    console.log('Loading quiz questions for session:', sessionId);
    setIsLoading(true);
    
    // Only reset state if we're loading new quiz questions, not on tab switches
    if (!quizLoaded) {
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowResults(false);
      setUserAnswers({});
    }
    
    if (!sessionId) {
      console.error('No sessionId provided to loadQuizQuestions');
      setIsLoading(false);
      return;
    }

    try {
      const result = await apiService.getQuizQuestions(sessionId);
      console.log('Quiz questions API response:', result);
      
      if (result.quiz_questions && result.quiz_questions.length > 0) {
        console.log('Found quiz questions:', result.quiz_questions.length);
        
        // Validate and process quiz questions
        const processedQuestions = result.quiz_questions.map((question, index) => {
          console.log(`Processing question ${index + 1}:`, question);
          
          // Handle options parsing
          let options = [];
          try {
            if (typeof question.options === 'string') {
              options = JSON.parse(question.options);
            } else if (Array.isArray(question.options)) {
              options = question.options;
            } else {
              console.error('Invalid options format for question:', question);
              options = ['Option A', 'Option B', 'Option C', 'Option D'];
            }
          } catch (e) {
            console.error('Error parsing options for question:', question, e);
            options = ['Option A', 'Option B', 'Option C', 'Option D'];
          }
          
          return {
            ...question,
            parsedOptions: options
          };
        });
        
        setQuizQuestions(processedQuestions);
        setQuizLoaded(true);
        console.log('Quiz questions set successfully:', processedQuestions.length);
      } else {
        console.log('No quiz questions found in response - creating reliable fallback quiz');
        
        // Create a reliable fallback test quiz 
        const fallbackQuiz = [
          {
            id: 'fallback-1',
            question: 'What is the primary goal of accessible education technology?',
            parsedOptions: [
              'To help all students learn effectively',
              'To replace traditional teaching methods',
              'To reduce educational costs',
              'To eliminate the need for teachers'
            ],
            correct_answer: 'To help all students learn effectively'
          },
          {
            id: 'fallback-2', 
            question: 'Which accessibility feature is most important for deaf students?',
            parsedOptions: [
              'Audio amplification',
              'Visual and sign language support', 
              'Faster content delivery',
              'Simplified language only'
            ],
            correct_answer: 'Visual and sign language support'
          },
          {
            id: 'fallback-3',
            question: 'How does AI-powered transcription help in education?',
            parsedOptions: [
              'It replaces the need for note-taking',
              'It provides accurate text from audio content',
              'It automatically creates test questions',
              'It translates between languages only'
            ],
            correct_answer: 'It provides accurate text from audio content'
          }
        ];
        
        setQuizQuestions(fallbackQuiz);
        setQuizLoaded(true);
        console.log('Reliable fallback quiz set for consistent testing');
      }
    } catch (error) {
      console.error('Error loading quiz questions:', error);
      
      // Always set a working fallback quiz on any error
      const errorFallbackQuiz = [
        {
          id: 'error-1',
          question: 'This is a test question - Can you click on options now?',
          parsedOptions: [
            'Yes, this option is clickable!',
            'The buttons work perfectly',
            'Quiz functionality is restored',
            'All options are interactive'
          ],
          correct_answer: 'Yes, this option is clickable!'
        },
        {
          id: 'error-2',
          question: 'What should happen when you click an option?',
          parsedOptions: [
            'Nothing happens',
            'Option highlights and becomes selected',
            'Page refreshes automatically', 
            'Error message appears'
          ],
          correct_answer: 'Option highlights and becomes selected'
        }
      ];
      
      setQuizQuestions(errorFallbackQuiz);
      setQuizLoaded(true);
      console.log('Error fallback quiz set - quiz should now be fully functional');
      
      // Show a more informative error
      toast.error('Quiz loading failed - using test questions for demonstration', {
        icon: '⚠️',
        duration: 5000,
        style: {
          borderRadius: '12px',
          background: '#f59e0b',
          color: '#fff',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    console.log('handleAnswerSelect called with:', answer);
    console.log('Previous selectedAnswer:', selectedAnswer);
    
    // Immediate state update for instant visual feedback
    setSelectedAnswer(answer);
    
    // Force re-render to ensure state change is visible
    setTimeout(() => {
      console.log('Answer selection confirmed:', answer);
    }, 0);
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) return;
    
    const questionId = quizQuestions[currentQuestion].id;
    setUserAnswers(prev => ({ ...prev, [questionId]: selectedAnswer }));
    
    try {
      await apiService.submitQuizAnswer(questionId, selectedAnswer, 0);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }

    // Move to next question after a brief delay
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setShowResults(true);
      }
    }, 1000);
  };

  const forceReloadQuiz = () => {
    console.log('Force reloading quiz...');
    setQuizLoaded(false);
    setQuizQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResults(false);
    setUserAnswers({});
    setIsLoading(true);
    
    // Trigger reload
    setTimeout(() => {
      loadQuizQuestions();
    }, 100);
  };

  if (isLoading) {
    return (
      <motion.div 
        className="text-center py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="spinner h-12 w-12 mx-auto mb-6"></div>
        <p className="text-gray-500 text-lg">Loading quiz...</p>
      </motion.div>
    );
  }

  // Simple test quiz mode
  if (testMode) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6">TEST MODE - Simple Click Test</h2>
          
          <div className="mb-6">
            <p className="text-lg mb-4">Can you click these buttons?</p>
            <p className="text-sm text-gray-600">Selected: {testSelected || 'none'}</p>
          </div>

          <div className="space-y-4">
            {['Option A', 'Option B', 'Option C', 'Option D'].map((option, index) => (
              <button
                key={option}
                onClick={() => {
                  console.log('TEST BUTTON CLICKED:', option);
                  setTestSelected(option);
                  alert(`You clicked: ${option}`);
                }}
                className={`w-full p-4 border-2 rounded-lg text-left ${
                  testSelected === option 
                    ? 'bg-blue-100 border-blue-500' 
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {option} - Click me!
              </button>
            ))}
          </div>

          <button 
            onClick={() => setTestMode(false)} 
            className="mt-6 btn-secondary"
          >
            Exit Test Mode
          </button>
        </div>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <motion.div 
        className="text-center py-20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <AcademicCapIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Quiz Available</h3>
        <p className="text-gray-500 text-lg mb-8">
          Generate a quiz from your transcribed content first
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigateToTab && onNavigateToTab('results')}
            className="btn-primary px-6 py-3"
          >
            Go Generate Quiz
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={forceReloadQuiz}
            className="btn-secondary px-6 py-3"
          >
            Force Reload Quiz
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTestMode(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-xl"
          >
            Test Click Mode
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const currentQuiz = quizQuestions[currentQuestion];
  const options = currentQuiz?.parsedOptions || [];
  
  console.log('=== QUIZ DEBUG INFO ===');
  console.log('Current quiz question:', currentQuiz);
  console.log('Current question index:', currentQuestion);
  console.log('Total questions:', quizQuestions.length);
  console.log('Quiz options:', options);
  console.log('Options length:', options.length);
  console.log('Selected answer:', selectedAnswer);
  console.log('Quiz loaded flag:', quizLoaded);
  console.log('Is loading:', isLoading);
  console.log('======================');
  
  if (!currentQuiz) {
    return (
      <motion.div 
        className="text-center py-20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <ExclamationTriangleIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Quiz Error</h3>
        <p className="text-gray-500 text-lg mb-8">
          Unable to load quiz question. Please try generating the quiz again.
        </p>
        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentQuestion(0);
              forceReloadQuiz();
            }}
            className="btn-primary px-6 py-3"
          >
            Retry Loading Quiz
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTestMode(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-xl"
          >
            Test Click Mode
          </motion.button>
        </div>
      </motion.div>
    );
  }
  
  // Ensure we have valid options
  if (!options || options.length === 0) {
    console.error('No options available for current question');
    return (
      <motion.div 
        className="text-center py-20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <ExclamationTriangleIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Quiz Options Error</h3>
        <p className="text-gray-500 text-lg mb-8">
          No answer options available for this question. Please try regenerating the quiz.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={forceReloadQuiz}
          className="btn-primary px-6 py-3"
        >
          Refresh & Try Again
        </motion.button>
      </motion.div>
    );
  }
  
  const correctAnswers = Object.values(userAnswers).filter((answer, index) => {
    const question = quizQuestions[index];
    return question && answer === question.correct_answer;
  }).length;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div 
        className="card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
      >
        {!showResults ? (
          <>
            {/* Progress */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between text-gray-600 mb-3 font-medium">
                <span className="text-lg">Question {currentQuestion + 1} of {quizQuestions.length}</span>
                <span className="text-lg">{Math.round(((currentQuestion + 1) / quizQuestions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-emerald-500 to-green-500 h-4 rounded-full shadow-sm"
                  animate={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </motion.div>

            {/* Question */}
            <motion.h3 
              className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {currentQuiz.question}
            </motion.h3>

            {/* Options */}
            <div className="space-y-4 mb-8">
              <div className="text-sm text-gray-600 mb-2">
                Debug Info: {options.length} options found, selectedAnswer: "{selectedAnswer || 'none'}"
              </div>
              {options.length > 0 ? options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                console.log(`Rendering option ${index}: "${option}", selected: ${isSelected}`);
                
                return (
                  <div key={`option-wrapper-${currentQuestion}-${index}`} className="w-full">
                    <button
                      onClick={(e) => {
                        console.log('BUTTON CLICKED!', option);
                        console.log('Event:', e);
                        console.log('Event target:', e.target);
                        console.log('Event currentTarget:', e.currentTarget);
                        handleAnswerSelect(option);
                      }}
                      onMouseEnter={() => console.log('Mouse entered button:', option)}
                      onMouseLeave={() => console.log('Mouse left button:', option)}
                      className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer block outline-none focus:outline-none ${
                        isSelected
                          ? 'bg-blue-100 border-blue-400 text-blue-800 shadow-lg'
                          : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md'
                      }`}
                      type="button"
                      style={{
                        zIndex: 10,
                        position: 'relative',
                        pointerEvents: 'auto'
                      }}
                    >
                      <div className="flex items-center space-x-4" style={{ pointerEvents: 'none' }}>
                        <span className={`font-bold text-lg w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-lg flex-1">{option}</span>
                      </div>
                    </button>
                    <div className="text-xs text-gray-400 mt-1">
                      Option {index + 1}: "{option}" - Click handler attached
                    </div>
                  </div>
                );
              }) : (
                <div className="text-red-500 font-bold">
                  ERROR: No options available to render!
                </div>
              )}
            </div>

            {/* Submit Button */}
            <AnimatePresence>
              {selectedAnswer && (
                <motion.button
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnswerSubmit}
                  className="btn-primary w-full text-xl py-4"
                >
                  {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </motion.button>
              )}
            </AnimatePresence>
          </>
        ) : (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              className="text-8xl mb-6"
            >
              🎉
            </motion.div>
            <h3 className="text-4xl font-black gradient-text mb-6">Quiz Complete!</h3>
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8 mb-8 border border-emerald-200">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {correctAnswers} / {quizQuestions.length}
              </div>
              <div className="text-lg text-gray-600">
                {Math.round((correctAnswers / quizQuestions.length) * 100)}% Accuracy
              </div>
            </div>
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentQuestion(0);
                  setUserAnswers({});
                  setShowResults(false);
                  setSelectedAnswer(null);
                }}
                className="btn-primary px-6 py-3 mr-4"
              >
                Retake Quiz
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigateToTab && onNavigateToTab('results')}
                className="btn-primary px-6 py-3"
              >
                Go Generate Quiz
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

// Comprehensive Session Details View Component
const SessionDetailsView = ({ session, transcription, summary, aslData, onNavigateToTab }) => {
  const [quizCount, setQuizCount] = useState(0);

  useEffect(() => {
    if (session?.id) {
      loadQuizCount();
    }
  }, [session]);

  const loadQuizCount = async () => {
    try {
      const result = await apiService.getQuizQuestions(session.id);
      setQuizCount(result.quiz_questions?.length || 0);
    } catch (error) {
      console.error('Error loading quiz count:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompletionStatus = () => {
    const hasTranscription = Boolean(transcription);
    const hasSummary = Boolean(summary);
    const hasASL = Boolean(aslData);
    const hasQuiz = quizCount > 0;
    
    const completed = [hasTranscription, hasSummary, hasASL, hasQuiz].filter(Boolean).length;
    const total = 4;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage, hasTranscription, hasSummary, hasASL, hasQuiz };
  };

  const status = getCompletionStatus();

  if (!session) {
    return (
      <div className="text-center py-20">
        <div className="spinner h-12 w-12 mx-auto mb-6"></div>
        <p className="text-gray-500 text-lg">Loading session details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Session Overview Header */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{session.title}</h2>
            <p className="text-gray-600 flex items-center space-x-2">
              <ClockIcon className="h-4 w-4" />
              <span>Created on {formatDate(session.created_at)}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 mb-1">{status.percentage}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">Session Progress</span>
            <span>{status.completed} of {status.total} features completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${status.percentage}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </div>

        {/* Session Metadata */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="text-sm text-gray-600 mb-1">Session ID</div>
            <div className="font-mono text-sm">{session.id}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="text-sm text-gray-600 mb-1">Duration</div>
            <div className="font-semibold">{session.duration ? `${session.duration}s` : 'Not recorded'}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="text-sm text-gray-600 mb-1">Last Updated</div>
            <div className="font-semibold">{formatDate(session.updated_at || session.created_at)}</div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border ${status.hasTranscription ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <DocumentTextIcon className={`h-6 w-6 mb-2 ${status.hasTranscription ? 'text-green-600' : 'text-gray-400'}`} />
            <div className="font-semibold text-sm">Transcription</div>
            <div className={`text-xs ${status.hasTranscription ? 'text-green-600' : 'text-gray-500'}`}>
              {status.hasTranscription ? 'Complete' : 'Not started'}
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border ${status.hasSummary ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
            <SparklesIcon className={`h-6 w-6 mb-2 ${status.hasSummary ? 'text-purple-600' : 'text-gray-400'}`} />
            <div className="font-semibold text-sm">AI Summary</div>
            <div className={`text-xs ${status.hasSummary ? 'text-purple-600' : 'text-gray-500'}`}>
              {status.hasSummary ? 'Generated' : 'Not generated'}
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border ${status.hasASL ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <HandRaisedIcon className={`h-6 w-6 mb-2 ${status.hasASL ? 'text-blue-600' : 'text-gray-400'}`} />
            <div className="font-semibold text-sm">ASL Translation</div>
            <div className={`text-xs ${status.hasASL ? 'text-blue-600' : 'text-gray-500'}`}>
              {status.hasASL ? 'Available' : 'Not available'}
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border ${status.hasQuiz ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
            <AcademicCapIcon className={`h-6 w-6 mb-2 ${status.hasQuiz ? 'text-amber-600' : 'text-gray-400'}`} />
            <div className="font-semibold text-sm">Quiz Questions</div>
            <div className={`text-xs ${status.hasQuiz ? 'text-amber-600' : 'text-gray-500'}`}>
              {status.hasQuiz ? `${quizCount} questions` : 'Not created'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Sections */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Transcription Section */}
        {transcription && (
          <motion.div 
            className="card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                <span>Transcription</span>
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigateToTab('results')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Full →
              </motion.button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 max-h-40 overflow-y-auto">
              <p className="text-gray-800 leading-relaxed">{transcription}</p>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {transcription.split(' ').length} words • {transcription.length} characters
            </div>
          </motion.div>
        )}

        {/* Summary Section */}
        {summary && (
          <motion.div 
            className="card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <SparklesIcon className="h-6 w-6 text-purple-600" />
                <span>AI Summary</span>
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigateToTab('results')}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                View Full →
              </motion.button>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 max-h-40 overflow-y-auto">
              <div className="prose prose-sm text-gray-800" 
                   dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br>') }} />
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {summary.split(' ').length} words • AI-generated summary
            </div>
          </motion.div>
        )}
      </div>

      {/* ASL and Quiz Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* ASL Section */}
        {aslData && (
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <HandRaisedIcon className="h-6 w-6 text-blue-600" />
                <span>ASL Translation</span>
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigateToTab('results')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Demo →
              </motion.button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Signs:</span>
                <span className="font-semibold">{aslData.signs?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold">{aslData.total_duration?.toFixed(1)}s</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {aslData.signs?.slice(0, 6).map((sign, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-2 text-center">
                    <div className="text-xs font-semibold text-blue-800">{sign.word}</div>
                    <div className="text-xs text-blue-600 mt-1">{sign.gesture}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quiz Section */}
        {quizCount > 0 && (
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <AcademicCapIcon className="h-6 w-6 text-amber-600" />
                <span>Quiz Questions</span>
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigateToTab('quiz')}
                className="text-sm text-amber-600 hover:text-amber-800 font-medium"
              >
                Take Quiz →
              </motion.button>
            </div>
            <div className="text-center py-8">
              <div className="text-3xl font-bold text-amber-600 mb-2">{quizCount}</div>
              <div className="text-gray-600">Questions Ready</div>
              <div className="text-sm text-gray-500 mt-2">
                Test your understanding of the content
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <motion.div 
        className="flex justify-center space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.back()}
          className="btn-secondary px-6 py-3 flex items-center space-x-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to History</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigateToTab('transcribe')}
          className="btn-secondary px-6 py-3"
        >
          Add More Content
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigateToTab('quiz')}
          className="btn-primary px-6 py-3"
        >
          Start Learning
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LearningSession;