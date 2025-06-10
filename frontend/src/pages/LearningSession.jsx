import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  DocumentTextIcon, 
  SparklesIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

import AudioRecorder from '../components/AudioRecorder';
import ASLAvatar from '../components/ASLAvatar';
import ParticleBackground from '../components/ParticleBackground';
import { apiService } from '../services/api';

const LearningSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [aslData, setAslData] = useState(null);
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState('transcribe');

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const sessionData = await apiService.getSession(sessionId);
      setSession(sessionData);
      
      if (sessionData.transcription) {
        setTranscription(sessionData.transcription);
      }
      
      if (sessionData.sign_language_data) {
        setAslData(JSON.parse(sessionData.sign_language_data));
      }
      
      if (sessionData.summary) {
        setSummary(sessionData.summary);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session');
    }
  };

  const handleTranscription = async (audioBlob) => {
    setIsProcessing(true);
    try {
      const result = await apiService.transcribeAudio(audioBlob, sessionId);
      setTranscription(result.transcription);
      setAslData(result.asl_translation);
      toast.success('Audio transcribed successfully!', {
        icon: '🎉',
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
        },
      });
      setActiveTab('results');
    } catch (error) {
      console.error('Error transcribing audio:', error);
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
      const result = await apiService.summarizeContent(sessionId);
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
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!transcription) {
      toast.error('No transcription available for quiz generation');
      return;
    }

    try {
      await apiService.generateQuiz(sessionId, 3);
      toast.success('Quiz generated! Check the Quiz tab.', {
        icon: '🎯',
        style: {
          borderRadius: '12px',
          background: '#8b5cf6',
          color: '#fff',
        },
      });
      setActiveTab('quiz');
    } catch (error) {
      console.error('Error generating quiz:', error);
    }
  };

  const tabs = [
    { id: 'transcribe', label: 'Transcribe', icon: DocumentTextIcon, color: 'from-blue-500 to-cyan-500' },
    { id: 'results', label: 'Results', icon: SparklesIcon, color: 'from-purple-500 to-pink-500' },
    { id: 'quiz', label: 'Quiz', icon: AcademicCapIcon, color: 'from-emerald-500 to-green-500' },
  ];

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
                  className="btn-primary flex items-center space-x-2"
                >
                  <AcademicCapIcon className="h-5 w-5" />
                  <span>Create Quiz</span>
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
              <div className="grid lg:grid-cols-2 gap-8">
                <AudioRecorder 
                  onTranscription={handleTranscription}
                  isProcessing={isProcessing}
                />
                <ASLAvatar 
                  aslData={aslData}
                  isVisible={!!aslData}
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

                {/* Summary */}
                {summary && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
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

                {/* ASL Translation */}
                {aslData && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <ASLAvatar aslData={aslData} />
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
              <QuizSection sessionId={sessionId} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Enhanced Quiz Section Component
const QuizSection = ({ sessionId }) => {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    loadQuizQuestions();
  }, [sessionId]);

  const loadQuizQuestions = async () => {
    try {
      const result = await apiService.getQuizQuestions(sessionId);
      if (result.quiz_questions && result.quiz_questions.length > 0) {
        setQuizQuestions(result.quiz_questions);
      }
    } catch (error) {
      console.error('Error loading quiz questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
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

  if (quizQuestions.length === 0) {
    return (
      <motion.div 
        className="text-center py-20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <AcademicCapIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Quiz Available</h3>
        <p className="text-gray-500 text-lg">
          Generate a quiz from your transcribed content first
        </p>
      </motion.div>
    );
  }

  const currentQuiz = quizQuestions[currentQuestion];
  const options = JSON.parse(currentQuiz.options);
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
              {options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                    selectedAnswer === option
                      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-400 text-blue-800 shadow-lg'
                      : 'bg-gray-50/80 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className={`font-bold text-lg w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedAnswer === option
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-lg">{option}</span>
                  </div>
                </motion.button>
              ))}
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
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentQuestion(0);
                setUserAnswers({});
                setShowResults(false);
                setSelectedAnswer(null);
              }}
              className="btn-primary text-xl px-8 py-4"
            >
              Retake Quiz
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LearningSession;