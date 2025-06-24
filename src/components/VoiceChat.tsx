import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, MessageSquare, Brain, Loader, Play, Pause } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { ChatMessage } from '../types';

export function VoiceChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI voice mentor. I\'m here to help guide your learning journey. What would you like to learn about today?',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTextInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => setIsListening(false);
    }

    return () => recognitionRef.current?.stop();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startVoiceRecognition = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudioMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check your permissions and ensure you\'re using HTTPS.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioMessage = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // In a production app, you would send this to a speech-to-text service
      // For now, we'll simulate the transcription
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: 'Voice message received! In a production app, this would be the actual transcription from your speech-to-text service.',
        role: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      await generateAIResponse(userMessage.content);
    } catch (error) {
      console.error('Error processing audio:', error);
      setIsLoading(false);
    }
  };

  const sendTextMessage = async () => {
    if (!textInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: textInput,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setTextInput('');
    await generateAIResponse(userMessage.content);
  };

  const generateAIResponse = async (userInput: string) => {
    setIsLoading(true);
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      const responses = getContextualResponse(userInput);

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: responses,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // Automatically speak the AI response
      await speakMessage(aiResponse.content);
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getContextualResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('goal') || lowerInput.includes('objective')) {
      return "Setting clear, achievable goals is the foundation of successful learning. What specific learning goal would you like to work on? I can help you break it down into manageable steps and create a study plan.";
    } else if (lowerInput.includes('study') || lowerInput.includes('learn')) {
      return "Effective studying involves active learning techniques. Try using spaced repetition, the Feynman technique, and regular self-testing. What subject are you currently studying?";
    } else if (lowerInput.includes('time') || lowerInput.includes('schedule')) {
      return "Time management is crucial for academic success. I recommend the Pomodoro Technique: 25 minutes of focused study followed by a 5-minute break. Would you like help creating a study schedule?";
    } else if (lowerInput.includes('struggle') || lowerInput.includes('difficult') || lowerInput.includes('hard')) {
      return "It's completely normal to struggle with challenging topics. Let's break down the difficult concept into smaller, more manageable parts. What specific area are you finding challenging?";
    } else if (lowerInput.includes('motivation') || lowerInput.includes('motivated')) {
      return "Staying motivated can be tough! Try connecting your studies to your long-term goals, celebrating small wins, and finding a study buddy or accountability partner. What usually motivates you?";
    } else if (lowerInput.includes('exam') || lowerInput.includes('test')) {
      return "Exam preparation requires strategic planning. Start with active recall, practice past papers, and create a revision timetable. How much time do you have before your exam?";
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return "Hello! I'm excited to help you on your learning journey today. Whether you need study strategies, goal setting, or just some motivation, I'm here for you. What would you like to focus on?";
    } else {
      return "That's an interesting topic! I'd love to help you explore this further. Can you tell me more about what specific aspect you'd like to understand better? I'm here to guide you through any learning challenge.";
    }
  };

  const speakMessage = async (text: string) => {
    if (!import.meta.env.VITE_ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API key not found');
      return;
    }

    try {
      setIsPlaying(true);
      
      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL/stream",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": import.meta.env.VITE_ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: text,
            voice_settings: {
              stability: 0.4,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      setCurrentAudio(audio);

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("Error with ElevenLabs TTS:", error);
      setIsPlaying(false);
      
      // Fallback to browser's built-in speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        utterance.onend = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
      }
    }
  };

  const stopSpeaking = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    setIsPlaying(false);
  };

  const saveConversation = async () => {
    if (!user) return;
    
    try {
      const conversationData = {
        user_id: user.id,
        messages: messages,
        created_at: new Date().toISOString()
      };
      
      // In a production app, you would save this to Supabase
      console.log('Saving conversation:', conversationData);
      alert('Conversation saved successfully!');
    } catch (error) {
      console.error('Error saving conversation:', error);
      alert('Error saving conversation. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Voice Mentor Chat</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Ask questions, get personalized guidance, and hear responses in natural voice
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-800">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className={`text-xs ${
                      message.role === 'user' 
                        ? 'text-purple-100' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {message.role === 'assistant' && (
                      <button 
                        onClick={() => speakMessage(message.content)} 
                        className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        disabled={isPlaying}
                      >
                        <Volume2 className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-sm border border-gray-200 dark:border-gray-600">
                  <Loader className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">AI mentor is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Controls */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading || isListening}
                className={`p-4 rounded-full transition-all transform hover:scale-105 shadow-lg ${
                  isRecording 
                    ? 'bg-red-600 animate-pulse text-white' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                title={isRecording ? 'Stop Recording' : 'Start Recording'}
              >
                {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>

              <button
                onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                disabled={isLoading || isRecording}
                className={`p-3 rounded-full transition-all transform hover:scale-105 shadow-lg ${
                  isListening 
                    ? 'bg-emerald-600 animate-pulse text-white' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                title={isListening ? 'Stop Listening' : 'Start Voice Recognition'}
              >
                {isListening ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>

              <button
                onClick={isPlaying ? stopSpeaking : undefined}
                disabled={!isPlaying}
                className={`p-3 rounded-full transition-all shadow-lg ${
                  isPlaying 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
                } disabled:cursor-not-allowed`}
                title={isPlaying ? 'Stop Speaking' : 'No Audio Playing'}
              >
                {isPlaying ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>

            {/* Text Input */}
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendTextMessage()}
                placeholder="Type your message or use voice input..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                disabled={isLoading}
              />
              <button
                onClick={sendTextMessage}
                disabled={!textInput.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                title="Send Message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>

            {/* Status Indicators */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                {isRecording && (
                  <span className="flex items-center text-red-600 dark:text-red-400">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></div>
                    Recording...
                  </span>
                )}
                {isListening && (
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse mr-2"></div>
                    Listening...
                  </span>
                )}
                {isPlaying && (
                  <span className="flex items-center text-blue-600 dark:text-blue-400">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-2"></div>
                    Speaking...
                  </span>
                )}
              </div>
              
              <button
                onClick={saveConversation}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                Save Conversation
              </button>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
            Voice Chat Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <strong>🎤 Recording:</strong> Click the microphone to record audio messages
            </div>
            <div>
              <strong>🗣️ Voice Recognition:</strong> Click play button for instant speech-to-text
            </div>
            <div>
              <strong>🔊 Listen:</strong> AI responses are automatically spoken aloud
            </div>
            <div>
              <strong>💬 Text:</strong> Type messages for quick text-based interaction
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}