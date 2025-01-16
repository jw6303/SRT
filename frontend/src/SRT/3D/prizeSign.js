import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Sphere } from "@react-three/drei";
import * as THREE from "three";

const PrizeSign = ({ prizeAmount = "200 SOL", prizeDetails = "Exciting Prize Awaits!" }) => {
  const textRef = useRef();
  const particlesRef = useRef([]);

  // Frame-by-frame animation for the text and particles
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Animate the text
    if (textRef.current) {
      textRef.current.rotation.y = time * 0.5; // Rotate slowly
      textRef.current.position.y = Math.sin(time * 2) * 0.5; // Bounce vertically
    }

    // Animate particles
    particlesRef.current.forEach((particle, i) => {
      if (!particle) return;
      const angle = time + i * 0.3; // Adjust angle for each particle
      particle.position.x = Math.cos(angle) * 3; // Circular motion
      particle.position.z = Math.sin(angle) * 3;
      particle.position.y = Math.sin(angle * 2) * 1; // Oscillate up and down
    });
  });

  // Create particles (small glowing spheres)
  const particles = Array.from({ length: 30 }).map((_, i) => (
    <Sphere
      key={i}
      args={[0.1, 16, 16]} // Small sphere
      position={[Math.random() * 6 - 3, Math.random() * 2 - 1, Math.random() * 6 - 3]} // Random starting position
      ref={(ref) => (particlesRef.current[i] = ref)}
    >
      <meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={2} />
    </Sphere>
  ));

  return (
    <group>
      {/* Dynamic 3D Text */}
      <Text
        ref={textRef}
        fontSize={0.8}
        color="cyan"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="blue"
      >
        Win {prizeAmount}
      </Text>

      {/* Static Prize Details */}
      <Text
        fontSize={0.4}
        color="yellow"
        position={[0, -1.5, 0]} // Below the prize amount
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="orange"
      >
        {prizeDetails}
      </Text>

      {/* Animated Particles */}
      <group>{particles}</group>
    </group>
  );
};

export default PrizeSign;
