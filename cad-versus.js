document.addEventListener("DOMContentLoaded", () => {
    // --- STATE MANAGEMENT ---
    let socket = null;
    let mode = 'single'; // 'single' or 'multi'
    let currentChallenge = null;
    let timerInterval = null;
    let startTime = null;
    let attemptsLeft = 3;
    let currentRoomCode = null;
    let isHost = false;

    // --- DOM ELEMENTS ---
    const views = {
        menu: document.getElementById('menu-view'),
        difficulty: document.getElementById('difficulty-view'),
        lobbyHub: document.getElementById('lobby-hub-view'),
        waitingRoom: document.getElementById('waiting-room-view'),
        preview: document.getElementById('preview-view'),
        gameplay: document.getElementById('gameplay-view'),
        results: document.getElementById('results-view')
    };

    const nicknameInput = document.getElementById('nickname-input');
    const stopwatchDisplay = document.getElementById('stopwatch-display');
    const massInput = document.getElementById('mass-input');
    const feedbackMsg = document.getElementById('feedback-message');
    const attemptsDisplay = document.getElementById('attempts-count');

    // Navigation Switcher helper
    function showView(viewName) {
        Object.keys(views).forEach(key => {
            if (views[key]) {
                views[key].classList.add('hidden');
            }
        });
        if (views[viewName]) {
            views[viewName].classList.remove('hidden');
        } else {
            console.error(`View "${viewName}" not found in DOM.`);
        }
    }

    // Load Local Stats
    function loadStats() {
        try {
            const stats = JSON.parse(localStorage.getItem('cad_versus_stats') || '{"played":0,"wins":0,"bestEasy":"--:--","bestMedium":"--:--"}');
            if (document.getElementById('stat-played')) document.getElementById('stat-played').textContent = stats.played;
            if (document.getElementById('stat-wins')) document.getElementById('stat-wins').textContent = stats.wins;
            if (document.getElementById('stat-best-easy')) document.getElementById('stat-best-easy').textContent = stats.bestEasy;
            if (document.getElementById('stat-best-medium')) document.getElementById('stat-best-medium').textContent = stats.bestMedium;
        } catch (e) {
            console.warn("Could not load local stats:", e);
        }
    }
    loadStats();

    // --- MAIN MENU BUTTON HANDLERS ---
    const singleplayerBtn = document.getElementById('singleplayer-btn');
    if (singleplayerBtn) {
        singleplayerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            mode = 'single';
            showView('difficulty');
        });
    }

    const multiplayerBtn = document.getElementById('multiplayer-btn');
    if (multiplayerBtn) {
        multiplayerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            mode = 'multi';
            initSocket();
            showView('lobbyHub');
        });
    }

    // Back to Menu Buttons
    document.querySelectorAll('#back-to-menu-1, #back-to-menu-2, #return-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            stopTimer();
            showView('menu');
        });
    });

    // --- DIFFICULTY SELECTION (SINGLE PLAYER) ---
    document.querySelectorAll('.diff-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const diff = card.getAttribute('data-diff');
            selectSingleplayerChallenge(diff);
        });
    });

    function selectSingleplayerChallenge(diff) {
        // Safe access to CHALLENGE_LIBRARY
        const lib = (typeof CHALLENGE_LIBRARY !== 'undefined' && Array.isArray(CHALLENGE_LIBRARY)) 
            ? CHALLENGE_LIBRARY 
            : [];

        const matching = lib.filter(c => c.difficulty === diff);
        if (matching.length === 0) {
            alert(`No parts found for difficulty "${diff}". Make sure challenges.js is properly loaded.`);
            return;
        }

        currentChallenge = matching[Math.floor(Math.random() * matching.length)];
        
        document.getElementById('preview-title').textContent = currentChallenge.title || "Engineering Challenge";
        document.getElementById('preview-diff').textContent = (currentChallenge.difficulty || diff).toUpperCase();
        document.getElementById('preview-category').textContent = currentChallenge.category || "General";
        document.getElementById('preview-unit').textContent = currentChallenge.unit || "g";
        document.getElementById('preview-description').textContent = currentChallenge.description || "";
        
        showView('preview');
    }

    const startChallengeBtn = document.getElementById('start-challenge-btn');
    if (startChallengeBtn) {
        startChallengeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentChallenge) return;
            setupGameplayView(currentChallenge);
            showView('gameplay');
            startTimer();
        });
    }

    // --- GAMEPLAY & TIMER LOGIC ---
    function setupGameplayView(challenge) {
        attemptsLeft = 3;
        if (attemptsDisplay) attemptsDisplay.textContent = attemptsLeft;
        if (massInput) massInput.value = '';
        if (feedbackMsg) feedbackMsg.textContent = '';
        
        const titleEl = document.getElementById('drawing-title');
        const matEl = document.getElementById('part-material');
        const unitEl = document.getElementById('part-unit');
        const subUnitEl = document.getElementById('submission-unit-label');
        const svgContainer = document.querySelector('.drawing-canvas');

        if (titleEl) titleEl.textContent = challenge.title;
        if (matEl) matEl.textContent = challenge.material;
        if (unitEl) unitEl.textContent = challenge.unit;
        if (subUnitEl) subUnitEl.textContent = challenge.unit;
        if (svgContainer && challenge.svgDrawing) {
            svgContainer.innerHTML = challenge.svgDrawing;
        }
    }

    function startTimer() {
        stopTimer();
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const mins = String(Math.floor(elapsed / 60000)).padStart(2, '0');
            const secs = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
            const ms = Math.floor((elapsed % 1000) / 100);
            if (stopwatchDisplay) stopwatchDisplay.textContent = `${mins}:${secs}.${ms}`;
        }, 100);
    }

    function stopTimer() {
        if (timerInterval) clearInterval(timerInterval);
    }

    // --- SUBMISSION HANDLING ---
    const submitBtn = document.getElementById('submit-mass-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const val = parseFloat(massInput.value);
            if (isNaN(val) || val <= 0) {
                if (feedbackMsg) {
                    feedbackMsg.textContent = "Please enter a valid positive mass number.";
                    feedbackMsg.className = "feedback-msg error";
                }
                return;
            }

            if (mode === 'single') {
                handleSingleplayerSubmission(val);
            } else if (mode === 'multi') {
                if (socket && socket.connected) {
                    socket.emit('submit_answer', { code: currentRoomCode, mass: val });
                } else {
                    alert("Disconnected from server. Check that server.js is running.");
                }
            }
        });
    }

    function handleSingleplayerSubmission(submittedMass) {
        const ref = currentChallenge.referenceMass;
        const tol = currentChallenge.tolerance || 0.5;

        if (Math.abs(submittedMass - ref) <= tol) {
            stopTimer();
            showResults(true, stopwatchDisplay.textContent, ref, submittedMass, 4 - attemptsLeft);
            updateStats(true, currentChallenge.difficulty, stopwatchDisplay.textContent);
        } else {
            attemptsLeft -= 1;
            if (attemptsDisplay) attemptsDisplay.textContent = attemptsLeft;
            if (attemptsLeft <= 0) {
                stopTimer();
                showResults(false, stopwatchDisplay.textContent, ref, submittedMass, 3);
                updateStats(false);
            } else {
                if (feedbackMsg) {
                    feedbackMsg.textContent = `Incorrect mass. ${attemptsLeft} attempt(s) remaining.`;
                    feedbackMsg.className = "feedback-msg error";
                }
            }
        }
    }

    function showResults(success, timeStr, refMass, subMass, attempts) {
        const headline = document.getElementById('result-headline');
        if (headline) {
            headline.textContent = success ? "Challenge Completed!" : "Challenge Failed";
            headline.style.color = success ? "#4caf50" : "var(--danger)";
        }
        if (document.getElementById('res-time')) document.getElementById('res-time').textContent = timeStr;
        if (document.getElementById('res-ref-mass')) document.getElementById('res-ref-mass').textContent = `${refMass} ${currentChallenge.unit}`;
        if (document.getElementById('res-sub-mass')) document.getElementById('res-sub-mass').textContent = `${subMass} ${currentChallenge.unit}`;
        if (document.getElementById('res-attempts')) document.getElementById('res-attempts').textContent = `${attempts} of 3`;
        showView('results');
    }

    function updateStats(won, diff, timeStr) {
        try {
            const stats = JSON.parse(localStorage.getItem('cad_versus_stats') || '{"played":0,"wins":0,"bestEasy":"--:--","bestMedium":"--:--"}');
            stats.played += 1;
            if (won) {
                stats.wins += 1;
                if (diff === 'easy' && (stats.bestEasy === '--:--' || timeStr < stats.bestEasy)) stats.bestEasy = timeStr;
                if (diff === 'medium' && (stats.bestMedium === '--:--' || timeStr < stats.bestMedium)) stats.bestMedium = timeStr;
            }
            localStorage.setItem('cad_versus_stats', JSON.stringify(stats));
            loadStats();
        } catch (e) {
            console.warn("Could not save stats:", e);
        }
    }

    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (mode === 'single') {
                selectSingleplayerChallenge(currentChallenge.difficulty);
            } else {
                showView('waitingRoom');
            }
        });
    }

    // --- MULTIPLAYER & SOCKET.IO LOBBY CREATION ---
    function initSocket() {
        if (typeof io === 'undefined') {
            console.warn("Socket.IO library not detected. Running offline mode.");
            return;
        }
        if (socket) return;

        socket = io();

        socket.on('connect_error', () => {
            console.warn("Failed to connect to backend server. Make sure server.js is running.");
        });

        socket.on('room_created', ({ code, room }) => {
            currentRoomCode = code;
            isHost = true;
            updateLobbyUI(room);
            showView('waitingRoom');
        });

        socket.on('room_updated', (room) => {
            updateLobbyUI(room);
        });

        socket.on('match_started', ({ startTime: serverStartTime, challenge }) => {
            currentChallenge = challenge;
            setupGameplayView(challenge);
            showView('gameplay');

            const overlay = document.getElementById('countdown-overlay');
            const numDisplay = document.getElementById('countdown-num');
            if (overlay) overlay.classList.remove('hidden');

            const countInterval = setInterval(() => {
                const remaining = Math.ceil((serverStartTime - Date.now()) / 1000);
                if (remaining > 0) {
                    if (numDisplay) numDisplay.textContent = remaining;
                } else {
                    clearInterval(countInterval);
                    if (overlay) overlay.classList.add('hidden');
                    startTimer();
                }
            }, 200);
        });

        socket.on('submission_result', (res) => {
            if (feedbackMsg) {
                feedbackMsg.textContent = res.msg;
                feedbackMsg.className = res.success ? "feedback-msg success" : "feedback-msg error";
            }
            if (!res.success && res.attemptsLeft !== undefined) {
                if (attemptsDisplay) attemptsDisplay.textContent = res.attemptsLeft;
            }
        });

        socket.on('match_over', ({ winner, referenceMass }) => {
            stopTimer();
            showResults(
                winner.id === socket.id,
                stopwatchDisplay.textContent,
                referenceMass,
                massInput.value || "N/A",
                3 - attemptsLeft
            );
        });

        socket.on('error_msg', (msg) => alert(msg));
    }

    const createLobbyBtn = document.getElementById('create-lobby-btn');
    if (createLobbyBtn) {
        createLobbyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const nickname = (nicknameInput && nicknameInput.value.trim()) ? nicknameInput.value.trim() : "Player";
            const capInput = document.getElementById('lobby-capacity');
            const capacity = capInput ? parseInt(capInput.value, 10) : 4;

            if (socket && socket.connected) {
                socket.emit('create_room', { nickname, capacity });
            } else {
                // Fallback / Offline Mock Room Creation for testing
                currentRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                isHost = true;
                updateLobbyUI({
                    code: currentRoomCode,
                    hostId: 'local_user',
                    capacity: capacity,
                    players: [{ id: 'local_user', nickname: nickname, status: 'Ready (Offline Server)' }]
                });
                showView('waitingRoom');
            }
        });
    }

    const joinLobbyBtn = document.getElementById('join-lobby-btn');
    if (joinLobbyBtn) {
        joinLobbyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const nickname = (nicknameInput && nicknameInput.value.trim()) ? nicknameInput.value.trim() : "Player";
            const codeInput = document.getElementById('join-code-input');
            const code = codeInput ? codeInput.value.trim() : "";
            
            if (!code) {
                alert("Please enter a room code.");
                return;
            }

            if (socket && socket.connected) {
                socket.emit('join_room', { nickname, code });
            } else {
                alert("Backend server is not running. Please start server.js to play multiplayer.");
            }
        });
    }

    function updateLobbyUI(room) {
        if (document.getElementById('display-room-code')) document.getElementById('display-room-code').textContent = room.code;
        if (document.getElementById('player-count')) document.getElementById('player-count').textContent = room.players.length;
        if (document.getElementById('max-capacity')) document.getElementById('max-capacity').textContent = room.capacity;

        const list = document.getElementById('player-list');
        if (list) {
            list.innerHTML = room.players.map(p => `
                <li>
                    <strong>${p.nickname}</strong> ${p.id === room.hostId ? '(Host)' : ''} — <em>${p.status}</em>
                </li>
            `).join('');
        }

        const hostControls = document.getElementById('host-controls');
        if (hostControls) {
            if (isHost) {
                hostControls.classList.remove('hidden');
            } else {
                hostControls.classList.add('hidden');
            }
        }
    }

    const startMatchBtn = document.getElementById('start-match-btn');
    if (startMatchBtn) {
        startMatchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const diffSelect = document.getElementById('multi-diff-select');
            const difficulty = diffSelect ? diffSelect.value : 'easy';
            if (socket && socket.connected) {
                socket.emit('start_game', { code: currentRoomCode, difficulty });
            } else {
                // Offline fallback for testing single player inside waiting room
                selectSingleplayerChallenge(difficulty);
            }
        });
    }
});
