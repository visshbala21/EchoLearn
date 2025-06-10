import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Session management
  async createSession(title = 'New Learning Session') {
    const response = await api.post('/sessions/', null, {
      params: { title }
    });
    return response.data;
  },

  async getSessions() {
    const response = await api.get('/sessions/');
    return response.data;
  },

  async getSession(sessionId) {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },

  // Audio transcription
  async transcribeAudio(audioFile, sessionId = null) {
    const formData = new FormData();
    formData.append('file', audioFile);
    if (sessionId) {
      formData.append('session_id', sessionId);
    }

    const response = await api.post('/transcribe/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Text summarization
  async summarizeContent(sessionId) {
    const response = await api.post('/summarize/', null, {
      params: { session_id: sessionId }
    });
    return response.data;
  },

  // Quiz generation and management
  async generateQuiz(sessionId, numQuestions = 3) {
    const response = await api.post('/quiz/generate/', null, {
      params: { session_id: sessionId, num_questions: numQuestions }
    });
    return response.data;
  },

  async submitQuizAnswer(quizId, userAnswer, timeTaken) {
    const response = await api.post('/quiz/answer/', null, {
      params: { 
        quiz_id: quizId, 
        user_answer: userAnswer, 
        time_taken: timeTaken 
      }
    });
    return response.data;
  },

  async getQuizQuestions(sessionId) {
    const response = await api.get(`/quiz/${sessionId}`);
    return response.data;
  },

  // AI clarification
  async getClarification(concept, sessionId) {
    const response = await api.post('/clarify/', null, {
      params: { concept, session_id: sessionId }
    });
    return response.data;
  },

  // ASL translation
  async translateToASL(text) {
    const response = await api.post('/asl/translate/', null, {
      params: { text }
    });
    return response.data;
  },

  // Progress tracking
  async getUserProgress(sessionId) {
    const response = await api.get(`/progress/${sessionId}`);
    return response.data;
  },

  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  }
};

// WebSocket service for real-time updates
export class WebSocketService {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.ws = null;
    this.listeners = {};
  }

  connect() {
    const wsUrl = API_URL.replace('http', 'ws') + `/ws/${this.sessionId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit(data.type, data);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

export default apiService; 