import * as THREE from "https://unpkg.com/three@0.150.0/build/three.module.js";

const TREE_CONFIG = 
{
    trunkRadius: 0.2,
    trunkHeight: 2,
    leavesRadius: 0.8,
    segments: 16,
    trunkColor: 0x8b4513,
    leavesColor: 0x00aa00,
    genCount: 100,
    genRadius: 150,
    removalDistance: 300,
    maxTrees: 500
};

const PICKUP_CONFIG = 
{
    radius: 0.5,
    segments: 16,
    genCount: 10,
    genRadius: 100,
    removalDistance: 400,
    lifetime: 5000,
    bobbingSpeed: 5,
    bobbingAmplitude: 0.2
};

export class World 
{
    constructor(scene, player, ui) 
    {
        this.scene = scene;
        this.player = player;
        this.ui = ui;
        this.trees = [];
        this.pickups = [];
        this.pickupLevel = 1;
        // Object pools for recycling trees and pickups
        this.treePool = [];
        this.pickupPool = [];
    }

    // Cache reusable geometries and materials for trees
    static trunkGeometry = new THREE.CylinderGeometry(
        TREE_CONFIG.trunkRadius,
        TREE_CONFIG.trunkRadius,
        TREE_CONFIG.trunkHeight
    );
    static trunkMaterial = new THREE.MeshBasicMaterial({ color: TREE_CONFIG.trunkColor });
    static leavesGeometry = new THREE.SphereGeometry(
        TREE_CONFIG.leavesRadius,
        TREE_CONFIG.segments,
        TREE_CONFIG.segments
    );
    static leavesMaterial = new THREE.MeshBasicMaterial({ color: TREE_CONFIG.leavesColor });
    
    // Cache reusable geometry for pickups
    static pickupGeometry = new THREE.SphereGeometry(
        PICKUP_CONFIG.radius,
        PICKUP_CONFIG.segments,
        PICKUP_CONFIG.segments
    );
    
    // Cache for pickup materials based on color
    static pickupMaterials = {};

    getPickupMaterial(color) 
    {
        if (!World.pickupMaterials[color])
        {
            World.pickupMaterials[color] = new THREE.MeshBasicMaterial({ color: color });
        }
        return World.pickupMaterials[color];
    }

    generateTree(x, z) 
    {
        let tree;
        if (this.treePool.length > 0)
        {
            tree = this.treePool.pop();
            tree.trunk.visible = true;
            tree.leaves.visible = true;
        }
        else
        {
            const trunk = new THREE.Mesh(World.trunkGeometry, World.trunkMaterial);
            const leaves = new THREE.Mesh(World.leavesGeometry, World.leavesMaterial);
            tree = { trunk: trunk, leaves: leaves };
        }
        // Position the trunk and leaves
        tree.trunk.position.set(x, TREE_CONFIG.trunkHeight / 2, z);
        tree.leaves.position.set(x, TREE_CONFIG.trunkHeight + TREE_CONFIG.leavesRadius, z);

        this.scene.add(tree.trunk);
        this.scene.add(tree.leaves);
        this.trees.push(tree);
    }

    updateTrees() 
    {
        const playerPos = this.player.position;
        // Generate trees around the player
        for (let i = 0; i < TREE_CONFIG.genCount; i++) 
        {
            const x = playerPos.x + (Math.random() - 0.5) * TREE_CONFIG.genRadius;
            const z = playerPos.z + (Math.random() - 0.5) * TREE_CONFIG.genRadius;
            this.generateTree(x, z);
        }
        // Remove trees that are too far away and pool them
        this.trees = this.trees.filter((tree) => 
        {
            const distance = tree.trunk.position.distanceTo(playerPos);
            if (distance > TREE_CONFIG.removalDistance) 
            {
                this.scene.remove(tree.trunk);
                this.scene.remove(tree.leaves);
                tree.trunk.visible = false;
                tree.leaves.visible = false;
                this.treePool.push(tree);
                return false;
            }
            return true;
        });
        // Ensure total number of trees does not exceed maxTrees
        while (this.trees.length > TREE_CONFIG.maxTrees) 
        {
            const tree = this.trees.shift();
            this.scene.remove(tree.trunk);
            this.scene.remove(tree.leaves);
            tree.trunk.visible = false;
            tree.leaves.visible = false;
            this.treePool.push(tree);
        }
        this.ui.updateTreeCount(this.trees.length);
    }

    getPickupColor(level) 
    {
        const colorMap = 
        {
            1: 0xffff00,
            2: 0xffa500,
            3: 0xff4500,
            4: 0xff0000,
            5: 0x8b0000
        };
        return colorMap[level] || 0xffff00;
    }

    generatePickup(x, z) 
    {
        let pickup;
        if (this.pickupPool.length > 0)
        {
            pickup = this.pickupPool.pop();
            pickup.visible = true;
        }
        else
        {
            const material = this.getPickupMaterial(this.getPickupColor(this.pickupLevel));
            pickup = new THREE.Mesh(World.pickupGeometry, material);
        }
        pickup.position.set(x, 1, z);
        pickup.userData.spawnTime = performance.now();
        pickup.userData.initialY = pickup.position.y;
        this.scene.add(pickup);
        this.pickups.push(pickup);
    }

    updatePickups() 
    {
        const playerPos = this.player.position;
        const now = performance.now();
        // Generate pickups around the player
        for (let i = 0; i < PICKUP_CONFIG.genCount; i++) 
        {
            const x = playerPos.x + (Math.random() - 0.5) * PICKUP_CONFIG.genRadius;
            const z = playerPos.z + (Math.random() - 0.5) * PICKUP_CONFIG.genRadius;
            this.generatePickup(x, z);
        }
        // Remove pickups that are too far or too old, and pool them
        this.pickups = this.pickups.filter((pickup) => 
        {
            const distance = pickup.position.distanceTo(playerPos);
            if (distance > PICKUP_CONFIG.removalDistance || now - pickup.userData.spawnTime > PICKUP_CONFIG.lifetime) 
            {
                this.scene.remove(pickup);
                pickup.visible = false;
                this.pickupPool.push(pickup);
                return false;
            }
            return true;
        });
    }

    updatePickupBobbing() 
    {
        const now = performance.now();
        this.pickups.forEach((pickup) => 
        {
            const elapsed = (now - pickup.userData.spawnTime) / 1000;
            pickup.position.y = pickup.userData.initialY + Math.sin(elapsed * PICKUP_CONFIG.bobbingSpeed) * PICKUP_CONFIG.bobbingAmplitude;
        });
    }

    incrementPickupLevel(timer) 
    {
        if (timer >= this.pickupLevel * 60) 
        {
            this.pickupLevel++;
        }
    }

    clearEntities() 
    {
        this.trees.forEach((tree) =>
        {
            this.scene.remove(tree.trunk);
            this.scene.remove(tree.leaves);
        });
        this.trees = [];

        this.pickups.forEach((pickup) =>
        {
            this.scene.remove(pickup);
        });
        this.pickups = [];
    }
}
