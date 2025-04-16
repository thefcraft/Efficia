import React, { useState, useEffect, useRef, useCallback } from 'react';

const AudioTranscription = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/ws/transcribe");

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event: MessageEvent) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.start();

      mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          event.data.arrayBuffer().then((buffer) => {
            ws.current?.send(buffer);
          });
        }
      };

      console.log("Recording started");
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    console.log("Recording stopped");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">WebSocket Audio Transcription</h1>
      <button
        onClick={startRecording}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        Start Recording
      </button>
      <button
        onClick={stopRecording}
        className="mt-4 ml-2 px-4 py-2 bg-red-500 text-white rounded"
      >
        Stop Recording
      </button>
      <div className="mt-4 p-2 border rounded">
        <h2 className="text-lg font-semibold">Transcription:</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AudioTranscription;