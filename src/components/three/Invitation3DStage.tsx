"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { Ornament3DType, ParticleType } from "@/lib/templates";

type Invitation3DStageProps = {
  backgroundHex: string;
  deepHex: string;
  accentHex: string;
  highlightHex: string;
  softHex: string;
  ornament3D: Ornament3DType;
  particles: ParticleType;
  monogramText: string;
  coupleNames: string;
  eventDate: string;
  explode?: number; // 0..1 separated layers
  height?: number;
  interactiveHint?: boolean;
  onCardClick?: () => void;
};

const _dummyObj = new THREE.Object3D();

function createCardFaceTexture(
  bgHex: string,
  deepHex: string,
  highlightHex: string,
  coupleNames: string,
  eventDate: string,
  monogramText: string
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Paper fill
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle cotton fiber texture
    ctx.fillStyle = "rgba(0,0,0,0.02)";
    for (let i = 0; i < 1600; i += 1) {
      const rx = (i * 197) % canvas.width;
      const ry = (i * 331) % canvas.height;
      ctx.fillRect(rx, ry, 2, 1);
    }

    // Double architectural border
    ctx.strokeStyle = highlightHex;
    ctx.lineWidth = 3;
    ctx.strokeRect(46, 46, canvas.width - 92, canvas.height - 92);
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.45;
    ctx.strokeRect(62, 62, canvas.width - 124, canvas.height - 124);
    ctx.globalAlpha = 1;

    // Monogram crest at top
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 190, 56, 0, Math.PI * 2);
    ctx.strokeStyle = highlightHex;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = deepHex;
    ctx.textAlign = "center";
    ctx.font = "500 28px Georgia, serif";
    ctx.fillText(monogramText || "R · M", canvas.width / 2, 200);

    // Eyebrow
    ctx.font = "600 18px sans-serif";
    ctx.globalAlpha = 0.72;
    ctx.fillText("THE WEDDING CELEBRATION OF", canvas.width / 2, 320);
    ctx.globalAlpha = 1;

    // Couple names
    ctx.fillStyle = deepHex;
    ctx.font = "italic 64px Georgia, serif";
    const parts = coupleNames.split("&");
    if (parts.length === 2) {
      ctx.fillText(parts[0].trim(), canvas.width / 2, 430);
      ctx.fillStyle = highlightHex;
      ctx.font = "italic 44px Georgia, serif";
      ctx.fillText("&", canvas.width / 2, 495);
      ctx.fillStyle = deepHex;
      ctx.font = "italic 64px Georgia, serif";
      ctx.fillText(parts[1].trim(), canvas.width / 2, 565);
    } else {
      ctx.fillText(coupleNames, canvas.width / 2, 490);
    }

    // Divider line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 70, 640);
    ctx.lineTo(canvas.width / 2 + 70, 640);
    ctx.strokeStyle = highlightHex;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Event Date
    ctx.fillStyle = deepHex;
    ctx.font = "500 24px Georgia, serif";
    ctx.fillText(eventDate, canvas.width / 2, 705);

    ctx.font = "500 16px sans-serif";
    ctx.globalAlpha = 0.65;
    ctx.fillText("RONA DIGITAL ATELIER", canvas.width / 2, 910);
    ctx.globalAlpha = 1;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export default function Invitation3DStage({
  backgroundHex,
  deepHex,
  accentHex,
  highlightHex,
  softHex,
  ornament3D,
  particles,
  monogramText,
  coupleNames,
  eventDate,
  explode = 0,
  height = 460,
  onCardClick,
}: Invitation3DStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webglFallback, setWebglFallback] = useState(false);

  const propsRef = useRef({
    backgroundHex,
    deepHex,
    accentHex,
    highlightHex,
    softHex,
    ornament3D,
    particles,
    monogramText,
    coupleNames,
    eventDate,
    explode,
  });
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const spinBurstRef = useRef(0);
  const rebuildMaterialsRef = useRef<(() => void) | null>(null);
  const onCardClickRef = useRef(onCardClick);

  useEffect(() => {
    onCardClickRef.current = onCardClick;
  }, [onCardClick]);

  // Trigger material & texture refresh when design props change
  useEffect(() => {
    propsRef.current = {
      backgroundHex,
      deepHex,
      accentHex,
      highlightHex,
      softHex,
      ornament3D,
      particles,
      monogramText,
      coupleNames,
      eventDate,
      explode,
    };
    spinBurstRef.current = 0.35;
    rebuildMaterialsRef.current?.();
  }, [
    backgroundHex,
    deepHex,
    accentHex,
    highlightHex,
    softHex,
    ornament3D,
    particles,
    monogramText,
    coupleNames,
    eventDate,
    explode,
  ]);

  useEffect(() => {
    const mount = containerRef.current;
    if (!mount) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let isSoftwareGl = false;
    try {
      const probe = document.createElement("canvas").getContext("webgl2");
      if (!probe) {
        isSoftwareGl = true;
      } else {
        const ext = probe.getExtension("WEBGL_debug_renderer_info");
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension("WEBGL_lose_context")?.loseContext();
        isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      }
    } catch {
      isSoftwareGl = true;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      queueMicrotask(() => setWebglFallback(true));
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const initialWidth = mount.clientWidth || 480;
    const initialHeight = mount.clientHeight || height;
    renderer.setSize(initialWidth, initialHeight);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.cursor = "pointer";

    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      38,
      initialWidth / Math.max(1, initialHeight),
      0.1,
      50
    );
    camera.position.set(0, 0.35, 6.2);
    camera.lookAt(0, 0, 0);

    // 3-Point Studio Lighting
    const keyLight = new THREE.DirectionalLight(0xfff5e4, 1.85);
    keyLight.position.set(3.8, 5.2, 4.6);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    const d = 4;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xeef4ff, 0x7d6d5a, 0.85);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0xffe4b8, 0.95);
    rimLight.position.set(-4.2, 2.2, -3.5);
    scene.add(rimLight);

    // Master Composite Diorama Group
    const dioramaGroup = new THREE.Group();
    scene.add(dioramaGroup);

    // Layer 0: Back Envelope / Soft Backing Plate
    const backCardGeo = new THREE.BoxGeometry(2.65, 3.45, 0.08);
    const backCardMat = new THREE.MeshStandardMaterial({
      color: propsRef.current.softHex,
      roughness: 0.88,
      metalness: 0.04,
    });
    const backCardMesh = new THREE.Mesh(backCardGeo, backCardMat);
    backCardMesh.position.set(-0.22, -0.05, -0.28);
    backCardMesh.rotation.z = 0.07;
    backCardMesh.castShadow = true;
    backCardMesh.receiveShadow = true;
    dioramaGroup.add(backCardMesh);

    // Layer 1: Gold Bevel Frame Rim behind Main Card
    const frameRimGeo = new THREE.BoxGeometry(2.58, 3.38, 0.04);
    const frameRimMat = new THREE.MeshPhysicalMaterial({
      color: propsRef.current.highlightHex,
      roughness: 0.25,
      metalness: 0.9,
      clearcoat: 0.6,
    });
    const frameRimMesh = new THREE.Mesh(frameRimGeo, frameRimMat);
    frameRimMesh.position.set(0.02, 0.02, -0.06);
    frameRimMesh.castShadow = true;
    dioramaGroup.add(frameRimMesh);

    // Layer 2: Main Printed Invitation Card with CanvasTexture
    const mainCardGeo = new THREE.BoxGeometry(2.44, 3.24, 0.07);
    let faceTexture = createCardFaceTexture(
      propsRef.current.backgroundHex,
      propsRef.current.deepHex,
      propsRef.current.highlightHex,
      propsRef.current.coupleNames,
      propsRef.current.eventDate,
      propsRef.current.monogramText
    );
    faceTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const paperEdgeMat = new THREE.MeshStandardMaterial({
      color: propsRef.current.backgroundHex,
      roughness: 0.85,
      metalness: 0.02,
    });
    const frontFaceMat = new THREE.MeshStandardMaterial({
      map: faceTexture,
      roughness: 0.72,
      metalness: 0.04,
    });
    const mainCardMesh = new THREE.Mesh(mainCardGeo, [
      paperEdgeMat,
      paperEdgeMat,
      paperEdgeMat,
      paperEdgeMat,
      frontFaceMat,
      paperEdgeMat,
    ]);
    mainCardMesh.position.set(0.05, 0.04, 0.14);
    mainCardMesh.castShadow = true;
    mainCardMesh.receiveShadow = true;
    dioramaGroup.add(mainCardMesh);

    // Layer 3: Sculpted 3D Ornament Assembly (4-part composite group)
    const ornamentGroup = new THREE.Group();
    ornamentGroup.position.set(1.02, -1.12, 0.42);
    dioramaGroup.add(ornamentGroup);

    const waxMat = new THREE.MeshPhysicalMaterial({
      color: propsRef.current.accentHex,
      roughness: 0.28,
      metalness: 0.42,
      clearcoat: 0.65,
      clearcoatRoughness: 0.18,
    });
    const goldMetalMat = new THREE.MeshPhysicalMaterial({
      color: propsRef.current.highlightHex,
      roughness: 0.18,
      metalness: 0.94,
      clearcoat: 0.8,
    });

    const sealBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.46, 0.12, 28),
      waxMat
    );
    sealBase.rotation.x = Math.PI / 2;
    sealBase.castShadow = true;
    ornamentGroup.add(sealBase);

    const sealRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.045, 16, 36),
      goldMetalMat
    );
    sealRing.position.z = 0.05;
    ornamentGroup.add(sealRing);

    const ornamentInner = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18, 0),
      goldMetalMat
    );
    ornamentInner.position.z = 0.09;
    ornamentGroup.add(ornamentInner);

    // Arch / Ribbon Halo framing top-left
    const archHaloGroup = new THREE.Group();
    archHaloGroup.position.set(-1.12, 0.98, 0.34);
    dioramaGroup.add(archHaloGroup);

    const archArc = new THREE.Mesh(
      new THREE.TorusGeometry(0.46, 0.032, 14, 42, Math.PI * 1.15),
      goldMetalMat
    );
    archArc.rotation.z = Math.PI * 0.45;
    archHaloGroup.add(archArc);

    const petalLeafMat = new THREE.MeshStandardMaterial({
      color: propsRef.current.accentHex,
      roughness: 0.52,
      metalness: 0.18,
    });
    for (let i = 0; i < 3; i += 1) {
      const leaf = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.3, 6),
        petalLeafMat
      );
      leaf.position.set(-0.24 + i * 0.18, 0.22 - i * 0.11, 0.04);
      leaf.rotation.z = -0.7 + i * 0.35;
      archHaloGroup.add(leaf);
    }

    // Layer 4: Instanced Floating Ambient Particles (36 motes)
    const particleCount = 36;
    const particleGeo = new THREE.OctahedronGeometry(0.045, 0);
    const particleMat = new THREE.MeshStandardMaterial({
      color: propsRef.current.highlightHex,
      roughness: 0.28,
      metalness: 0.78,
    });
    const instancedParticles = new THREE.InstancedMesh(
      particleGeo,
      particleMat,
      particleCount
    );
    const particleSeeds = Array.from({ length: particleCount }, (_, i) => ({
      x: ((i * 73) % 100) / 100 * 5.2 - 2.6,
      y: ((i * 41) % 100) / 100 * 4.4 - 2.2,
      z: ((i * 29) % 100) / 100 * 2.2 - 1.1,
      speed: 0.4 + ((i * 19) % 10) * 0.08,
      phase: i * 0.7,
      scale: 0.65 + ((i * 13) % 10) * 0.07,
    }));
    particleSeeds.forEach((seed, idx) => {
      _dummyObj.position.set(seed.x, seed.y, seed.z);
      _dummyObj.scale.setScalar(seed.scale);
      _dummyObj.updateMatrix();
      instancedParticles.setMatrixAt(idx, _dummyObj.matrix);
    });
    instancedParticles.instanceMatrix.needsUpdate = true;
    instancedParticles.computeBoundingSphere();
    instancedParticles.frustumCulled = false;
    scene.add(instancedParticles);

    // Contact shadow plane
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(6.5, 6.5),
      new THREE.ShadowMaterial({ opacity: 0.14 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.15;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Dynamic theme update handler
    rebuildMaterialsRef.current = () => {
      const p = propsRef.current;
      backCardMat.color.set(p.softHex);
      frameRimMat.color.set(p.highlightHex);
      paperEdgeMat.color.set(p.backgroundHex);
      waxMat.color.set(p.accentHex);
      goldMetalMat.color.set(p.highlightHex);
      petalLeafMat.color.set(p.accentHex);
      particleMat.color.set(
        p.particles === "botanical-petals" ? p.accentHex : p.highlightHex
      );
      instancedParticles.visible = p.particles !== "none";

      // Ornament style tweaks
      ornamentInner.visible = p.ornament3D !== "ribbon-halo";
      archHaloGroup.visible =
        p.ornament3D === "floral-arch" || p.ornament3D === "ribbon-halo";
      sealRing.scale.setScalar(p.ornament3D === "origami-crest" ? 0.75 : 1);

      const nextTex = createCardFaceTexture(
        p.backgroundHex,
        p.deepHex,
        p.highlightHex,
        p.coupleNames,
        p.eventDate,
        p.monogramText
      );
      nextTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      frontFaceMat.map = nextTex;
      frontFaceMat.needsUpdate = true;
      faceTexture.dispose();
      faceTexture = nextTex;
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Event listeners
    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
      const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
      pointerTargetRef.current.x = nx;
      pointerTargetRef.current.y = ny;
    };
    const onPointerLeave = () => {
      pointerTargetRef.current.x = 0;
      pointerTargetRef.current.y = 0;
    };
    const onCanvasClick = () => {
      spinBurstRef.current = 0.55;
      onCardClickRef.current?.();
    };
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFallback(true);
    };
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || 480;
      const h = mount.clientHeight || height;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("click", onCanvasClick);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    window.addEventListener("resize", onResize);

    // Animation loop with Software WebGL afterDraw pacing
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== "function") {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const status = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(0.05, clock.getDelta());
      const elapsed = clock.getElapsedTime();
      const explodeVal = propsRef.current.explode || 0;

      // Damped pointer parallax
      const targetRotY =
        pointerTargetRef.current.x * 0.55 +
        (prefersReduced ? 0 : Math.sin(elapsed * 0.65) * 0.08) +
        spinBurstRef.current;
      const targetRotX =
        -pointerTargetRef.current.y * 0.42 +
        (prefersReduced ? 0 : Math.cos(elapsed * 0.5) * 0.04);

      dioramaGroup.rotation.y = THREE.MathUtils.damp(
        dioramaGroup.rotation.y,
        targetRotY,
        6,
        delta
      );
      dioramaGroup.rotation.x = THREE.MathUtils.damp(
        dioramaGroup.rotation.x,
        targetRotX,
        6,
        delta
      );
      spinBurstRef.current = THREE.MathUtils.damp(spinBurstRef.current, 0, 5, delta);

      // Exploded layer separation on Z and X
      backCardMesh.position.z = THREE.MathUtils.damp(
        backCardMesh.position.z,
        -0.28 - explodeVal * 0.72,
        7,
        delta
      );
      backCardMesh.position.x = THREE.MathUtils.damp(
        backCardMesh.position.x,
        -0.22 - explodeVal * 0.35,
        7,
        delta
      );
      frameRimMesh.position.z = THREE.MathUtils.damp(
        frameRimMesh.position.z,
        -0.06 - explodeVal * 0.22,
        7,
        delta
      );
      mainCardMesh.position.z = THREE.MathUtils.damp(
        mainCardMesh.position.z,
        0.14 + explodeVal * 0.25,
        7,
        delta
      );
      ornamentGroup.position.z = THREE.MathUtils.damp(
        ornamentGroup.position.z,
        0.42 + explodeVal * 0.78,
        7,
        delta
      );
      archHaloGroup.position.z = THREE.MathUtils.damp(
        archHaloGroup.position.z,
        0.34 + explodeVal * 0.62,
        7,
        delta
      );

      // Subtle breathing on 3D ornament
      if (!prefersReduced) {
        ornamentInner.rotation.z = elapsed * 0.55;
        ornamentGroup.position.y = -1.12 + Math.sin(elapsed * 1.3) * 0.04;
        archHaloGroup.position.y = 0.98 + Math.cos(elapsed * 1.1) * 0.035;

        if (instancedParticles.visible) {
          for (let i = 0; i < particleCount; i += 1) {
            const s = particleSeeds[i];
            _dummyObj.position.set(
              s.x + Math.sin(elapsed * s.speed + s.phase) * 0.16,
              s.y + Math.cos(elapsed * s.speed * 0.8 + s.phase) * 0.2,
              s.z
            );
            _dummyObj.rotation.set(elapsed * s.speed, elapsed * 0.4, s.phase);
            _dummyObj.scale.setScalar(s.scale);
            _dummyObj.updateMatrix();
            instancedParticles.setMatrixAt(i, _dummyObj.matrix);
          }
          instancedParticles.instanceMatrix.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("click", onCanvasClick);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      window.removeEventListener("resize", onResize);

      backCardGeo.dispose();
      backCardMat.dispose();
      frameRimGeo.dispose();
      frameRimMat.dispose();
      mainCardGeo.dispose();
      paperEdgeMat.dispose();
      frontFaceMat.dispose();
      faceTexture.dispose();
      sealBase.geometry.dispose();
      sealRing.geometry.dispose();
      ornamentInner.geometry.dispose();
      archArc.geometry.dispose();
      waxMat.dispose();
      goldMetalMat.dispose();
      petalLeafMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      shadowPlane.geometry.dispose();
      (shadowPlane.material as THREE.Material).dispose();
      envTex.dispose();
      renderer.dispose();
    };
  }, [height]);

  if (webglFallback) {
    return (
      <div
        className="webgl-fallback-card"
        style={{
          height: `${height}px`,
          background: `linear-gradient(145deg, ${backgroundHex}, ${softHex})`,
          color: deepHex,
          borderColor: highlightHex,
        }}
        onClick={onCardClick}
      >
        <div className="webgl-fallback-crest" style={{ borderColor: highlightHex }}>
          <span>{monogramText}</span>
        </div>
        <h3>{coupleNames}</h3>
        <p>{eventDate}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="webgl-canvas-mount"
      style={{ height: `${height}px` }}
      aria-label={`Panggung 3D interaktif undangan ${coupleNames}`}
    />
  );
}
