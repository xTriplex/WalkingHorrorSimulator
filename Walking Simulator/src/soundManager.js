export class SoundManager
 {
    constructor()
     {
        this.levelUpSound = new Audio('Audio/levelup.mp3');
        this.pickupSound = new Audio('Audio/coin.mp3');
        this.heartbeatSound = new Audio('Audio/heartbeat.mp3');
        this.heartbeatSound.loop = true;
        this.screamSound = new Audio('Audio/scream.mp3');
        this.footstepSound = new Audio('Audio/footstep.mp3');
        this.footstepSound.loop = true;
        this.hoverSound = new Audio('Audio/buttonhover.mp3'); 
        this.clickSound = new Audio('Audio/buttonclick.mp3'); 
    }

    _playSoundIfPaused(sound)
    {
        if (sound.paused)
        {
            sound.play();
        }
    }

    playLevelUp()
    {
        this.levelUpSound.play();
    }

    playPickup() 
    {
        this.pickupSound.play();
    }

    playHeartbeat() 
    {
        this._playSoundIfPaused(this.heartbeatSound);
    }

    stopHeartbeat() 
    {
        this.heartbeatSound.pause();
    }

    playScream() 
    {
        this.screamSound.play();
    }

    playFootstep() 
    {
        this._playSoundIfPaused(this.footstepSound);
    }

    stopFootstep() 
    {
        this.footstepSound.pause();
    }

    playHover() 
    {
        this.hoverSound.play();
    }

    playClick() 
    {
        this.clickSound.play();
    }
}
