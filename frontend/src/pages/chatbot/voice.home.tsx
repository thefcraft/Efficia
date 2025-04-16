import BlobComponent from "@/components/ai/Blob";
import { Canvas } from "@react-three/fiber";
import React, { useState, useRef, useEffect } from "react";
import { Vector3 } from "three";

export default function VoiceBotHome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [responseAudio, setResponseAudio] = useState(null);
  const [userMessage, setUserMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const source = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  // Start microphone and recording
  const startListening = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioContext.current = new (window.AudioContext)();
          analyser.current = audioContext.current.createAnalyser();
          analyser.current.fftSize = 256;
          source.current = audioContext.current.createMediaStreamSource(stream);
          source.current.connect(analyser.current);
          
          // Set up media recorder for STT
          mediaRecorder.current = new MediaRecorder(stream);
          audioChunks.current = [];
          
          mediaRecorder.current.ondataavailable = (event) => {
              audioChunks.current.push(event.data);
          };
          
          mediaRecorder.current.onstart = () => {
              setIsListening(true);
              setIsPlaying(true);
              console.log("Recording started");
          };
          
          mediaRecorder.current.onstop = async () => {
              setIsListening(false);
              console.log("Recording stopped");
              
              // Create audio blob from recorded chunks
              const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
              
              // Send audio to backend for STT and LLM processing
              await processAudioAndGetResponse(audioBlob);
          };
          
          // Start recording
          mediaRecorder.current.start();
          
      } catch (error) {
          console.error("Error accessing microphone:", error);
          alert("Error accessing microphone. Please check permissions.");
      }
  };
  // Stop recording and disconnect audio
  const stopListening = () => {
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
          mediaRecorder.current.stop();
      }
  };
  // Send audio to backend and get TTS response
  const processAudioAndGetResponse = async (audioBlob) => {
      try {
          // Create form data for the audio file
          const formData = new FormData();
          formData.append('audio', audioBlob);
          
          // Send to backend
          const response = await fetch('http://localhost:8001/process-audio', {
              method: 'POST',
              body: formData,
          });
          
          if (!response.ok) {
              throw new Error(`Server responded with ${response.status}`);
          }
          
          // Get both text and audio from response
          const responseData = await response.json();
          setUserMessage(responseData.user_text);
          setAiResponse(responseData.ai_text);
          
          // Play the TTS audio
          const audioUrl = `data:audio/mp3;base64,${responseData.audio_base64}`;
          const audio = new Audio(audioUrl);
          setResponseAudio(audio);
          
          // Play the audio with visualization
          playResponseAudio(audio);
          
      } catch (error) {
          console.error("Error processing audio:", error);
          alert("Error processing audio. Please try again.");
          stopAudio();
      }
  };
  // Play the TTS response audio with visualization
  const playResponseAudio = (audio) => {
      if (!audioContext.current) {
          audioContext.current = new (window.AudioContext)();
      }
      
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;
      
      audio.onplay = () => {
          const newSource = audioContext.current.createMediaElementSource(audio);
          newSource.connect(analyser.current);
          analyser.current.connect(audioContext.current.destination);
          source.current = newSource;
          setIsPlaying(true);
      };
      
      audio.onended = () => {
        stopAudio();
      };
      
      audio.play();
  };
  // Stop all audio
  const stopAudio = () => {
      if (responseAudio) {
          responseAudio.pause();
          responseAudio.currentTime = 0;
      }
      
      if (source.current) {
          source.current.disconnect();
      }
      
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
          mediaRecorder.current.stop();
      }
      
      source.current = null;
      setIsPlaying(false);
      setIsListening(false);
      console.log("Audio stopped");
  };
  if (!isPlaying && !isListening) {
      return (
          <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#1c1c1c',  color: 'white', height: '100dvh', minHeight: '100dvh' }}>
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
              
              {userMessage && (
                  <div style={{ marginTop: '20px', width: '80%', maxWidth: '800px' }}>
                      <h3>You said:</h3>
                      <p style={{ backgroundColor: '#333', padding: '15px', borderRadius: '5px' }}>{userMessage}</p>
                  </div>
              )}
              
              {aiResponse && (
                  <div style={{ marginTop: '20px', width: '80%', maxWidth: '800px' }}>
                      <h3>AI Response:</h3>
                      <p style={{ backgroundColor: '#333', padding: '15px', borderRadius: '5px' }}>{aiResponse}</p>
                  </div>
              )}
          </div>
      );
  }
  return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#1c1c1c', minHeight: '100vh' }}>
          <div style={{ 
              position: 'absolute', 
              top: '20px', 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center',
              zIndex: 100
          }}>
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
              >
                  {isListening ? "Stop Listening" : "Stop Audio"}
              </button>
          </div>
          <Canvas camera={{ position: new Vector3(0.0, 0.0, 8.0) }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <BlobComponent analyser={analyser} />
          </Canvas>
          
          {isListening && (
              <div style={{ 
                  position: 'absolute', 
                  bottom: '20px', 
                  backgroundColor: 'rgba(0, 0, 0, 0.7)', 
                  padding: '10px 20px', 
                  borderRadius: '5px',
                  color: 'white'
              }}>
                  Listening...
              </div>
          )}
      </div>
  );
}