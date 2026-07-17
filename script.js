import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/FilmPass.js';
import gsap from 'https://cdn.skypack.dev/gsap@3.9.1';

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
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.domElement.style.display = 'block';
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // --- Post Processing Stack (The "Cyber Look") ---
        this.composer = new EffectComposer(this.renderer);
        // Base Render
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        // Bloom (Intense Neon Glow)
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.8, 0.4, 0.85);
        this.composer.addPass(this.bloomPass);

        // Film Grain/Scanlines (Cinematic texture)
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

        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
    },
    onWindowResize: function() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        if (this.composer && this.composer.setSize) this.composer.setSize(width, height);
        if (this.bloomPass && this.bloomPass.setSize) this.bloomPass.setSize(width, height);
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
            const statusEl = document.getElementById('robot-status');
            if (statusEl) statusEl.innerText = "SYSTEM // ONLINE";

        }, undefined, (err) => console.error("Robot load failed:", err));
    },
    animate: function() {
        requestAnimationFrame(() => this.animate());
        // Idle animation
        if (this.robot) this.robot.rotation.y += 0.002;
        // Render via composer (postprocessing)
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
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

        // Make sure bubble displays if robot loaded
        const bubble = document.getElementById('robot-bubble');
        if (bubble) bubble.style.display = State.isRobotLoaded ? 'block' : 'none';
    },
    onSend: function() {
        const inputEl = document.getElementById('chat-input');
        const input = inputEl ? inputEl.value : '';
        if(!input) return;
        const bubble = document.getElementById('robot-bubble');
        const btn = document.getElementById('send-btn');

        if (bubble) {
            bubble.innerText = "ANALYZING...";
            bubble.style.display = 'block';
        }
        
        // Button click animation
        if (btn) gsap.to(btn, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
        if (bubble) gsap.to(bubble, { opacity: 1, scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 });
    },
    onReceive: function(text) {
        const bubble = document.getElementById('robot-bubble');
        if (!bubble) return;
        // Typewriter effect simulation (simple)
        const originalText = text;
        bubble.innerHTML = "";
        let charIndex = 0;
        const typeInterval = setInterval(() => {
            if (charIndex < originalText.length) {
                bubble.innerHTML += originalText.charAt(charIndex);
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
const sendBtn = document.getElementById('send-btn');
if (sendBtn) {
    sendBtn.addEventListener('click', async () => {
        if(State.isProcessing) return;
        UI.onSend();
        const inputVal = document.getElementById('chat-input') ? document.getElementById('chat-input').value : '';
        const response = await AI.sendMessage(inputVal);
        UI.onReceive(response);
        State.isProcessing = false;
    });
}
