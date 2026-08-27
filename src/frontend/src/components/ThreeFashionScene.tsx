"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeFashionSceneProps {
  className?: string;
  interactive?: boolean;
}

export const ThreeFashionScene: React.FC<ThreeFashionSceneProps> = ({
  className = "w-full h-full min-h-[380px]",
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xd4af37, 2.8, 50);
    goldLight.position.set(5, 5, 5);
    scene.add(goldLight);

    const violetLight = new THREE.PointLight(0xa855f7, 2.2, 50);
    violetLight.position.set(-5, -3, 3);
    scene.add(violetLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 1.8, 50);
    cyanLight.position.set(0, 4, -4);
    scene.add(cyanLight);

    // 3. Central Couture Gem / Polyhedral Mesh
    const group = new THREE.Group();
    scene.add(group);

    // Faceted Gem Geometry
    const gemGeo = new THREE.IcosahedronGeometry(1.5, 0);
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0x111319,
      emissive: 0x241804,
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
      wireframe: false,
    });
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);
    group.add(gemMesh);

    // Wireframe Overlay
    const wireGeo = new THREE.IcosahedronGeometry(1.52, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    group.add(wireMesh);

    // 4. Orbiting Atelier Rings
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true,
    });
    const ringGeo1 = new THREE.TorusGeometry(2.2, 0.02, 16, 100);
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    group.add(ring1);

    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      metalness: 0.8,
      roughness: 0.3,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const ringGeo2 = new THREE.TorusGeometry(2.6, 0.015, 16, 100);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    group.add(ring2);

    // 5. 3D Particle Constellation / Sparkling Stardust
    const particleCount = 220;
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);

    const goldColor = new THREE.Color(0xd4af37);
    const violetColor = new THREE.Color(0xc084fc);
    const cyanColor = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 12;
      posArray[i + 1] = (Math.random() - 0.5) * 10;
      posArray[i + 2] = (Math.random() - 0.5) * 10;

      const rand = Math.random();
      const chosenColor = rand > 0.6 ? goldColor : rand > 0.3 ? violetColor : cyanColor;
      colorArray[i] = chosenColor.r;
      colorArray[i + 1] = chosenColor.g;
      colorArray[i + 2] = chosenColor.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 6. Mouse Interaction
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive) return;
      const rect = mount.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

      targetRotationY = mouseX * 0.9;
      targetRotationX = mouseY * 0.9;
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // 7. Resize Observer
    const handleResize = () => {
      if (!mount) return;
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // 8. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth idle rotation + mouse drift
      group.rotation.y += 0.006;
      group.rotation.x += 0.003;

      group.rotation.y += (targetRotationY - group.rotation.y) * 0.03;
      group.rotation.x += (targetRotationX - group.rotation.x) * 0.03;

      // Orbiting rings
      ring1.rotation.z = elapsedTime * 0.3;
      ring2.rotation.x = elapsedTime * 0.25;

      // Pulse gem wireframe
      const pulse = 1 + Math.sin(elapsedTime * 2) * 0.03;
      wireMesh.scale.set(pulse, pulse, pulse);

      // Particle system gentle rotation
      particleSystem.rotation.y = elapsedTime * 0.03;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.1) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      gemGeo.dispose();
      gemMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [interactive]);

  return (
    <div
      ref={mountRef}
      className={`relative overflow-hidden cursor-grab active:cursor-grabbing select-none ${className}`}
    />
  );
};

export default ThreeFashionScene;
