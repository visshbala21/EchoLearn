import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HandRaisedIcon, 
  PlayIcon, 
  PauseIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const ASLAvatar = ({ aslData, isVisible = true }) => {
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (aslData && aslData.signs && isPlaying) {
      const timer = setTimeout(() => {
        if (currentSignIndex < aslData.signs.length - 1) {
          setCurrentSignIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
          setCurrentSignIndex(0);
        }
      }, (1500 / playbackSpeed));

      return () => clearTimeout(timer);
    }
  }, [currentSignIndex, isPlaying, aslData, playbackSpeed]);

  const handlePlay = () => {
    if (aslData && aslData.signs && aslData.signs.length > 0) {
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentSignIndex(0);
  };

  const getAvatarAnimation = (gesture) => {
    const animations = {
      wave: { 
        rotate: [0, 14, -8, 14, -4, 10, 0], 
        x: [0, 10, -5, 10, -2, 5, 0],
        scale: [1, 1.05, 1]
      },
      thumbs_up: { 
        y: [0, -15, 0], 
        scale: [1, 1.2, 1],
        rotate: [0, 5, 0]
      },
      nod: { 
        y: [0, -8, 0, -8, 0], 
        rotate: [0, -8, 0, -8, 0],
        scale: [1, 1.05, 1]
      },
      shake: { 
        x: [0, -15, 15, -15, 15, 0],
        rotate: [0, -5, 5, -5, 5, 0]
      },
      point_forward: { 
        x: [0, 25, 0],
        scale: [1, 1.1, 1]
      },
      fingerspell: { 
        scale: [1, 1.08, 1],
        rotate: [0, 2, -2, 0]
      }
    };
    
    return animations[gesture] || animations.point_forward;
  };

  const currentSign = aslData?.signs?.[currentSignIndex];

  if (!isVisible || !aslData) {
    return null;
  }

  return (
    <motion.div 
      className="card relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-indigo-50/50"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <motion.h3 
            className="text-2xl font-bold text-gray-900 flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
            >
              <HandRaisedIcon className="h-7 w-7 text-blue-600" />
            </motion.div>
            <span>ASL Translation</span>
          </motion.h3>
          
          {/* Settings Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600" />
          </motion.button>
        </div>

        {/* Playback Controls */}
        <AnimatePresence>
          {showDetails && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-gray-50/80 rounded-xl border border-gray-200/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700">Speed:</label>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!isPlaying ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePlay}
                      className="btn-primary text-sm px-4 py-2 flex items-center space-x-2"
                    >
                      <PlayIcon className="h-4 w-4" />
                      <span>Play</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePause}
                      className="btn-secondary text-sm px-4 py-2 flex items-center space-x-2"
                    >
                      <PauseIcon className="h-4 w-4" />
                      <span>Pause</span>
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="btn-secondary text-sm px-4 py-2 flex items-center space-x-2"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    <span>Reset</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar Display Area */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-8 mb-6 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-indigo-200/20"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[250px]">
            {/* Avatar Figure */}
            <div className="relative mb-6">
              <motion.div
                animate={currentSign ? getAvatarAnimation(currentSign.gesture) : {}}
                transition={{ 
                  duration: 1.5 / playbackSpeed, 
                  ease: "easeInOut",
                  type: "spring",
                  bounce: 0.3
                }}
                className="text-9xl relative"
              >
                🧑‍🏫
                
                {/* Gesture Effect */}
                <AnimatePresence>
                  {isPlaying && currentSign && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0.3 }}
                      exit={{ scale: 2, opacity: 0 }}
                      className="absolute inset-0 bg-blue-400 rounded-full blur-xl"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Gesture Indicator */}
              <AnimatePresence>
                {currentSign && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                      {currentSign.word}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Current Sign Info */}
            <AnimatePresence mode="wait">
              {currentSign && (
                <motion.div
                  key={currentSignIndex}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.9 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-gray-900 mb-3">
                    "{currentSign.word}"
                  </div>
                  <div className="text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 shadow-sm">
                    {currentSign.description}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Indicator */}
            {aslData.signs && aslData.signs.length > 0 && (
              <motion.div 
                className="mt-6 w-full max-w-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex justify-between text-sm text-gray-600 mb-2 font-medium">
                  <span>Sign {currentSignIndex + 1} of {aslData.signs.length}</span>
                  <span>{Math.round(((currentSignIndex + 1) / aslData.signs.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full shadow-sm"
                    animate={{ width: `${((currentSignIndex + 1) / aslData.signs.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Sign List */}
        {aslData.signs && aslData.signs.length > 0 && (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
              <InformationCircleIcon className="h-5 w-5" />
              <span>Sign Sequence</span>
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
              {aslData.signs.map((sign, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`text-sm p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                    index === currentSignIndex
                      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-300 text-blue-800 shadow-md'
                      : 'bg-gray-50/80 border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm'
                  }`}
                  onClick={() => setCurrentSignIndex(index)}
                >
                  <div className="font-semibold">{sign.word}</div>
                  <div className="text-xs opacity-75 mt-1">{sign.gesture}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Original Text */}
        {aslData.original_text && (
          <motion.div 
            className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-sm text-gray-600 mb-2 font-medium">Original Text:</div>
            <div className="text-gray-900 font-medium">"{aslData.original_text}"</div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ASLAvatar;