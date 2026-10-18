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

    // Navigation Switcher
    function showView(viewName) {
        Object.keys(views).forEach(key => {
            if (views[key]) views[key].classList.add('hidden');
        });
        if (views[viewName]) views[viewName].classList.remove('hidden');
    }

    // Load Local Stats
    function loadStats() {
        const stats = JSON.parse(localStorage.getItem('cad_versus_stats') || '{"played":0,"wins":0,"bestEasy":"--:--","bestMedium":"--:--"}');
        document.getElementById('stat-played').textContent = stats.played;
        document.getElementById('stat-wins').textContent = stats.wins;
        document.getElementById('stat-best-easy').textContent = stats.bestEasy;
        document.getElementById('stat-best-medium').textContent = stats.bestMedium;
    }
    loadStats();

    // --- MAIN MENU ACTIONS ---
    document.getElementById('singleplayer-btn').addEventListener('click', () => {
        mode = 'single';
        showView('difficulty');
    });

    document.getElementById('multiplayer-btn').addEventListener('click', () => {
        mode = 'multi';
        initSocket();
        showView('lobbyHub');
    });

    document.querySelectorAll('#back-to-menu-1, #back-to-menu-2, #return-menu-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            stopTimer();
            if (socket) socket.disconnect();
            showView('menu');
        });
    });

    // --- SINGLE PLAYER FLOW ---
    document.querySelectorAll('.diff-card').forEach(card => {
        card.addEventListener('click', () => {
            const diff = card.getAttribute('data-diff');
            selectSingleplayerChallenge(diff);
        });
    });

    function selectSingleplayerChallenge(diff) {
        const matching = CHALLENGE_LIBRARY.filter(c => c.difficulty === diff);
        currentChallenge = matching[Math.floor(Math.random() * matching.length)];
        
        document.getElementById('preview-title').textContent = currentChallenge.title;
        document.getElementById('preview-diff').textContent = currentChallenge.difficulty.toUpperCase();
        document.getElementById('preview-category').textContent = currentChallenge.category;
        document.getElementById('preview-unit').textContent = currentChallenge.unit;
        document.getElementById('preview-description').textContent = currentChallenge.description;
        
        showView('preview');
    }

    document.getElementById('start-challenge-btn').addEventListener('click', () => {
        setupGameplayView(currentChallenge);
        showView('gameplay');
        startTimer();
    });

    // --- GAMEPLAY & TIMER LOGIC ---
    function setupGameplayView(challenge) {
        attemptsLeft = 3;
        attemptsDisplay.textContent = attemptsLeft;
        massInput.value = '';
        feedbackMsg.textContent = '';
        document.getElementById('drawing-title').textContent = challenge.title;
        document.getElementById('part-material').textContent = challenge.material;
        document.getElementById('part-unit').textContent = challenge.unit;
        document.getElementById('submission-unit-label').textContent = challenge.unit;
        document.getElementById('schematic-svg').outerHTML = challenge.svgDrawing;
    }

    function startTimer() {
        stopTimer();
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const mins = String(Math.floor(elapsed / 60000)).padStart(2, '0');
            const secs = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
            const ms = Math.floor((elapsed % 1000) / 100);
            stopwatchDisplay.textContent = `${mins}:${secs}.${ms}`;
        }, 100);
    }

    function stopTimer() {
        if (timerInterval) clearInterval(timerInterval);
    }

    // --- SUBMISSION HANDLING ---
    document.getElementById('submit-mass-btn').addEventListener('click', () => {
        const val = parseFloat(massInput.value);
        if (isNaN(val) || val <= 0) {
            feedbackMsg.textContent = "Please enter a valid positive number.";
            feedbackMsg.className = "feedback-msg error";
            return;
        }

        if (mode === 'single') {
            handleSingleplayerSubmission(val);
        } else if (mode === 'multi') {
            socket.emit('submit_answer', { code: currentRoomCode, mass: val });
        }
    });

    function handleSingleplayerSubmission(submittedMass) {
        const ref = currentChallenge.referenceMass;
        const tol = currentChallenge.tolerance;

        if (Math.abs(submittedMass - ref) <= tol) {
            stopTimer();
            showResults(true, stopwatchDisplay.textContent, ref, submittedMass, 4 - attemptsLeft);
            updateStats(true, currentChallenge.difficulty, stopwatchDisplay.textContent);
        } else {
            attemptsLeft -= 1;
            attemptsDisplay.textContent = attemptsLeft;
            if (attemptsLeft <= 0) {
                stopTimer();
                showResults(false, stopwatchDisplay.textContent, ref, submittedMass, 3);
                updateStats(false);
            } else {
                feedbackMsg.textContent = `Incorrect mass. ${attemptsLeft} attempt(s) remaining.`;
                feedbackMsg.className = "feedback-msg error";
            }
        }
    }

    function showResults(success, timeStr, refMass, subMass, attempts) {
        document.getElementById('result-headline').textContent = success ? "Challenge Completed!" : "Challenge Failed";
        document.getElementById('result-headline').style.color = success ? "#4caf50" : "var(--danger)";
        document.getElementById('res-time').textContent = timeStr;
        document.getElementById('res-ref-mass').textContent = `${refMass} ${currentChallenge.unit}`;
        document.getElementById('res-sub-mass').textContent = `${subMass} ${currentChallenge.unit}`;
        document.getElementById('res-attempts').textContent = `${attempts} of 3`;
        showView('results');
    }

    function updateStats(won, diff, timeStr) {
        const stats = JSON.parse(localStorage.getItem('cad_versus_stats') || '{"played":0,"wins":0,"bestEasy":"--:--","bestMedium":"--:--"}');
        stats.played += 1;
        if (won) {
            stats.wins += 1;
            if (diff === 'easy' && (stats.bestEasy === '--:--' || timeStr < stats.bestEasy)) stats.bestEasy = timeStr;
            if (diff === 'medium' && (stats.bestMedium === '--:--' || timeStr < stats.bestMedium)) stats.bestMedium = timeStr;
        }
        localStorage.setItem('cad_versus_stats', JSON.stringify(stats));
        loadStats();
    }

    document.getElementById('play-again-btn').addEventListener('click', () => {
        if (mode === 'single') {
            selectSingleplayerChallenge(currentChallenge.difficulty);
        } else {
            showView('waitingRoom');
        }
    });

    // --- MULTIPLAYER SOCKET HANDLING ---
    function initSocket() {
        if (socket) return;
        socket = io();

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

            // Synchronized Countdown
            const overlay = document.getElementById('countdown-overlay');
            const numDisplay = document.getElementById('countdown-num');
            overlay.classList.remove('hidden');

            const countInterval = setInterval(() => {
                const remaining = Math.ceil((serverStartTime - Date.now()) / 1000);
                if (remaining > 0) {
                    numDisplay.textContent = remaining;
                } else {
                    clearInterval(countInterval);
                    overlay.classList.add('hidden');
                    startTimer();
                }
            }, 200);
        });

        socket.on('submission_result', (res) => {
            feedbackMsg.textContent = res.msg;
            feedbackMsg.className = res.success ? "feedback-msg success" : "feedback-msg error";
            if (!res.success && res.attemptsLeft !== undefined) {
                attemptsDisplay.textContent = res.attemptsLeft;
            }
        });

        socket.on('match_over', ({ winner, referenceMass, standings }) => {
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

    document.getElementById('create-lobby-btn').addEventListener('click', () => {
        const nickname = nicknameInput.value.trim() || "Player";
        const capacity = parseInt(document.getElementById('lobby-capacity').value, 10);
        socket.emit('create_room', { nickname, capacity });
    });

    document.getElementById('join-lobby-btn').addEventListener('click', () => {
        const nickname = nicknameInput.value.trim() || "Player";
        const code = document.getElementById('join-code-input').value.trim();
        if (code) socket.emit('join_room', { nickname, code });
    });

    function updateLobbyUI(room) {
        document.getElementById('display-room-code').textContent = room.code;
        document.getElementById('player-count').textContent = room.players.length;
        document.getElementById('max-capacity').textContent = room.capacity;

        const list = document.getElementById('player-list');
        list.innerHTML = room.players.map(p => `
            <li>
                <strong>${p.nickname}</strong> ${p.id === room.hostId ? '(Host)' : ''} — <em>${p.status}</em>
            </li>
        `).join('');

        if (isHost) {
            document.getElementById('host-controls').classList.remove('hidden');
        } else {
            document.getElementById('host-controls').classList.add('hidden');
        }
    }

    document.getElementById('start-match-btn').addEventListener('click', () => {
        const difficulty = document.getElementById('multi-diff-select').value;
        socket.emit('start_game', { code: currentRoomCode, difficulty });
    });
});
