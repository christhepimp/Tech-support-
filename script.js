// 1. Core State Management
const State = {
    isRobotLoaded: false,
    isProcessing: false,
};

// 2. Engine: 3D Scene Controller
const Engine = {
    init: function() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        this.camera.position.z = 5;
    },
    loadRobot: function(path) {
        const loader = new THREE.GLTFLoader();
        loader.load(path, (gltf) => {
            this.robot = gltf.scene;
            this.scene.add(this.robot);
            State.isRobotLoaded = true;
            console.log("Robot synchronized.");
        });
    },
    render: function() {
        requestAnimationFrame(() => this.render());
        this.renderer.render(this.scene, this.camera);
    }
};

// 3. AI Orchestrator: Bridge to Character AI
const AI = {
    // We will hook your session token here in the next step
    token: "03d7d0be84789c6fe4e3cff1c45ab42db1092263",
    
    sendMessage: async function(text) {
        if(State.isProcessing) return;
        State.isProcessing = true;
        
        // This is where the bridge logic goes
        // We'll call your specific API wrapper URL here
        console.log("AI Orchestrator active, sending:", text);
        
        // Simulating response for now
        return new Promise(resolve => setTimeout(() => resolve("Command received, tech optimized."), 1500));
    }
};

// 4. UI/UX Bridge
document.getElementById('send-btn').addEventListener('click', async () => {
    const input = document.getElementById('chat-input').value;
    const bubble = document.getElementById('robot-bubble');
    
    bubble.style.display = 'block';
    bubble.innerText = "Processing...";
    
    const response = await AI.sendMessage(input);
    bubble.innerText = response;
    State.isProcessing = false;
});

// Initialize everything
Engine.init();
Engine.loadRobot('robot.glb');
Engine.render();
