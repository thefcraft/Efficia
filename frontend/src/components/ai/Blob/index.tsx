import React, { useMemo, useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import vertexShader from "./vertexShader";
import fragmentShader from "./fragmentShader";

// Define types for the props
interface BlobProps {
  analyser: React.MutableRefObject<AnalyserNode | null>;
  onpause?: () => void;
  pauseThreshold?: number; // Optional: time threshold for pause detection (in ms)
  intensityThreshold?: number; // Optional: intensity threshold for pause detection
}

const Blob: React.FC<BlobProps> = ({ 
  analyser, 
  onpause, 
  pauseThreshold = 1500, // Reduced from 3000
  intensityThreshold = 0.85 // Increased from 0.75
}) => {
  const mesh = useRef<THREE.Mesh>(null);
  // Track low intensity duration
  const lowIntensityStartTime = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  // Track if any speech was detected
  const hasSpoken = useRef(0);
  const frequencyData = useRef<Uint8Array>(new Uint8Array(256)); // To store the frequency data

  // Function to update frequency data
  const updateFrequencyData = () => {
    if (analyser?.current) {
      analyser.current.getByteFrequencyData(frequencyData.current); // Get frequency data
    }
  };

  // Calculate audio intensity (e.g., average frequency or max value)
  const calculateAudioIntensity = () => {
    let sum = 0;
    for (let i = 0; i < frequencyData.current.length; i++) {
      sum += frequencyData.current[i];
    }
    const average = sum / frequencyData.current.length;
    return average / 255; // Normalize between 0 and 1
  };

  const uniforms = useMemo(() => {
    return {
      u_time: { value: 0 },
      u_intensity: { value: 0.3 },
      u_audioIntensity: { value: 0 },
    };
  }, []);

  useFrame((state) => {
    const { clock } = state;
    if (mesh.current) {
      const currentTime = performance.now();
      // Multiply by 15 to scale the intensity to a usable range
      const inst = calculateAudioIntensity() * 15;
      
      const material = mesh.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = 0.4 * clock.getElapsedTime();
      material.uniforms.u_intensity.value = MathUtils.lerp(
        material.uniforms.u_intensity.value,
        inst > 0.5 ? Math.min(inst * 0.5, 1.75) : 0.1,
        0.02
      );
      
      // Only trigger onpause if there has been some speech (intensity above threshold) before
      if (inst >= intensityThreshold) {
        // Speech detected, mark that speaking occurred and reset timer.
        hasSpoken.current++;
        lowIntensityStartTime.current = null;
        setIsPaused(false);
      } else if (hasSpoken.current > 100) {
        // Below threshold and speech was previously detected
        if (lowIntensityStartTime.current === null) {
          lowIntensityStartTime.current = currentTime;
        } else if (currentTime - lowIntensityStartTime.current > pauseThreshold) {
          // Pause detected: call onpause only once
          if (!isPaused) {
            // Reset the spoken flag so further pauses are not triggered until new speech
            hasSpoken.current = 0;
            setIsPaused(true);
            onpause && onpause();
          }
        }
      }
      
      updateFrequencyData();
    }
  });

  return (
    <mesh
      ref={mesh}
      scale={1.5}
      position={[0, 0, 0]}
    >
      <icosahedronBufferGeometry args={[2, 20]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export default Blob;