import React, { useState, useRef, useEffect } from 'react';
import BlobComponent from "@/components/ai/Blob";
import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";

const AudioTranscription = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  const [responseAudio, setResponseAudio] = useState<HTMLAudioElement | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const source = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const micStream = useRef<MediaStream | null>(null);

  // Start microphone and recording
  const startListening = async () => {
    if (isFirst) {
      setIsFirst(false);
      setIsListening(true);
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.current = stream;
      // Create a new AudioContext for microphone
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;
      source.current = audioContext.current.createMediaStreamSource(stream);
      source.current.connect(analyser.current);
      
      // Set up media recorder for STT
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
        console.log("Recording data available");
      };
      
      mediaRecorder.current.onstart = () => {
        setIsListening(true);
        console.log("Recording started");
      };
      
      mediaRecorder.current.onstop = async () => {
        setIsListening(false);
        console.log("Recording stopped");
        cleanupMicStream();
        
        // Create audio blob from recorded chunks
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        
        // Only process audio if there are chunks
        if (audioBlob.size > 0) {
          await processAudio(audioBlob);
        }
      };
      
      // Start recording
      mediaRecorder.current.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Error accessing microphone. Please check permissions.");
    }
  };

  // Play the TTS response audio with visualization
  const playResponseAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous"; // allow cross-origin for audio processing
    setResponseAudio(audio);

    audio.onplay = async () => {
      // Use existing AudioContext or create a new one if needed
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContext.current.state === "suspended") {
        await audioContext.current.resume();
      }
      
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;
      
      // Create media element source and connect to analyser and destination
      source.current = audioContext.current.createMediaElementSource(audio);
      source.current.connect(analyser.current);
      analyser.current.connect(audioContext.current.destination);
      
      setIsPlaying(true);
    };

    audio.onerror = (error) => {
      console.error('Audio playback error:', error);
    };

    audio.onended = () => {
      console.log("Audio playback ended");
      // When the TTS audio ends, stop it with a small delay
      stopAudio();
    };

    audio.play();
  };
  
  const processAudio = async (audioBlob: Blob) => {
    try {
      // Create form data for the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob);

      // Send to backend
      const response = await fetch('http://localhost:8000/process-audio', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const { success, text } = await response.json();
      playResponseAudio(`http://localhost:8001/voice-chat?text=${encodeURIComponent(text)}`);
    } catch (error) {
      console.error("Error processing audio:", error);
      alert("Error processing audio. Please try again.");
      stopAudio();
    }
  };

  // Stop microphone stream by stopping all tracks
  const cleanupMicStream = () => {
    if (micStream.current) {
      micStream.current.getTracks().forEach((track) => track.stop());
      micStream.current = null;
    }
    if (source.current) {
      try {
        source.current.disconnect();
      } catch (e) {
        console.warn("Error disconnecting source", e);
      }
    }
    if (analyser.current) {
      try {
        analyser.current.disconnect();
      } catch (e) {
        console.warn("Error disconnecting analyser", e);
      }
    }
    if (audioContext.current) {
      // Optionally close the audio context if no longer needed
      audioContext.current.close().catch((e) => console.warn("Error closing AudioContext", e));
      audioContext.current = null;
    }
  };

  // Stop recording and disconnect microphone stream
  const stopListening = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
  };

  // Stop all TTS audio playback and cleanup AudioContext for playback
  const stopAudio = () => {
    if (responseAudio) {
      responseAudio.pause();
      responseAudio.currentTime = 0;
      setIsPlaying(false);
      
      // Disconnect playback nodes if any
      if (source.current) {
        try {
          source.current.disconnect();
        } catch (e) {
          console.warn("Error disconnecting source", e);
        }
      }
      if (analyser.current) {
        try {
          analyser.current.disconnect();
        } catch (e) {
          console.warn("Error disconnecting analyser", e);
        }
      }
      
      // Optionally close the AudioContext if no longer needed
      if (audioContext.current) {
        audioContext.current.close().catch((e) => console.warn("Error closing AudioContext", e));
        audioContext.current = null;
      }

    }
    setIsFirst(true);
    setIsPlaying(false);
    setIsListening(false);
  };

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop();
      }
      stopAudio();
      cleanupMicStream();
    };
  }, []);

  return (
    <div
      className="container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#1c1c1c',
        minHeight: '100vh'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '20px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 100
        }}
      >
        {
          !isPlaying && !isListening && isFirst ? 
          <button
            onClick={startListening}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              margin: '20px',
              backgroundColor: '#4CAF50',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Start Listening
          </button>
          : 
          <button
            onClick={isListening ? stopListening : stopAudio}
            style={{
              padding: '10px 20px',
              backgroundColor: isListening ? '#ff4d4d' : '#ff9e00',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            disabled={isListening === false && isPlaying === false}
          >
            {isListening ? "Stop Listening" : "Stop Audio"}
          </button>
        }
      </div>
      <Canvas
        camera={{ position: new Vector3(0.0, 0.0, 8.0) }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <BlobComponent
          analyser={analyser}
          onpause={() => {
            // Stop the current recording if pause is detected from Blob visualization
            if (isListening && mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
              mediaRecorder.current.stop();
            }
          }}
        />
      </Canvas>

      {isListening && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '10px 20px',
            borderRadius: '5px',
            color: 'white'
          }}
        >
          Listening...
        </div>
      )}
    </div>
  );
};

export default AudioTranscription;