import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/ShaderPass.js';
import { FilmPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/FilmPass.js';

// 1. Core State
const State = { isRobotLoaded: false, isProcessing: false };

// 2. Cinematic Engine
const Engine = {
    init: function() {
        this.scene = new THREE.Scene();
        // Slight fog for depth
        this.scene.fog = new THREE.FogExp2(0x000000, 0.05);
        
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 50);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // --- Post Processing Stack (The "Cyber Look") ---
        this.composer = new EffectComposer(this.renderer);
        
        // 1. Base Render
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        // 2. Bloom (Intense Neon Glow)
        this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.8, 0.4, 0.85));

        // 3. Film Grain/Scanlines (Cinematic texture)
        const filmPass = new FilmPass(0.35, 0.025, 648, false);
        this.composer.addPass(filmPass);

        // Lighting
        const ambient = new THREE.AmbientLight(0x222222);
        const mainLight = new THREE.DirectionalLight(0x00ff41, 2);
        mainLight.position.set(5, 10, 7);
        this.scene.add(ambient, mainLight);

        this.camera.position.set(0, 1.2, 3.5);

        // Mouse Listener for subtle camera sway
        window.addEventListener('mousemove', (e) => {
            if(this.robot) {
                const mouseX = (e.clientX / window.innerWidth) - 0.5;
                const mouseY = (e.clientY / window.innerHeight) - 0.5;
                gsap.to(this.robot.rotation, { y: mouseX * 0.5, x: -mouseY * 0.3, duration: 1 });
            }
        });
    },
    loadRobot: function(path) {
        const loader = new GLTFLoader();
        loader.load(path, (gltf) => {
            this.robot = gltf.scene;
            // Scale model down if it's too big
            this.robot.scale.set(1, 1, 1);
            this.robot.position.set(0, 0, 0);
            this.scene.add(this.robot);
            
            // Entrance Animation (GSAP)
            gsap.from(this.robot.position, { y: -2, duration: 1.5, ease: "power3.out" });
            gsap.from(this.robot.rotation, { y: Math.PI * 2, duration: 2, ease: "elastic.out(1, 0.5)" });

            State.isRobotLoaded = true;
            document.getElementById('robot-status').innerText = "SYSTEM // ONLINE";

        }, undefined, (err) => console.error("Robot load failed:", err));
    },
    animate: function() {
        requestAnimationFrame(() => this.animate());
        this.composer.render(); // Render with effects
    }
};

// 3. AI Bridge
const AI = {
    sendMessage: async function(text) {
        State.isProcessing = true;
        // Simulate API latency
        return new Promise(resolve => setTimeout(() => resolve("TRACE_COMPLETE: Network anomaly isolated. Decrypting response... [SUB_ROUTINE_04B]"), 2500));
    }
};

// 4. UI/UX Reactive Animations (GSAP)
const UI = {
    init: function() {
        // Animate cards in on load
        gsap.from(".card", { opacity: 0, y: 30, duration: 0.8, stagger: 0.2, ease: "power2.out" });
        gsap.from(".bubble", { opacity: 0, x: -30, duration: 1, delay: 1.5, ease: "back.out(1.7)" });
    },
    onSend: function() {
        const input = document.getElementById('chat-input').value;
        if(!input) return;
        const bubble = document.getElementById('robot-bubble');
        const btn = document.getElementById('send-btn');

        bubble.innerText = "ANALYZING...";
        bubble.style.display = 'block';
        
        // Button click animation
        gsap.to(btn, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
        gsap.to(bubble, { opacity: 1, scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 });
    },
    onReceive: function(text) {
        const bubble = document.getElementById('robot-bubble');
        bubble.innerText = text;
        
        // Typewriter effect simulation (simple)
        const textElement = bubble;
        const originalText = text;
        textElement.innerHTML = "";
        let charIndex = 0;
        const typeInterval = setInterval(() => {
            if (charIndex < originalText.length) {
                textElement.innerHTML += originalText.charAt(charIndex);
                charIndex++;
            } else {
                clearInterval(typeInterval);
            }
        }, 20); // 20ms per character
    }
};

// Launch
Engine.init();
Engine.loadRobot('scene.gltf');
Engine.animate();
UI.init();

// Hook Interaction to UI animations
document.getElementById('send-btn').addEventListener('click', async () => {
    if(State.isProcessing) return;
    UI.onSend();
    const response = await AI.sendMessage(document.getElementById('chat-input').value);
    UI.onReceive(response);
    State.isProcessing = false;
});
    
