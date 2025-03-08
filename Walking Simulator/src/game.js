import * as THREE from "three";
import { PointerLockControls } from "https://unpkg.com/three@0.150.0/examples/jsm/controls/PointerLockControls.js";
import { UI } from "./ui.js";
import { SoundManager } from "./soundManager.js";
import { Leaderboard } from "./leaderboard.js";
import { World } from "./world.js";
import { InputManager } from "./inputManager.js";

// Configuration constants
const CAMERA_CONFIG = 
{
    fov: 75,
    near: 0.1,
    far: 2000,
    initialPosition: new THREE.Vector3(0, 1.5, 10)
};

const FLOOR_CONFIG = 
{
    width: 2000,
    height: 2000,
    color: 0x00ff00
};

const ENEMY_CONFIG = 
{
    radius: 0.5,
    segments: 16,
    color: 0xff0000,
    initialPosition: new THREE.Vector3(5, 1.5, 5),
    resetPosition: new THREE.Vector3(10, 1.5, 10),
    speedMultiplier: 5,
    speedIncrement: 0.01
};

export class Game 
{
    constructor() 
    {
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initControls();
        this.initClock();
        this.initGameState();
        this.initEnemy();
        this.initUIEvents();
        this.initWorld();
        this.initInputManager();
        this.initFloor();
        this.initHUDIntervals();
        this.initWorldIntervals();
        this.initEventListeners();
        this.leaderboard.load();
        this.animate();
    }

    initScene() 
    {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
    }

    initCamera() 
    {
        this.camera = new THREE.PerspectiveCamera(
            CAMERA_CONFIG.fov,
            window.innerWidth / window.innerHeight,
            CAMERA_CONFIG.near,
            CAMERA_CONFIG.far
        );
        this.camera.position.copy(CAMERA_CONFIG.initialPosition);
    }

    initRenderer() 
    {
        const canvas = document.getElementById("canvas");
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    initControls() 
    {
        this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
        this.scene.add(this.controls.getObject());
        // Bind pointer lock events
        this.controls.addEventListener("lock", () =>
        {
            this.gameStarted = true;
        });
        this.controls.addEventListener("unlock", () =>
        {
            this.gameStarted = false;
        });
    }

    initClock() 
    {
        this.clock = new THREE.Clock();
    }

    initGameState() 
    {
        this.timer = 0;
        this.deltaTime = 0;
        this.isGameOver = false;
        this.gameStarted = false;
        this.basePlayerSpeed = 1;
        this.playerSpeed = this.basePlayerSpeed;
        this.baseEnemySpeed = 0.8;
        this.enemySpeed = this.baseEnemySpeed;
        this.playerLevel = 1;
        this.timeSinceLastLevelUp = 0;
        this.speedBoostActive = false;
        this.speedBoostTimer = 0;
        this.playerName = "";
        this._tempVec = new THREE.Vector3();
    }

    initEnemy() 
    {
        const enemyGeometry = new THREE.SphereGeometry(
            ENEMY_CONFIG.radius,
            ENEMY_CONFIG.segments,
            ENEMY_CONFIG.segments
        );
        const enemyMaterial = new THREE.MeshBasicMaterial({ color: ENEMY_CONFIG.color });
        this.enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
        this.enemy.position.copy(ENEMY_CONFIG.initialPosition);
        this.scene.add(this.enemy);
    }

    initUIEvents() 
    {
        this.ui = new UI();
        this.soundManager = new SoundManager();
        this.leaderboard = new Leaderboard(this.ui);

        const addHoverAndClickSound = (element, clickHandler) => 
        {
            element.addEventListener("mouseover", () => 
            {
                this.soundManager.playHover();
            });

            element.addEventListener("click", () => 
            {
                this.soundManager.playClick();
                clickHandler();
            });
        };

        addHoverAndClickSound(this.ui.playButton, () => 
        {
            this.playerName = this.ui.playerNameInput.value.trim();
            if (this.playerName) 
            {
                this.controls.lock();
                this.startGame();
            } 
            else 
            {
                alert("Please enter your name");
            }
        });

        addHoverAndClickSound(this.ui.restartButton, () => 
        {
            this.playerName = this.ui.playerNameInputGameOver.value.trim();
            if (this.playerName) 
            {
                this.startGame();
                this.controls.lock();
            } 
            else 
            {
                alert("Please enter your name");
            }
        });

        addHoverAndClickSound(this.ui.resetLeaderboardButton, () => 
        {
            this.leaderboard.reset();
        });

        addHoverAndClickSound(this.ui.resetLeaderboardButtonGameOver, () => 
        {
            this.leaderboard.reset();
        });
    }

    initWorld() 
    {
        this.world = new World(this.scene, this.controls.getObject(), this.ui);
    }

    initInputManager() 
    {
        this.inputManager = new InputManager(this, this.soundManager);
    }

    initFloor() 
    {
        const floorGeometry = new THREE.PlaneGeometry(FLOOR_CONFIG.width, FLOOR_CONFIG.height);
        const floorMaterial = new THREE.MeshBasicMaterial(
        {
            color: FLOOR_CONFIG.color,
            side: THREE.DoubleSide
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        this.scene.add(floor);
    }

    initHUDIntervals() 
    {
        setInterval(() =>
        {
            this.ui.updatePlayerSpeed(this.playerSpeed);
        }, 100);
        setInterval(() =>
        {
            this.ui.updateEnemySpeed(this.enemySpeed);
        }, 1000);
        setInterval(() =>
        {
            this.ui.updatePlayerLevel(this.playerLevel);
        }, 1000);
        setInterval(() =>
        {
            this.ui.updatePickupLevel(this.world.pickupLevel);
        }, 1000);
    }

    initWorldIntervals() 
    {
        setInterval(() =>
        {
            if (this.gameStarted)
            {
                this.world.updateTrees();
            }
        }, 1000);
        setInterval(() =>
        {
            if (this.gameStarted)
            {
                this.world.updatePickups();
            }
        }, 5000);
    }

    initEventListeners() 
    {
        window.addEventListener("resize", () =>
        {
            this.onWindowResize();
        });
    }

    onWindowResize() 
    {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    startGame() 
    {
        this.isGameOver = false;
        this.gameStarted = true;
        this.timer = 0;
        this.playerLevel = 1;
        this.timeSinceLastLevelUp = 0;
        this.clock.start();
        this.basePlayerSpeed = 1;
        this.playerSpeed = this.basePlayerSpeed;
        this.enemySpeed = this.baseEnemySpeed;
        this.world.pickupLevel = 1;
        this.enemy.position.copy(ENEMY_CONFIG.resetPosition);
        this.controls.getObject().position.copy(CAMERA_CONFIG.initialPosition);
        this.ui.hideTitle();
        this.ui.hideGameOver();
        this.ui.showHUD();
        this.inputManager.resetMovementState();
        this.world.clearEntities();
    }

    levelUpPlayer() 
    {
        this.playerLevel++;
        if (!this.speedBoostActive)
        {
            this.playerSpeed = this.basePlayerSpeed + (this.playerLevel - 1) * 0.1;
        }
        else
        {
            const speedMultiplier = 2 + (this.world.pickupLevel - 1) * 0.25; // 2 + 1 - 1 * 0.25 = 0.25 increase per level.
            this.playerSpeed = (this.basePlayerSpeed + (this.playerLevel - 1) * 0.1) * speedMultiplier;
        }
        this.timeSinceLastLevelUp = 0;
        this.soundManager.playLevelUp();
        this.showLevelUpMessage();
    }

    showLevelUpMessage() 
    {
        const message = document.createElement("div");
        message.id = "levelUpMessage";
        message.textContent = `You are now level ${this.playerLevel}`;
        Object.assign(message.style,
        {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "yellow",
            fontSize: "2em",
            zIndex: "1000",
            padding: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
            transition: "opacity 0.5s ease-in-out",
            opacity: "0"
        });
        document.body.appendChild(message);
        setTimeout(() =>
        {
            message.style.opacity = "1";
        }, 100);
        setTimeout(() =>
        {
            message.style.opacity = "0";
            setTimeout(() =>
            {
                document.body.removeChild(message);
            }, 500);
        }, 2000);
    }

    updatePlayerSpeed() 
    {
        if (!this.speedBoostActive)
        {
            this.playerSpeed = this.basePlayerSpeed + (this.playerLevel - 1) * 0.1;
        }
    }

    activateSpeedBoost() 
    {
        this.speedBoostActive = true;
        this.speedBoostTimer = 5;
        this.soundManager.playPickup();
    }

    deactivateSpeedBoost() 
    {
        this.speedBoostActive = false;
        this.playerSpeed = this.basePlayerSpeed + (this.playerLevel - 1) * 0.1;
    }

    gameOver() 
    {
        this.isGameOver = true;
        this.gameStarted = false;
        this.clock.stop();
        this.ui.showGameOver(`You survived: ${this.timer.toFixed(2)} seconds`);
        this.controls.unlock();
        this.leaderboard.update(this.playerName, this.timer);
        this.soundManager.stopHeartbeat();
        this.ui.heartContainer.style.display = "none";
        this.soundManager.playScream();
        this.soundManager.stopFootstep();
    }

    update() 
    {
        if (!this.gameStarted || this.isGameOver)
        {
            return;
        }

        this.deltaTime = this.clock.getDelta();
        this.timer += this.deltaTime;
        this.timeSinceLastLevelUp += this.deltaTime;
        this.ui.timerEl.textContent = this.timer.toFixed(2);

        if (this.timeSinceLastLevelUp >= 30)
        {
            this.levelUpPlayer();
        }

        this.world.incrementPickupLevel(this.timer);

        if (this.speedBoostActive)
        {
            this.speedBoostTimer -= this.deltaTime;
            if (this.speedBoostTimer <= 0)
            {
                this.deactivateSpeedBoost();
            }
            else
            {
                const speedMultiplier = 1 + (1 + (this.world.pickupLevel - 1) * 0.25) * (this.speedBoostTimer / 5);
                this.playerSpeed = (this.basePlayerSpeed + (this.playerLevel - 1) * 0.1) * speedMultiplier;
            }
        }

        // Cache the player object from controls for reuse
        const playerObj = this.controls.getObject();
        playerObj.position.add(
            this.inputManager.getMovementVector(this.camera, this.deltaTime, this.playerSpeed)
        );

        // Enemy movement toward player using a reusable temporary vector
        const playerPos = playerObj.position;
        this._tempVec.copy(playerPos).sub(this.enemy.position).normalize();
        this.enemy.position.add(
            this._tempVec.multiplyScalar(this.enemySpeed * this.deltaTime * ENEMY_CONFIG.speedMultiplier)
        );
        this.enemySpeed += ENEMY_CONFIG.speedIncrement * this.deltaTime;

        // Pickup collection
        this.world.pickups = this.world.pickups.filter((pickup) =>
        {
            if (pickup.position.distanceTo(playerPos) < 1)
            {
                this.scene.remove(pickup);
                this.activateSpeedBoost();
                return false;
            }
            return true;
        });

        this.world.updatePickupBobbing();

        // Collision detection and update the HUD with enemy distance
        const distanceToEnemy = this.enemy.position.distanceTo(playerPos);
        this.ui.updateDistance(distanceToEnemy);
        if (distanceToEnemy < 1)
        {
            this.gameOver();
        }

        // Update heartbeat sound and heart animation based on enemy proximity
        if (!this.isGameOver && distanceToEnemy < 40)
        {
            const volume = Math.max(0, Math.min(1, (40 - distanceToEnemy) / 10));
            this.soundManager.heartbeatSound.volume = volume;
            this.soundManager.playHeartbeat();
            this.ui.heartContainer.style.display = "block";
            this.ui.heartContainer.style.animationDuration = `${1 / volume}s`;
        }
        else
        {
            this.soundManager.stopHeartbeat();
            this.ui.heartContainer.style.display = "none";
        }

        if (this.speedBoostActive)
        {
            this.speedBoostTimer -= this.deltaTime;
            if (this.speedBoostTimer <= 0)
            {
                this.deactivateSpeedBoost();
            }
        }
    }

    animate() 
    {
        requestAnimationFrame(() =>
        {
            this.animate();
        });
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}
