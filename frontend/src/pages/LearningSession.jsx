import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  DocumentTextIcon, 
  SparklesIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

import AudioRecorder from '../components/AudioRecorder';
import ASLAvatar from '../components/ASLAvatar';
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
      toast.success('Audio transcribed successfully!');
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
      toast.success('Summary generated!');
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
      toast.success('Quiz generated! Check the Quiz tab.');
      setActiveTab('quiz');
    } catch (error) {
      console.error('Error generating quiz:', error);
    }
  };

  const tabs = [
    { id: 'transcribe', label: 'Transcribe', icon: DocumentTextIcon },
    { id: 'results', label: 'Results', icon: SparklesIcon },
    { id: 'quiz', label: 'Quiz', icon: AcademicCapIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {session?.title || 'Learning Session'}
            </h1>
            {session?.created_at && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                <ClockIcon className="h-4 w-4" />
                <span>
                  Created {new Date(session.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {transcription && (
            <>
              <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="btn-secondary disabled:opacity-50"
              >
                {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
              </button>
              
              <button
                onClick={handleGenerateQuiz}
                className="btn-primary"
              >
                Create Quiz
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-b border-gray-200 mb-8"
      >
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </motion.div>

      {/* Tab Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {activeTab === 'transcribe' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Audio Recorder */}
            <AudioRecorder 
              onTranscription={handleTranscription}
              isProcessing={isProcessing}
            />
            
            {/* ASL Avatar */}
            <ASLAvatar 
              aslData={aslData}
              isVisible={!!aslData}
            />
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            {/* Transcription Results */}
            {transcription && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <DocumentTextIcon className="h-5 w-5" />
                  <span>Transcription</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed">{transcription}</p>
                </div>
              </motion.div>
            )}

            {/* Summary */}
            {summary && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <SparklesIcon className="h-5 w-5" />
                  <span>AI Summary</span>
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <div className="prose text-gray-800" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br>') }} />
                </div>
              </motion.div>
            )}

            {/* ASL Translation */}
            {aslData && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ASLAvatar aslData={aslData} />
              </motion.div>
            )}

            {!transcription && (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Yet</h3>
                <p className="text-gray-500">
                  Start by recording or uploading audio in the Transcribe tab
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quiz' && (
          <QuizSection sessionId={sessionId} />
        )}
      </motion.div>
    </div>
  );
};

// Quiz Section Component
const QuizSection = ({ sessionId }) => {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleAnswerSubmit = async (questionId, answer) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    try {
      await apiService.submitQuizAnswer(questionId, answer, 0); // TODO: Track time
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading quiz...</p>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <AcademicCapIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Quiz Available</h3>
        <p className="text-gray-500">
          Generate a quiz from your transcribed content first
        </p>
      </div>
    );
  }

  const currentQuiz = quizQuestions[currentQuestion];
  const options = JSON.parse(currentQuiz.options);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        {!showResults ? (
          <>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / quizQuestions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuiz.question}
            </h3>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSubmit(currentQuiz.id, option)}
                  disabled={userAnswers[currentQuiz.id]}
                  className={`w-full text-left p-4 rounded-lg border transition-colors duration-200 ${
                    userAnswers[currentQuiz.id] === option
                      ? 'bg-primary-100 border-primary-300 text-primary-800'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  } disabled:cursor-not-allowed`}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>

            {/* Next Button */}
            {userAnswers[currentQuiz.id] && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={nextQuestion}
                className="btn-primary w-full"
              >
                {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </motion.button>
            )}
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Quiz Complete!</h3>
            <p className="text-gray-600 mb-6">
              You've answered {Object.keys(userAnswers).length} out of {quizQuestions.length} questions.
            </p>
            <button
              onClick={() => {
                setCurrentQuestion(0);
                setUserAnswers({});
                setShowResults(false);
              }}
              className="btn-primary"
            >
              Retake Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningSession; 