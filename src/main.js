// Dummy Data
const teams = [
    { id: 1, name: 'Shadow Coders', balance: 5000, bugs: [], profit: 0 },
    { id: 2, name: 'Cyber Phantoms', balance: 5000, bugs: [], profit: 0 },
    { id: 3, name: 'Logic Bombs', balance: 5000, bugs: [], profit: 0 },
];

const availableBugs = [
    { id: 'BUG-404', name: 'Memory Leak In Filter', value: 1200, difficulty: 'Hard' },
    { id: 'BUG-500', name: 'Database Recursive Loop', value: 800, difficulty: 'Medium' },
    { id: 'BUG-101', name: 'Auth Bypass Exploit', value: 2000, difficulty: 'Expert' },
];

let currentState = {
    page: 'admin-login', // 'admin-login', 'admin-dashboard', 'team-login', 'auction', 'solving', 'leaderboard'
    userRole: null,
    currentRoom: null,
};

// Router Function
function renderPage() {
    const app = document.getElementById('app');
    app.classList.remove('fade-in');
    void app.offsetWidth; // Trigger reflow
    app.classList.add('fade-in');

    switch (currentState.page) {
        case 'admin-login':
            app.innerHTML = AdminLoginPage();
            break;
        case 'admin-dashboard':
            app.innerHTML = AdminDashboardPage();
            break;
        case 'team-login':
            app.innerHTML = TeamLoginPage();
            break;
        case 'auction':
            app.innerHTML = AuctionPage();
            break;
        case 'solving':
            app.innerHTML = SolvingPage();
            break;
        case 'leaderboard':
            app.innerHTML = LeaderboardPage();
            break;
        default:
            app.innerHTML = '<h1>404 Page Not Found</h1>';
    }
    attachEvents();
}

// Page Components
function AdminLoginPage() {
    return `
        <div class="login-screen">
            <div class="card login-card neon-border-green">
                <h1 class="neon-text-green mb-4">BUG AUCTION ARENA</h1>
                <h2 class="mb-6">ADMIN LOGIN</h2>
                <div class="mb-4">
                    <input type="text" placeholder="Admin Username" class="input-field">
                </div>
                <div class="mb-6">
                    <input type="password" placeholder="Key Phrase" class="input-field">
                </div>
                <button class="glow-button glow-button-green w-full" onclick="navigate('admin-dashboard')">INITIALIZE SESSION</button>
                <p class="mt-4 text-sm text-secondary cursor-pointer" onclick="navigate('team-login')">Switch to Team Access</p>
            </div>
        </div>
    `;
}

function AdminDashboardPage() {
    return `
        <div class="container">
            <header class="flex justify-between items-center mb-10">
                <h1 class="neon-text-green">ADMIN CONTROL CENTER</h1>
                <button class="glow-button glow-button-purple" onclick="navigate('admin-login')">TERMINATE SESSION</button>
            </header>

            <div class="dashboard-grid">
                <div class="card neon-border-green">
                    <h3 class="mb-4">ROOM MANAGEMENT</h3>
                    <button class="glow-button glow-button-green w-full mb-3" onclick="alert('Room Created: ARENA-X')">CREATE NEW ROOM</button>
                    <div class="text-sm text-secondary">Active Room: <span class="text-white">ARENA-X</span></div>
                </div>

                <div class="card neon-border-purple">
                    <h3 class="mb-4">AUCTION CONTROL</h3>
                    <div class="flex gap-2 mb-4">
                        <button class="glow-button glow-button-green text-xs" onclick="alert('Auction Started')">START BIDDING</button>
                        <button class="glow-button glow-button-purple text-xs" onclick="alert('Auction Paused')">PAUSE</button>
                    </div>
                    <button class="glow-button glow-button-purple w-full" onclick="navigate('solving')">LOCK AUCTION & START SOLVING</button>
                </div>

                <div class="card col-span-2">
                    <h3 class="mb-4">BUG REPOSITORY (MARKET VALUE)</h3>
                    <div class="bug-list">
                        ${availableBugs.map(bug => `
                            <div class="bug-item">
                                <div>
                                    <span class="font-mono text-neon-green">${bug.id}</span>
                                    <div class="text-sm">${bug.name}</div>
                                </div>
                                <div class="text-right">
                                    <div class="neon-text-purple">$${bug.value}</div>
                                    <button class="text-xs underline text-secondary hover:text-white" onclick="openModal()">Assign</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="mt-8 flex gap-4">
                 <button class="glow-button glow-button-purple" onclick="navigate('leaderboard')">VIEW LIVE LEADERBOARD</button>
                 <button class="glow-button glow-button-green" onclick="alert('Contest Ended. Rewards Distributed.')">END CONTEST</button>
            </div>
        </div>

        <div id="assign-modal" class="modal-overlay">
            <div class="modal">
                <h3 class="mb-4">ASSIGN BUG TO TEAM</h3>
                <select class="input-field mb-4">
                    <option>Shadow Coders</option>
                    <option>Cyber Phantoms</option>
                    <option>Logic Bombs</option>
                </select>
                <div class="flex gap-4">
                    <button class="glow-button glow-button-green flex-1" onclick="closeModal()">CONFIRM</button>
                    <button class="glow-button glow-button-purple flex-1" onclick="closeModal()">CANCEL</button>
                </div>
            </div>
        </div>
    `;
}

function TeamLoginPage() {
    return `
        <div class="login-screen">
            <div class="card login-card neon-border-purple">
                <h1 class="neon-text-purple mb-4">TEAM UPLINK</h1>
                <div class="mb-4 text-left">
                    <label class="text-xs text-secondary mb-1 block">TEAM IDENTITY</label>
                    <input type="text" placeholder="Team Name" class="input-field">
                </div>
                <div class="mb-4 text-left">
                     <label class="text-xs text-secondary mb-1 block">AUTH KEY</label>
                    <input type="password" placeholder="••••••••" class="input-field">
                </div>
                <div class="mb-4 text-left">
                     <label class="text-xs text-secondary mb-1 block">ROOM ID</label>
                    <input type="text" placeholder="ARENA-X" class="input-field">
                </div>
                <div class="mb-6 text-left">
                     <label class="text-xs text-secondary mb-1 block">ENVIRONMENT</label>
                    <select class="input-field">
                        <option>JavaScript / Node.js</option>
                        <option>Python 3.10</option>
                        <option>C++ / G++</option>
                        <option>Java / JDK 17</option>
                    </select>
                </div>
                <button class="glow-button glow-button-purple w-full" onclick="navigate('auction')">ESTABLISH CONNECTION</button>
                 <p class="mt-4 text-sm text-secondary cursor-pointer" onclick="navigate('admin-login')">Switch to Admin Access</p>
            </div>
        </div>
    `;
}

function AuctionPage() {
    return `
        <div class="container">
            <header class="flex justify-between items-center mb-10">
                <div>
                     <h1 class="neon-text-purple">AUCTION FLOOR</h1>
                     <p class="text-sm text-secondary">Connected as: <span class="text-white">Shadow Coders</span></p>
                </div>
                <div class="card stats-card neon-border-green py-2 px-6">
                    <div class="text-sm mr-4">WALLET BALANCE</div>
                    <div class="text-2xl neon-text-green">$5,000</div>
                </div>
            </header>

            <div class="dashboard-grid">
                <div class="card col-span-2">
                    <h3 class="mb-6">LIVE BIDDING: <span class="neon-text-green">BUG-101 (Auth Bypass)</span></h3>
                    <div class="flex items-end gap-10">
                        <div class="flex-1">
                             <div class="text-xs text-secondary mb-2">CURRENT HIGHEST BID</div>
                             <div class="text-5xl font-bold neon-text-purple">$2,450</div>
                             <div class="text-sm text-secondary mt-2">By: Cyber Phantoms</div>
                        </div>
                        <div class="flex-1">
                             <input type="number" placeholder="Enter bid amount" class="input-field mb-4" value="2500">
                             <button class="glow-button glow-button-green w-full">PLACE BID</button>
                        </div>
                    </div>
                </div>

                <div class="card neon-border-purple">
                    <h3 class="mb-4">BUGS ACQUIRED</h3>
                    <div class="bug-list">
                         <div class="bug-item border-none">
                            <div>
                                <span class="font-mono text-neon-blue">BUG-404</span>
                                <div class="text-xs text-secondary">Price: $1,200</div>
                            </div>
                            <div class="text-right">
                                <div class="text-xs text-secondary">Potential ROI</div>
                                <div class="neon-text-green">+$400</div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-white/10">
                        <div class="flex justify-between text-sm">
                            <span>TOTAL INVESTMENT</span>
                            <span>$1,200</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-8">
                 <button class="glow-button glow-button-purple" onclick="navigate('solving')">MOVE TO SOLVING PHASE</button>
            </div>
        </div>
    `;
}

function SolvingPage() {
    return `
        <div class="container">
            <header class="flex justify-between items-center mb-8">
                <h1 class="neon-text-green">SOLVING ARENA</h1>
                <div class="font-mono text-2xl neon-text-purple">00:15:34</div>
            </header>

            <div class="flex flex-col md:flex-row gap-8">
                <div class="w-full md:w-1/3">
                    <div class="card neon-border-green mb-6">
                        <h3 class="mb-4">BUG DETAILS</h3>
                        <div class="mb-2"><span class="text-secondary text-xs uppercase">Target:</span> <span class="font-mono">BUG-404</span></div>
                        <div class="mb-2"><span class="text-secondary text-xs uppercase">Class:</span> <span class="text-neon-purple">MEMORY_LEAK</span></div>
                         <div class="mb-4"><span class="text-secondary text-xs uppercase">Reward:</span> <span class="text-neon-green">$1,600</span></div>
                        <div class="text-sm leading-relaxed">
                            A memory leak has been detected in the new 'Galaxy' filter module. Analyze the pointer allocation and identify the missing free() call.
                        </div>
                    </div>
                    <div class="card">
                        <h4 class="mb-4 text-sm text-secondary">ASSIGNED BUGS</h4>
                        <div class="bg-white/5 p-3 rounded mb-2 border-l-2 border-neon-green">BUG-404 (In Progress)</div>
                        <div class="bg-white/5 p-3 rounded text-secondary opacity-50">BUG-501 (Locked)</div>
                    </div>
                </div>

                <div class="w-full md:w-2/3">
                    <div class="card h-full flex flex-col">
                        <h3 class="mb-4">TERMINAL_OUTPUT</h3>
                        <div class="flex-1 bg-black p-4 rounded border border-white/10 font-mono text-sm mb-6 min-h-[300px]">
                            <p class="text-neon-green">[SYSTEM] Initializing debugger...</p>
                            <p>[OK] Symbols loaded.</p>
                            <p class="text-neon-purple">[!] Warning: Unfinished allocation at kernel.c:452</p>
                            <p class="mt-4">> Identify the line number where the fix is required:</p>
                        </div>
                        <div class="flex gap-4">
                            <input type="text" placeholder="Enter solution hash or line number" class="input-field">
                            <button class="glow-button glow-button-green" onclick="alert('Solution submitted for verification!')">SUBMIT</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-8">
                 <button class="glow-button glow-button-purple" onclick="navigate('leaderboard')">VIEW RANKINGS</button>
            </div>
        </div>
    `;
}

function LeaderboardPage() {
    return `
        <div class="container">
            <header class="text-center mb-12">
                <h1 class="text-5xl neon-text-green mb-2">GLOBAL RANKINGS</h1>
                <p class="text-secondary">LIVE FROM ARENA-X</p>
            </header>

            <div class="card neon-border-purple p-0 overflow-hidden">
                <table class="leaderboard-table">
                    <thead>
                        <tr class="bg-white/5">
                            <th>RANK</th>
                            <th>TEAM IDENTITY</th>
                            <th>STATUS</th>
                            <th>BUGS CRACKED</th>
                            <th class="text-right">TOTAL PROFIT</th>
                        </tr>
                    </thead>
                    <tbody id="leaderboard-body">
                        <tr>
                            <td class="neon-text-green font-bold">#1</td>
                            <td>CYBER PHANTOMS</td>
                            <td><span class="text-xs bg-neon-green/20 text-neon-green px-2 py-1 rounded">SOLVING</span></td>
                            <td>4</td>
                            <td class="text-right neon-text-green font-mono">+$8,400</td>
                        </tr>
                        <tr>
                            <td class="neon-text-purple font-bold">#2</td>
                            <td>SHADOW CODERS</td>
                            <td><span class="text-xs bg-neon-purple/20 text-neon-purple px-2 py-1 rounded">IDLE</span></td>
                            <td>3</td>
                            <td class="text-right neon-text-purple font-mono">+$5,100</td>
                        </tr>
                        <tr>
                            <td class="text-secondary font-bold">#3</td>
                            <td>LOGIC BOMBS</td>
                            <td><span class="text-xs bg-white/10 text-secondary px-2 py-1 rounded">SOLVING</span></td>
                            <td>2</td>
                            <td class="text-right text-secondary font-mono">-$200</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="card text-center">
                    <div class="text-xs text-secondary mb-2">TOTAL BOUNTY DISTRIBUTED</div>
                    <div class="text-3xl neon-text-green">$45,000</div>
                </div>
                <div class="card text-center">
                    <div class="text-xs text-secondary mb-2">MOST VALUABLE TEAM</div>
                    <div class="text-3xl neon-text-purple">CYBER PHANTOMS</div>
                </div>
                <div class="card text-center">
                    <div class="text-xs text-secondary mb-2">SYSTEM UPTIME</div>
                    <div class="text-3xl text-neon-blue">99.9%</div>
                </div>
            </div>
            
            <div class="mt-8 flex justify-center">
                 <button class="glow-button glow-button-green" onclick="navigate('admin-login')">BACK TO PORTAL</button>
            </div>
        </div>
    `;
}

// Global Nav Logic
window.navigate = (page) => {
    currentState.page = page;
    renderPage();
};

window.openModal = () => {
    document.getElementById('assign-modal').style.display = 'flex';
};

window.closeModal = () => {
    document.getElementById('assign-modal').style.display = 'none';
};

function attachEvents() {
    // This is where you'd attach dynamic non-string events if needed
}

// Live simulation for leaderboard
setInterval(() => {
    const tableBody = document.getElementById('leaderboard-body');
    if (tableBody) {
        const rows = tableBody.querySelectorAll('tr');
        const randomRow = rows[Math.floor(Math.random() * rows.length)];
        const profitCell = randomRow.cells[4];
        let currentProfit = parseInt(profitCell.innerText.replace(/[+$,]/g, ''));
        currentProfit += Math.floor(Math.random() * 100);
        profitCell.innerText = (currentProfit >= 0 ? '+' : '-') + '$' + Math.abs(currentProfit).toLocaleString();
        profitCell.classList.add('fade-in');
        setTimeout(() => profitCell.classList.remove('fade-in'), 500);
    }
}, 3000);

// Initialize
renderPage();
