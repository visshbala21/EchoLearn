import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  DocumentTextIcon, 
  HandRaisedIcon,
  AcademicCapIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const result = await apiService.getSessions();
      setSessions(result.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
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
      hasTranscription: !!session.transcription,
      hasSummary: !!session.summary,
      hasASL: !!session.sign_language_data,
      duration: session.duration || 0
    };
    return stats;
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Learning History</h1>
        <p className="text-gray-600">
          Review your past learning sessions, transcriptions, and progress
        </p>
      </motion.div>

      {/* Sessions Grid */}
      {sessions.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {sessions.map((session, index) => {
            const stats = getSessionStats(session);
            
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card group cursor-pointer"
              >
                <Link to={`/session/${session.id}`} className="block">
                  {/* Session Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                        {session.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{formatDate(session.created_at)}</span>
                      </div>
                    </div>
                    
                    <EyeIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors duration-200" />
                  </div>

                  {/* Session Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className={`text-center p-2 rounded-lg ${stats.hasTranscription ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      <DocumentTextIcon className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">
                        {stats.hasTranscription ? 'Transcribed' : 'No Text'}
                      </div>
                    </div>
                    
                    <div className={`text-center p-2 rounded-lg ${stats.hasASL ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                      <HandRaisedIcon className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">
                        {stats.hasASL ? 'ASL Ready' : 'No ASL'}
                      </div>
                    </div>
                    
                    <div className={`text-center p-2 rounded-lg ${stats.hasSummary ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-500'}`}>
                      <AcademicCapIcon className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">
                        {stats.hasSummary ? 'Summarized' : 'No Summary'}
                      </div>
                    </div>
                  </div>

                  {/* Transcription Preview */}
                  {session.transcription && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {session.transcription.length > 120 
                          ? session.transcription.substring(0, 120) + '...'
                          : session.transcription
                        }
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {stats.hasTranscription && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Complete
                        </span>
                      )}
                      {!stats.hasTranscription && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Incomplete
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      View Details →
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center py-12"
        >
          <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Learning Sessions Yet</h3>
          <p className="text-gray-500 mb-6">
            Start your first learning session to see your history here
          </p>
          <Link
            to="/"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>Create First Session</span>
          </Link>
        </motion.div>
      )}

      {/* Summary Stats */}
      {sessions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid md:grid-cols-4 gap-6"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold mb-2">{sessions.length}</div>
            <div className="text-blue-100">Total Sessions</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold mb-2">
              {sessions.filter(s => s.transcription).length}
            </div>
            <div className="text-green-100">Transcribed</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold mb-2">
              {sessions.filter(s => s.summary).length}
            </div>
            <div className="text-purple-100">Summarized</div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold mb-2">
              {sessions.filter(s => s.sign_language_data).length}
            </div>
            <div className="text-orange-100">ASL Translated</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SessionHistory; 