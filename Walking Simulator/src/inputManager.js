import * as THREE from "three";

export class InputManager 
{
    constructor(game, soundManager) 
    {
        this.game = game;
        this.soundManager = soundManager;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.bindEvents();
    }

    bindEvents() 
    {
        document.addEventListener("keydown", (e) => this.onKeyDown(e));
        document.addEventListener("keyup", (e) => this.onKeyUp(e));
    }

    onKeyDown(event) 
    {
        if (!this.game.gameStarted || this.game.isGameOver)
        {
            return;
        }
        switch (event.code) 
        {
            case "KeyW":
            {
                this.moveForward = true;
                break;
            }
            case "KeyS":
            {
                this.moveBackward = true;
                break;
            }
            case "KeyA":
            {
                this.moveLeft = true;
                break;
            }
            case "KeyD":
            {
                this.moveRight = true;
                break;
            }
            case "KeyE":
            {
                this.game.levelUpPlayer();
                break;
            }
            case "KeyQ":
            {
                this.game.basePlayerSpeed += 1;
                this.game.updatePlayerSpeed();
                break;
            }
        }
        this.soundManager.playFootstep();
    }

    onKeyUp(event) 
    {
        if (!this.game.gameStarted || this.game.isGameOver)
        {
            return;
        }
        switch (event.code) 
        {
            case "KeyW":
            {
                this.moveForward = false;
                break;
            }
            case "KeyS":
            {
                this.moveBackward = false;
                break;
            }
            case "KeyA":
            {
                this.moveLeft = false;
                break;
            }
            case "KeyD":
            {
                this.moveRight = false;
                break;
            }
        }
        if (!this.moveForward && !this.moveBackward && !this.moveLeft && !this.moveRight)
        {
            this.soundManager.stopFootstep();
        }
    }

    getMovementVector(camera, deltaTime, playerSpeed) 
    {
        let moveVector = new THREE.Vector3();
        if (this.moveForward)
        {
            moveVector.z -= 1;
        }
        if (this.moveBackward)
        {
            moveVector.z += 1;
        }
        if (this.moveRight)
        {
            moveVector.x += 1;
        }
        if (this.moveLeft)
        {
            moveVector.x -= 1;
        }
        moveVector.normalize();
        moveVector.applyQuaternion(camera.quaternion);
        moveVector.y = 0;
        return moveVector.multiplyScalar(playerSpeed * deltaTime * 5);
    }

    // Reset movement state and stop footstep sound to prevent it from playing automatically when the game restarts
    resetMovementState() 
    {
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.soundManager.stopFootstep();
    }
}
