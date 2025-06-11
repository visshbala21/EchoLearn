import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  MicrophoneIcon, 
  StopIcon, 
  DocumentArrowUpIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
  SparklesIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const AudioRecorder = ({ onTranscription, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const analyzeAudio = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    microphone.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateLevel = () => {
      if (analyserRef.current && isRecording) {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        animationRef.current = requestAnimationFrame(updateLevel);
      }
    };
    
    updateLevel();
  };

  const startRecording = async () => {
    if (isRecording) {
      toast.error('Recording is already in progress.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      analyzeAudio(stream);
      
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      
      mediaRecorder.current.onstop = () => {
        try {
          console.log('Recording stopped, processing audio chunks:', audioChunks.current.length);
          
          if (audioChunks.current.length === 0) {
            toast.error('No audio was recorded. Please try again.');
            return;
          }

          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          console.log('Created audio blob:', audioBlob.size, 'bytes');
          
          if (audioBlob.size === 0) {
            toast.error('Recording failed - no audio data captured.');
            return;
          }

          setAudioBlob(audioBlob);
        } catch (error) {
          console.error('Error processing recorded audio:', error);
          toast.error('Failed to process recorded audio. Please try again.');
        } finally {
          stream.getTracks().forEach(track => track.stop());
          setAudioLevel(0);
        }
      };

      mediaRecorder.current.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        toast.error('Recording error occurred. Please try again.');
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.current.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success('Recording started!', {
        icon: '🎙️',
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (!isRecording) {
      toast.error('No recording in progress.');
      return;
    }

    try {
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop();
      }
      
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      toast.success('Recording stopped!', {
        icon: '⏹️',
        style: {
          borderRadius: '12px',
          background: '#f59e0b',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Error stopping recording. Recording may have ended unexpectedly.');
      setIsRecording(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioBlob(file);
        toast.success('Audio file uploaded!', {
          icon: '📁',
          style: {
            borderRadius: '12px',
            background: '#3b82f6',
            color: '#fff',
          },
        });
      } else {
        toast.error('Please select an audio file.');
      }
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const submitAudio = () => {
    try {
      if (!audioBlob) {
        toast.error('No audio to transcribe. Please record or upload audio first.');
        return;
      }

      if (!onTranscription) {
        toast.error('Transcription service not available. Please refresh the page.');
        return;
      }

      console.log('Submitting audio for transcription:', {
        size: audioBlob.size,
        type: audioBlob.type
      });

      onTranscription(audioBlob);
    } catch (error) {
      console.error('Error submitting audio:', error);
      toast.error('Failed to submit audio for transcription. Please try again.');
    }
  };

  const deleteAudio = () => {
    try {
      // Ask for confirmation before deleting
      const confirmed = window.confirm('Are you sure you want to delete this audio recording? This action cannot be undone.');
      
      if (!confirmed) {
        return;
      }

      // Clear the audio blob
      setAudioBlob(null);
      
      // Reset playback state
      setIsPlaying(false);
      
      // Clean up the audio reference
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success('Audio recording deleted', {
        icon: '🗑️',
        style: {
          borderRadius: '12px',
          background: '#f59e0b',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error deleting audio:', error);
      toast.error('Failed to delete audio. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50"
        animate={{ opacity: isRecording ? 0.8 : 0.3 }}
        transition={{ duration: 0.5 }}
      />
      
      <div className="relative z-10">
        <motion.h3 
          className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ rotate: isRecording ? 360 : 0 }}
            transition={{ duration: 2, repeat: isRecording ? Infinity : 0, ease: "linear" }}
          >
            <MicrophoneIcon className="h-7 w-7 text-blue-600" />
          </motion.div>
          <span>Audio Input</span>
        </motion.h3>
        
        <div className="flex flex-col space-y-6">
          {/* Recording Visualizer */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center justify-center py-8"
              >
                <div className="flex items-center space-x-2">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full"
                      style={{
                        width: '4px',
                        height: `${20 + (audioLevel * 60 * Math.random())}px`,
                      }}
                      animate={{
                        height: [
                          `${20 + (audioLevel * 60 * Math.random())}px`,
                          `${40 + (audioLevel * 80 * Math.random())}px`,
                          `${20 + (audioLevel * 60 * Math.random())}px`,
                        ],
                      }}
                      transition={{
                        duration: 0.5 + Math.random() * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recording Controls */}
          <div className="flex items-center justify-center space-x-6">
            {!isRecording ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                className="relative flex items-center space-x-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl"
              >
                <MicrophoneIcon className="h-7 w-7" />
                <span className="text-lg">Start Recording</span>
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-2xl"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopRecording}
                className="flex items-center space-x-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 recording shadow-xl"
              >
                <StopIcon className="h-7 w-7" />
                <span className="text-lg">Stop Recording</span>
              </motion.button>
            )}
          </div>

          {/* Recording Time */}
          <AnimatePresence>
            {isRecording && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <motion.div 
                  className="text-4xl font-mono font-black text-red-500 mb-3"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {formatTime(recordingTime)}
                </motion.div>
                <div className="flex items-center justify-center space-x-3 text-red-500">
                  <motion.div 
                    className="h-4 w-4 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="font-semibold">Recording in progress...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File Upload Option */}
          <motion.div 
            className="border-t border-gray-200/50 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center text-gray-500 mb-4 font-medium">Or upload an audio file</div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary w-full flex items-center justify-center space-x-3 text-lg py-4"
            >
              <DocumentArrowUpIcon className="h-6 w-6" />
              <span>Upload Audio File</span>
            </motion.button>
          </motion.div>

          {/* Audio Preview and Submit */}
          <AnimatePresence>
            {audioBlob && !isRecording && (
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ type: "spring", bounce: 0.3 }}
                className="space-y-6"
              >
                {/* Audio Preview */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <SpeakerWaveIcon className="h-6 w-6 text-gray-600" />
                      <span className="font-semibold text-gray-700">Audio Preview</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlayback}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                        title={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? (
                          <PauseIcon className="h-5 w-5" />
                        ) : (
                          <PlayIcon className="h-5 w-5" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={deleteAudio}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Delete recording"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>
                  <audio 
                    ref={audioRef}
                    src={URL.createObjectURL(audioBlob)}
                    className="w-full"
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {/* Delete Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={deleteAudio}
                    disabled={isProcessing}
                    className="btn-secondary flex-1 text-lg py-4 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                    <span>Delete</span>
                  </motion.button>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={submitAudio}
                    disabled={isProcessing}
                    className="btn-primary flex-[2] text-xl py-4 disabled:opacity-50 relative overflow-hidden"
                  >
                    <AnimatePresence>
                      {isProcessing ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center space-x-3"
                        >
                          <div className="spinner h-6 w-6"></div>
                          <span>Processing Audio...</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center space-x-3"
                        >
                          <SparklesIcon className="h-6 w-6" />
                          <span>Transcribe Audio</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {isProcessing && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AudioRecorder;