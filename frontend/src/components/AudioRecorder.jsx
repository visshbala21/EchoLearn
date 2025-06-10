import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  MicrophoneIcon, 
  StopIcon, 
  DocumentArrowUpIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

const AudioRecorder = ({ onTranscription, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
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
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.current.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success('Recording started!');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      toast.success('Recording stopped!');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioBlob(file);
        toast.success('Audio file uploaded!');
      } else {
        toast.error('Please select an audio file.');
      }
    }
  };

  const submitAudio = () => {
    if (audioBlob && onTranscription) {
      onTranscription(audioBlob);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <MicrophoneIcon className="h-5 w-5" />
        <span>Audio Input</span>
      </h3>
      
      {/* Recording Controls */}
      <div className="flex flex-col space-y-4">
        {/* Recording Button */}
        <div className="flex items-center justify-center space-x-4">
          {!isRecording ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-full transition-colors duration-200"
            >
              <MicrophoneIcon className="h-6 w-6" />
              <span>Start Recording</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-full transition-colors duration-200 recording"
            >
              <StopIcon className="h-6 w-6" />
              <span>Stop Recording</span>
            </motion.button>
          )}
        </div>

        {/* Recording Time */}
        {isRecording && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="text-2xl font-mono text-red-600 mb-2">
              {formatTime(recordingTime)}
            </div>
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <div className="h-3 w-3 bg-red-600 rounded-full pulse-slow"></div>
              <span className="text-sm">Recording in progress...</span>
            </div>
          </motion.div>
        )}

        {/* File Upload Option */}
        <div className="border-t pt-4">
          <div className="text-center text-gray-500 mb-3">Or upload an audio file</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary w-full flex items-center justify-center space-x-2"
          >
            <DocumentArrowUpIcon className="h-5 w-5" />
            <span>Upload Audio File</span>
          </motion.button>
        </div>

        {/* Audio Preview and Submit */}
        {audioBlob && !isRecording && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Audio Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <SpeakerWaveIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Audio Preview</span>
              </div>
              <audio 
                controls 
                src={URL.createObjectURL(audioBlob)}
                className="w-full"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={submitAudio}
              disabled={isProcessing}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Audio...
                </>
              ) : (
                'Transcribe Audio'
              )}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder; 