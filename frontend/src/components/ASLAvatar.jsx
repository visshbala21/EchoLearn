import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HandRaisedIcon, 
  PlayIcon, 
  PauseIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const ASLAvatar = ({ aslData, isVisible = true }) => {
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    if (aslData && aslData.signs && isPlaying) {
      const timer = setTimeout(() => {
        if (currentSignIndex < aslData.signs.length - 1) {
          setCurrentSignIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
          setCurrentSignIndex(0);
        }
      }, (1500 / playbackSpeed)); // Base timing of 1.5 seconds per sign

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
      wave: { rotate: [0, 14, -8, 14, -4, 10, 0], x: [0, 10, -5, 10, -2, 5, 0] },
      thumbs_up: { y: [0, -10, 0], scale: [1, 1.1, 1] },
      nod: { y: [0, -5, 0, -5, 0], rotate: [0, -5, 0, -5, 0] },
      shake: { x: [0, -10, 10, -10, 10, 0] },
      point_forward: { x: [0, 20, 0] },
      fingerspell: { scale: [1, 1.05, 1] }
    };
    
    return animations[gesture] || animations.point_forward;
  };

  const currentSign = aslData?.signs?.[currentSignIndex];

  if (!isVisible || !aslData) {
    return null;
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <HandRaisedIcon className="h-5 w-5" />
          <span>ASL Translation</span>
        </h3>
        
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
          
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="btn-primary text-sm px-3 py-1 flex items-center space-x-1"
            >
              <PlayIcon className="h-4 w-4" />
              <span>Play</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="btn-secondary text-sm px-3 py-1 flex items-center space-x-1"
            >
              <PauseIcon className="h-4 w-4" />
              <span>Pause</span>
            </button>
          )}
          
          <button
            onClick={handleReset}
            className="btn-secondary text-sm px-3 py-1"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Avatar Display Area */}
      <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg p-8 mb-4">
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          {/* Avatar Figure */}
          <div className="relative mb-4">
            <motion.div
              animate={currentSign ? getAvatarAnimation(currentSign.gesture) : {}}
              transition={{ duration: 1.5 / playbackSpeed, ease: "easeInOut" }}
              className="text-8xl"
            >
              🧑‍🏫
            </motion.div>
            
            {/* Gesture Indicator */}
            {currentSign && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
              >
                <div className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                  {currentSign.word}
                </div>
              </motion.div>
            )}
          </div>

          {/* Current Sign Info */}
          <AnimatePresence mode="wait">
            {currentSign && (
              <motion.div
                key={currentSignIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  "{currentSign.word}"
                </div>
                <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg">
                  {currentSign.description}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Indicator */}
          {aslData.signs && aslData.signs.length > 0 && (
            <div className="mt-4 w-full max-w-xs">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Sign {currentSignIndex + 1} of {aslData.signs.length}</span>
                <span>{Math.round(((currentSignIndex + 1) / aslData.signs.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-primary-600 h-2 rounded-full"
                  animate={{ width: `${((currentSignIndex + 1) / aslData.signs.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign List */}
      {aslData.signs && aslData.signs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <InformationCircleIcon className="h-4 w-4" />
            <span>Sign Sequence</span>
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {aslData.signs.map((sign, index) => (
              <div
                key={index}
                className={`text-xs p-2 rounded border ${
                  index === currentSignIndex
                    ? 'bg-primary-100 border-primary-300 text-primary-800'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <div className="font-medium">{sign.word}</div>
                <div className="text-xs opacity-75">{sign.gesture}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Original Text */}
      {aslData.original_text && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Original Text:</div>
          <div className="text-sm text-gray-900">"{aslData.original_text}"</div>
        </div>
      )}
    </div>
  );
};

export default ASLAvatar; 