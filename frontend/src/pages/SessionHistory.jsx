import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  ClockIcon, 
  DocumentTextIcon, 
  HandRaisedIcon,
  AcademicCapIcon,
  EyeIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import ParticleBackground from '../components/ParticleBackground';

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const result = await apiService.getSessions();
      setSessions(result.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load session history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionStats = (session) => {
    const stats = {
      hasTranscription: !!(session?.transcription && session.transcription.trim() !== ''),
      hasSummary: !!(session?.summary && session.summary.trim() !== ''),
      hasASL: !!(session?.sign_language_data && session.sign_language_data.trim() !== ''),
      duration: session?.duration || 0
    };
    
    console.log('Session stats for ID', session?.id, ':', stats);
    return stats;
  };

  const getCompletionStatus = (session) => {
    const stats = getSessionStats(session);
    const completedFeatures = [stats.hasTranscription, stats.hasSummary, stats.hasASL].filter(Boolean).length;
    return {
      percentage: Math.round((completedFeatures / 3) * 100),
      status: completedFeatures === 3 ? 'complete' : completedFeatures > 0 ? 'partial' : 'incomplete'
    };
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    const completion = getCompletionStatus(session);
    return completion.status === filter;
  });

  const filters = [
    { id: 'all', label: 'All Sessions', count: sessions.length },
    { id: 'complete', label: 'Complete', count: sessions.filter(s => getCompletionStatus(s).status === 'complete').length },
    { id: 'partial', label: 'In Progress', count: sessions.filter(s => getCompletionStatus(s).status === 'partial').length },
    { id: 'incomplete', label: 'Not Started', count: sessions.filter(s => getCompletionStatus(s).status === 'incomplete').length },
  ];

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <ParticleBackground />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="spinner h-12 w-12 mx-auto mb-6"></div>
            <p className="text-gray-500 text-lg">Loading sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black gradient-text mb-4">Learning History</h1>
          <p className="text-xl text-gray-600 font-medium">
            Review your past learning sessions, transcriptions, and progress
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-10"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-xl">
            <div className="flex flex-wrap gap-2">
              {filters.map((filterOption) => (
                <motion.button
                  key={filterOption.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilter(filterOption.id)}
                  className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    filter === filterOption.id
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  }`}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>{filterOption.label}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      filter === filterOption.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {filterOption.count}
                    </span>
                  </span>
                  
                  {filter === filterOption.id && (
                    <motion.div
                      layoutId="filterBg"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sessions Grid */}
        <AnimatePresence mode="wait">
          {filteredSessions.length > 0 ? (
            <motion.div 
              key={filter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            >
              {filteredSessions.map((session, index) => {
                const stats = getSessionStats(session);
                const completion = getCompletionStatus(session);
                
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: index * 0.1, 
                      duration: 0.6,
                      type: "spring",
                      bounce: 0.3
                    }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="card group relative overflow-hidden"
                  >
                    {/* Completion Status Indicator */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`w-4 h-4 rounded-full ${
                        completion.status === 'complete' ? 'bg-green-500' :
                        completion.status === 'partial' ? 'bg-yellow-500' : 'bg-gray-300'
                      }`} />
                    </div>

                    {/* Session Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:gradient-text transition-all duration-300 mb-2">
                          {session.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-gray-500">
                          <ClockIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">{formatDate(session.created_at)}</span>
                        </div>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="text-blue-500 group-hover:text-indigo-600 transition-colors"
                      >
                        <EyeIcon className="h-6 w-6" />
                      </motion.div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span className="font-medium">Progress</span>
                        <span className="font-bold">{completion.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className={`h-3 rounded-full ${
                            completion.status === 'complete' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            completion.status === 'partial' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gray-300'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${completion.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>

                    {/* Feature Status Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className={`text-center p-3 rounded-xl transition-all duration-300 ${
                        stats.hasTranscription 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}>
                        <DocumentTextIcon className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-xs font-semibold">
                          {stats.hasTranscription ? 'Transcribed' : 'No Text'}
                        </div>
                      </div>
                      
                      <div className={`text-center p-3 rounded-xl transition-all duration-300 ${
                        stats.hasASL 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}>
                        <HandRaisedIcon className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-xs font-semibold">
                          {stats.hasASL ? 'ASL Ready' : 'No ASL'}
                        </div>
                      </div>
                      
                      <div className={`text-center p-3 rounded-xl transition-all duration-300 ${
                        stats.hasSummary 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}>
                        <SparklesIcon className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-xs font-semibold">
                          {stats.hasSummary ? 'Summarized' : 'No Summary'}
                        </div>
                      </div>
                    </div>

                    {/* Transcription Preview */}
                    {session.transcription && (
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                          {session.transcription.length > 120 
                            ? session.transcription.substring(0, 120) + '...'
                            : session.transcription
                          }
                        </p>
                      </div>
                    )}



                    {/* Status Badge and Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {completion.status === 'complete' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Complete
                          </span>
                        )}
                        {completion.status === 'partial' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            In Progress
                          </span>
                        )}
                        {completion.status === 'incomplete' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            <XCircleIcon className="h-3 w-3 mr-1" />
                            Not Started
                          </span>
                        )}
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          
                          // Show immediate feedback to user
                          toast.success(`Opening details for "${session.title}"`, {
                            icon: '📖',
                            duration: 2000,
                          });
                          
                          // Navigate to the session details view
                          const targetPath = `/session/${session.id}?view=details`;
                          navigate(targetPath);
                          
                          // Fallback: if navigate doesn't work, try window.location
                          setTimeout(() => {
                            if (window.location.pathname === '/history') {
                              window.location.href = targetPath;
                            }
                          }, 100);
                        }}
                        className="text-sm font-semibold text-blue-600 hover:text-indigo-600 transition-colors flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-blue-50 border border-blue-200 hover:border-blue-300"
                        type="button"
                        style={{ position: 'relative', zIndex: 10 }}
                      >
                        <span>View Details</span>
                        <span>→</span>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="text-center py-20"
            >
              <ClockIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {filter === 'all' ? 'No Learning Sessions Yet' : `No ${filters.find(f => f.id === filter)?.label} Sessions`}
              </h3>
              <p className="text-gray-500 text-lg mb-8">
                {filter === 'all' 
                  ? 'Start your first learning session to see your history here'
                  : 'Try a different filter or create a new session'
                }
              </p>
              <Link
                to="/"
                className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-4"
              >
                <span>Create New Session</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Stats */}
        {sessions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid md:grid-cols-4 gap-6"
          >
            {[
              {
                value: sessions.length,
                label: 'Total Sessions',
                color: 'from-blue-500 to-cyan-500',
                icon: AcademicCapIcon
              },
              {
                value: sessions.filter(s => s.transcription).length,
                label: 'Transcribed',
                color: 'from-green-500 to-emerald-500',
                icon: DocumentTextIcon
              },
              {
                value: sessions.filter(s => s.summary).length,
                label: 'Summarized',
                color: 'from-purple-500 to-violet-500',
                icon: SparklesIcon
              },
              {
                value: sessions.filter(s => s.sign_language_data).length,
                label: 'ASL Translated',
                color: 'from-orange-500 to-red-500',
                icon: HandRaisedIcon
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`bg-gradient-to-r ${stat.color} rounded-2xl p-8 text-white relative overflow-hidden shadow-xl`}
                >
                  <div className="relative z-10">
                    <Icon className="h-8 w-8 mb-4 opacity-80" />
                    <div className="text-4xl font-black mb-2">{stat.value}</div>
                    <div className="text-lg font-semibold opacity-90">{stat.label}</div>
                  </div>
                  
                  <motion.div
                    className="absolute inset-0 bg-white/10"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SessionHistory;