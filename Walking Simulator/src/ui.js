export class UI 
{
    constructor() 
    {
        this.timerEl = document.getElementById("timer");
        this.titleScreen = document.getElementById("titleScreen");
        this.playButton = document.getElementById("playButton");
        this.resetLeaderboardButton = document.getElementById("resetLeaderboardButton");
        this.resetLeaderboardButtonGameOver = document.getElementById("resetLeaderboardButtonGameOver");
        this.gameOverScreen = document.getElementById("gameOverScreen");
        this.finalTimeEl = document.getElementById("finalTime");
        this.restartButton = document.getElementById("restartButton");
        this.playerNameInput = document.getElementById("playerNameInput");
        this.playerNameInputGameOver = document.getElementById("playerNameInputGameOver");
        this.leaderboardEl = document.getElementById("leaderboard");
        this.leaderboardGameOverEl = document.getElementById("leaderboardGameOver");
        this.heartContainer = document.getElementById("heartContainer");

        // Create HUD table
        this.hudTable = document.createElement("div");
        this.hudTable.id = "hudTable";
        this.hudTable.innerHTML = `
            <table>
                <tr><th>Player Speed</th><td id="playerSpeedEl"></td></tr>
                <tr><th>Enemy Speed</th><td id="enemySpeedEl"></td></tr>
                <tr><th>Trees</th><td id="treeCountEl"></td></tr>
                <tr><th>Player Level</th><td id="playerLevelEl"></td></tr>
                <tr><th>Pickup Level</th><td id="pickupLevelEl"></td></tr>
                <tr><th>Distance to Enemy</th><td id="distanceEl"></td></tr>
            </table>
        `;
        document.body.appendChild(this.hudTable);

        // Cache HUD elements for later updates
        this.playerSpeedEl = this.hudTable.querySelector("#playerSpeedEl");
        this.enemySpeedEl = this.hudTable.querySelector("#enemySpeedEl");
        this.treeCountEl = this.hudTable.querySelector("#treeCountEl");
        this.playerLevelEl = this.hudTable.querySelector("#playerLevelEl");
        this.pickupLevelEl = this.hudTable.querySelector("#pickupLevelEl");
        this.distanceEl = this.hudTable.querySelector("#distanceEl");
    }

    updatePlayerSpeed(speed) 
    {
        this.playerSpeedEl.textContent = speed.toFixed(2);
    }

    updateEnemySpeed(speed) 
    {
        this.enemySpeedEl.textContent = speed.toFixed(2);
    }

    updateTreeCount(count) 
    {
        this.treeCountEl.textContent = count;
    }

    updateDistance(distance) 
    {
        this.distanceEl.textContent = distance.toFixed(2) + " meters";
    }

    updatePlayerLevel(level) 
    {
        this.playerLevelEl.textContent = level;
    }

    updatePickupLevel(level) 
    {
        this.pickupLevelEl.textContent = level;
    }

    showGameOver(finalTimeText) 
    {
        this.gameOverScreen.style.display = "flex";
        this.hudTable.style.display = "none";
        this.finalTimeEl.textContent = finalTimeText;
    }

    hideGameOver() 
    {
        this.gameOverScreen.style.display = "none";
    }

    hideTitle() 
    {
        this.titleScreen.style.display = "none";
    }

    showHUD() 
    {
        this.hudTable.style.display = "block";
    }
}
