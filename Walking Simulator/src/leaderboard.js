export class Leaderboard 
{
    constructor(ui) 
    {
        this.ui = ui;
        this.maxEntries = 10;
    }

    load() 
    {
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        this.display(leaderboard);
        return leaderboard;
    }

    update(name, time) 
    {
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboard.push({ name, time });
        leaderboard.sort((a, b) => b.time - a.time);
        if (leaderboard.length > this.maxEntries) leaderboard.pop();
        this.display(leaderboard);
        this.save(leaderboard);
    }

    save(leaderboard) 
    {
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }

    display(leaderboard) 
    {
        let html = '<h3>Leaderboard</h3><table>';
        html += '<tr><th><center>#</center></th><th>Name</th><th>Time (s)</th></tr>';
        leaderboard.forEach((entry, index) => 
        {
            html += `<tr><td>#${index + 1}</td><td>${entry.name}</td><td>${entry.time.toFixed(2)}</td></tr>`;
        });
        html += '</table>';
        this.ui.leaderboardEl.innerHTML = html;
        this.ui.leaderboardGameOverEl.innerHTML = html;
    }

    reset() 
    {
        localStorage.removeItem('leaderboard');
        this.display([]);
    }
}