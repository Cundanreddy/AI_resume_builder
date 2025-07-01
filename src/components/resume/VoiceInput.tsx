import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Volume2 } from 'lucide-react';

interface VoiceInputProps {
  onTextReceived: (text: string) => void;
  isActive: boolean;
  onStop: () => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTextReceived, isActive, onStop }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);

      if (finalTranscript) {
        onTextReceived(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTextReceived]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  if (!isActive) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-900 flex items-center">
          <Volume2 className="w-5 h-5 mr-2" />
          Voice Input
        </h3>
        <button
          onClick={onStop}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Close
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={startListening}
          disabled={isListening}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isListening
              ? 'bg-red-100 text-red-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Mic className="w-5 h-5" />
          <span>{isListening ? 'Listening...' : 'Start Recording'}</span>
        </button>

        {isListening && (
          <button
            onClick={stopListening}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Square className="w-5 h-5" />
            <span>Stop</span>
          </button>
        )}

        {isListening && (
          <div className="flex items-center space-x-2 text-red-600">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording...</span>
          </div>
        )}
      </div>

      {transcript && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Transcript:</h4>
          <p className="text-gray-900">{transcript}</p>
        </div>
      )}

      <div className="mt-4 text-sm text-blue-700">
        <p>💡 <strong>Tip:</strong> Speak clearly and at a normal pace. The text will automatically populate the selected form field.</p>
      </div>
    </div>
  );
};

export default VoiceInput;