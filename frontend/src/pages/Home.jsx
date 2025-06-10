import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  PlusIcon, 
  MicrophoneIcon, 
  HandRaisedIcon, 
  AcademicCapIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlayIcon,
  UserGroupIcon,
  GlobeAltIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import ParticleBackground from '../components/ParticleBackground';

const Home = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      const response = await apiService.createSession();
      toast.success('New learning session created!', {
        icon: '🎉',
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
        },
      });
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
      color: 'from-blue-500 to-cyan-500',
      delay: 0.1
    },
    {
      icon: HandRaisedIcon,
      title: 'Sign Language Translation',
      description: 'Convert text to ASL with visual avatar demonstrations',
      color: 'from-emerald-500 to-green-500',
      delay: 0.2
    },
    {
      icon: AcademicCapIcon,
      title: 'Interactive Quizzes',
      description: 'Auto-generated quizzes from your learning content',
      color: 'from-purple-500 to-violet-500',
      delay: 0.3
    },
    {
      icon: SparklesIcon,
      title: 'AI-Powered Summaries',
      description: 'Simplified explanations and key concept highlights',
      color: 'from-orange-500 to-red-500',
      delay: 0.4
    }
  ];

  const stats = [
    { number: '300M+', label: 'People Served', icon: UserGroupIcon },
    { number: '95%', label: 'Accuracy Rate', icon: SparklesIcon },
    { number: '50+', label: 'Languages', icon: GlobeAltIcon },
    { number: '24/7', label: 'Availability', icon: HeartIcon }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <motion.div 
            className="mb-8"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-8xl mb-6 inline-block wave">👋</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-black mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Welcome to{' '}
            <span className="relative">
              <span className="gradient-text">EchoLearn</span>
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur-xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            An AI-powered educational platform that converts spoken lectures and discussions 
            into real-time sign language animations and simplified text summaries, 
            making learning accessible for{' '}
            <span className="gradient-text font-bold">everyone</span>.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateSession}
              disabled={isCreating}
              className="btn-primary text-xl px-10 py-4 flex items-center space-x-3 disabled:opacity-50 shadow-2xl"
            >
              {isCreating ? (
                <>
                  <div className="spinner h-6 w-6"></div>
                  <span>Creating Session...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="h-6 w-6" />
                  <span>Start Learning Journey</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2"
            >
              <PlayIcon className="h-5 w-5" />
              <span>Watch Demo</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl"
              >
                <Icon className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                <div className="text-3xl font-black gradient-text mb-2">{stat.number}</div>
                <div className="text-gray-600 font-semibold">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: feature.delay, 
                  duration: 0.6,
                  type: "spring",
                  bounce: 0.3
                }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="card text-center group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <motion.div 
                    className={`bg-gradient-to-r ${feature.color} p-4 rounded-2xl w-fit mx-auto mb-6 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:gradient-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* How It Works Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="card mb-20 relative overflow-hidden"
        >
          <div className="relative z-10">
            <motion.h2 
              className="text-4xl font-black text-center mb-12 gradient-text"
              whileInView={{ scale: [0.9, 1.05, 1] }}
              transition={{ duration: 0.6 }}
            >
              How EchoLearn Works
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  step: '1',
                  title: 'Start Session',
                  description: 'Create a new learning session and begin audio capture or upload content',
                  icon: '🎙️',
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  step: '2',
                  title: 'Real-time Processing',
                  description: 'AI transcribes speech and translates to sign language in real-time',
                  icon: '🤖',
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  step: '3',
                  title: 'Learn & Quiz',
                  description: 'Get summaries, take quizzes, and track your learning progress',
                  icon: '📚',
                  color: 'from-emerald-500 to-green-500'
                }
              ].map((item, index) => (
                <motion.div 
                  key={item.step} 
                  className="text-center relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                >
                  <motion.div 
                    className="text-6xl mb-6"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {item.icon}
                  </motion.div>
                  <motion.div 
                    className={`bg-gradient-to-r ${item.color} text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 font-black text-xl shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 rounded-2xl" />
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="relative text-center bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-white overflow-hidden shadow-2xl"
        >
          <div className="relative z-10">
            <motion.h2 
              className="text-4xl md:text-5xl font-black mb-6"
              whileInView={{ scale: [0.9, 1.05, 1] }}
              transition={{ duration: 0.6 }}
            >
              Ready to Transform Your Learning Experience?
            </motion.h2>
            <motion.p 
              className="text-xl mb-8 opacity-90 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.9 }}
              transition={{ delay: 0.2 }}
            >
              Join thousands of students who are learning more effectively with EchoLearn
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateSession}
              disabled={isCreating}
              className="bg-white text-blue-600 font-black text-xl px-10 py-4 rounded-2xl hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 shadow-xl"
            >
              Get Started Now
            </motion.button>
          </div>
          
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;