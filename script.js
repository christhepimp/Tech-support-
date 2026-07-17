import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/UnrealBloomPass.js';

// 1. Core State
const State = { isRobotLoaded: false, isProcessing: false };

// 2. Advanced Engine
const Engine = {
    init: function() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Bloom Post-Processing
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85));

        const light = new THREE.DirectionalLight(0x00ff41, 2);
        light.position.set(5, 5, 5);
        this.scene.add(light, new THREE.AmbientLight(0x404040));
        this.camera.position.set(0, 1.5, 4);
    },
    loadRobot: function(path) {
        new GLTFLoader().load(path, (gltf) => {
            this.robot = gltf.scene;
            this.scene.add(this.robot);
            State.isRobotLoaded = true;
        }, undefined, (err) => console.error("Robot load failed:", err));
    },
    animate: function() {
        requestAnimationFrame(() => this.animate());
        if(this.robot) this.robot.rotation.y += 0.005;
        this.composer.render();
    }
};

// 3. AI Bridge
const AI = {
    token: "03d7d0be84789c6fe4e3cff1c45ab42db1092263",
    sendMessage: async function(text) {
        State.isProcessing = true;
        return new Promise(resolve => setTimeout(() => resolve("SYSTEM: Command encrypted and optimized."), 1200));
    }
};

// 4. Interaction
document.getElementById('send-btn')?.addEventListener('click', async () => {
    const bubble = document.getElementById('robot-bubble');
    const input = document.getElementById('chat-input').value;
    bubble.innerText = "Processing...";
    bubble.innerText = await AI.sendMessage(input);
    State.isProcessing = false;
});

// Launch
Engine.init();
Engine.loadRobot('scene.gltf');
Engine.animate();
                              
