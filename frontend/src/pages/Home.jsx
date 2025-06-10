import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  PlusIcon, 
  MicrophoneIcon, 
  HandRaisedIcon, 
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      const response = await apiService.createSession();
      toast.success('New learning session created!');
      navigate(`/session/${response.session_id}`);
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const features = [
    {
      icon: MicrophoneIcon,
      title: 'Real-time Speech-to-Text',
      description: 'Live audio transcription using advanced AI technology',
      color: 'bg-blue-500'
    },
    {
      icon: HandRaisedIcon,
      title: 'Sign Language Translation',
      description: 'Convert text to ASL with visual avatar demonstrations',
      color: 'bg-green-500'
    },
    {
      icon: AcademicCapIcon,
      title: 'Interactive Quizzes',
      description: 'Auto-generated quizzes from your learning content',
      color: 'bg-purple-500'
    },
    {
      icon: SparklesIcon,
      title: 'AI-Powered Summaries',
      description: 'Simplified explanations and key concept highlights',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <div className="mb-6">
          <span className="wave text-6xl mb-4 inline-block">👋</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            EchoLearn
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          An AI-powered educational platform that converts spoken lectures and discussions 
          into real-time sign language animations and simplified text summaries, 
          making learning accessible for everyone.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateSession}
          disabled={isCreating}
          className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 mx-auto disabled:opacity-50"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Creating Session...</span>
            </>
          ) : (
            <>
              <PlusIcon className="h-6 w-6" />
              <span>Start New Learning Session</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="card text-center group"
            >
              <div className={`${feature.color} p-3 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* How It Works Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="card mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          How EchoLearn Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Start Session',
              description: 'Create a new learning session and begin audio capture or upload content',
              icon: '🎙️'
            },
            {
              step: '2',
              title: 'Real-time Processing',
              description: 'AI transcribes speech and translates to sign language in real-time',
              icon: '🤖'
            },
            {
              step: '3',
              title: 'Learn & Quiz',
              description: 'Get summaries, take quizzes, and track your learning progress',
              icon: '📚'
            }
          ].map((item, index) => (
            <div key={item.step} className="text-center">
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 font-bold">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-center bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 text-white"
      >
        <h2 className="text-3xl font-bold mb-4">
          Ready to Transform Your Learning Experience?
        </h2>
        <p className="text-lg mb-6 opacity-90">
          Join thousands of students who are learning more effectively with EchoLearn
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateSession}
          disabled={isCreating}
          className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
        >
          Get Started Now
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Home; 