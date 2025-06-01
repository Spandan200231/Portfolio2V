import { useEffect, useRef } from "react";

declare global {
  interface Window {
    THREE: any;
  }
}

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check if Three.js is loaded
    const checkThreeJS = () => {
      return new Promise<void>((resolve) => {
        if (window.THREE) {
          resolve();
        } else {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/three@0.155.0/build/three.min.js";
          script.onload = () => resolve();
          document.head.appendChild(script);
        }
      });
    };

    checkThreeJS().then(() => {
      const THREE = window.THREE;
      const container = containerRef.current;
      if (!container) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      
      const renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      // Create floating geometric shapes
      const geometry1 = new THREE.BoxGeometry(1, 1, 1);
      const geometry2 = new THREE.SphereGeometry(0.7, 32, 32);
      const geometry3 = new THREE.ConeGeometry(0.5, 1.5, 8);
      
      const material1 = new THREE.MeshBasicMaterial({ 
        color: 0x2563EB, 
        transparent: true, 
        opacity: 0.1,
        wireframe: true 
      });
      const material2 = new THREE.MeshBasicMaterial({ 
        color: 0xF59E0B, 
        transparent: true, 
        opacity: 0.1,
        wireframe: true 
      });
      const material3 = new THREE.MeshBasicMaterial({ 
        color: 0x10B981, 
        transparent: true, 
        opacity: 0.1,
        wireframe: true 
      });

      const cube = new THREE.Mesh(geometry1, material1);
      const sphere = new THREE.Mesh(geometry2, material2);
      const cone = new THREE.Mesh(geometry3, material3);

      cube.position.set(-5, 2, -5);
      sphere.position.set(5, -2, -8);
      cone.position.set(0, 4, -10);

      scene.add(cube);
      scene.add(sphere);
      scene.add(cone);

      camera.position.z = 5;

      let animationId: number;

      const animate = () => {
        animationId = requestAnimationFrame(animate);

        cube.rotation.x += 0.005;
        cube.rotation.y += 0.005;
        
        sphere.rotation.x += 0.003;
        sphere.rotation.z += 0.003;
        
        cone.rotation.y += 0.007;

        renderer.render(scene, camera);
      };

      animate();

      // Handle window resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        window.removeEventListener('resize', handleResize);
        if (container && renderer.domElement) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    });
  }, []);

  return <div id="three-container" ref={containerRef} />;
}
