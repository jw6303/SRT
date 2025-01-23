import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const SolChart = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111); // Dark background

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 50); // Adjusted position for better view

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasRef.current.appendChild(renderer.domElement);

    // OrbitControls to allow camera movement
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.maxPolarAngle = Math.PI / 2;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Add point light for more depth
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    camera.add(pointLight);

    // Create floating 3D objects (e.g., cubes, spheres)
    const numObjects = 100;
    const objects = [];

    for (let i = 0; i < numObjects; i++) {
      const geometry = new THREE.SphereGeometry(0.5, 8, 8); // Spheres for floating effect
      const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.x = Math.random() * 20 - 10;
      sphere.position.y = Math.random() * 10 - 5;
      sphere.position.z = Math.random() * 50 - 50;  // Distance along the Z-axis
      scene.add(sphere);
      objects.push(sphere);
    }

    // Function to create text as 3D planes
    const createTextPlane = (text, size = 2, color = 0x00ff00) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      // Set canvas size
      context.font = `${size}px monospace`;
      const textWidth = context.measureText(text).width;
      canvas.width = textWidth;
      canvas.height = size * 1.5;  // height of the text

      // Draw the text onto the canvas
      context.fillStyle = color;
      context.fillText(text, 0, size);

      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);

      // Create plane geometry and material with the canvas texture
      const planeGeometry = new THREE.PlaneGeometry(textWidth, size * 1.5);
      const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });

      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      return plane;
    };

    // Add text planes to the scene
    const text1 = createTextPlane("Solana Raffle Terminal");
    text1.position.set(-10, 10, -20);  // Position text in 3D space
    scene.add(text1);

    const text2 = createTextPlane("Welcome to the 3D CLI");
    text2.position.set(-10, 5, -20);  // Position second line of text
    scene.add(text2);

    // Animation loop for 3D background
    function animate() {
      requestAnimationFrame(animate);

      objects.forEach((obj) => {
        obj.position.z += 0.1;
        if (obj.position.z > 50) {
          obj.position.z = -50;
        }

        const scaleFactor = Math.max(0.5, (obj.position.z + 50) / 50);
        obj.scale.set(scaleFactor, scaleFactor, scaleFactor);
      });

      scene.rotation.y += 0.001; // Rotate the scene for dynamic effect
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // Handle window resizing
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Cleanup on component unmount
    return () => {
      renderer.dispose();
      canvasRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={canvasRef}></div>;
};

export default SolChart;
