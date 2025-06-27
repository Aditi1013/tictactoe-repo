let currentPlayer = 0;
    let currentRound = 1;
    let board = ["", "", "", "", "", "", "", "", ""];
    let scores = [0, 0];
    let gameActive = true;

    const bgMusic = document.getElementById("bgMusic");
    const tapSound = document.getElementById("tapSound");
    const winSound = document.getElementById("winSound");

    const gameUI = document.getElementById("gameUI");
    const boardEl = document.getElementById("board");
    const turnInfo = document.getElementById("turnInfo");
    const roundInfo = document.getElementById("roundInfo");
    const message = document.getElementById("message");
    const scoreBoard = document.getElementById("scoreBoard");
    const nextRoundBtn = document.getElementById("nextRoundBtn");
    const restartBtn = document.getElementById("restartBtn");

    function getSymbols() {
      return JSON.parse(localStorage.getItem("symbols") || '["X","O"]');
    }

    document.getElementById("startBtn").addEventListener("click", () => {
      const p1 = document.getElementById("player1").value.trim();
      const p2 = document.getElementById("player2").value.trim();
      const symbolSet = document.getElementById("symbolSet").value.split("/");
      const rounds = parseInt(document.getElementById("rounds").value);

      if (!p1 || !p2) return alert("Please enter both player names!");
      if (rounds < 1 || rounds > 10) return alert("Rounds must be between 1 and 10.");

      localStorage.setItem("player1", p1);
      localStorage.setItem("player2", p2);
      localStorage.setItem("symbols", JSON.stringify(symbolSet));
      localStorage.setItem("rounds", rounds);

      bgMusic.volume = 0.3;
      bgMusic.play();

      document.querySelector(".setup").classList.add("hidden");
      gameUI.classList.remove("hidden");
      initBoard();
      updateUI();
    });

    const p1 = () => localStorage.getItem("player1");
    const p2 = () => localStorage.getItem("player2");
    const rounds = parseInt(localStorage.getItem("rounds")) || 5;

    function initBoard() {
      board = ["", "", "", "", "", "", "", "", ""];
      gameActive = true;
      currentPlayer = currentRound % 2 === 1 ? 0 : 1;
      boardEl.innerHTML = "";
      for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.addEventListener("click", handleMove);
        boardEl.appendChild(cell);
      }
    }

    function handleMove(e) {
      const index = e.target.dataset.index;
      if (!gameActive || board[index] !== "") return;

      const [sym1, sym2] = getSymbols();
      board[index] = currentPlayer === 0 ? sym1 : sym2;
      e.target.textContent = board[index];

      tapSound.currentTime = 0;
      tapSound.play();

      const winLine = checkWin();
      if (winLine) {
        gameActive = false;
        scores[currentPlayer]++;
        message.textContent = `🎉 Congratulations ${currentPlayer === 0 ? p1() : p2()} wins! 😢 ${currentPlayer === 0 ? p2() : p1()} lost.`;
        winSound.play();
        nextRoundBtn.classList.remove("hidden");
        updateScore();
        highlightWin(winLine);
        return;
      }

      if (board.every(cell => cell !== "")) {
        message.textContent = "It's a draw!";
        gameActive = false;
        nextRoundBtn.classList.remove("hidden");
        return;
      }

      currentPlayer = 1 - currentPlayer;
      updateUI();
    }

    function checkWin() {
      const winConditions = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
      ];
      for (const condition of winConditions) {
        const [a,b,c] = condition;
        if (board[a] && board[a] === board[b] && board[b] === board[c]) {
          return condition;
        }
      }
      return null;
    }

    function highlightWin(indices) {
      indices.forEach(i => {
        const cell = boardEl.querySelector(`[data-index='${i}']`);
        if (cell) cell.classList.add("highlight");
      });
    }

    function updateUI() {
      const [sym1, sym2] = getSymbols();
      turnInfo.textContent = `Turn: ${currentPlayer === 0 ? p1() : p2()} (${currentPlayer === 0 ? sym1 : sym2})`;
      roundInfo.textContent = `Round ${currentRound} of ${rounds}`;
      message.textContent = "";
    }

    function updateScore() {
      const [sym1, sym2] = getSymbols();
      scoreBoard.innerHTML = `
        Score:<br>
        ${p1()} (${sym1}): ${scores[0]}<br>
        ${p2()} (${sym2}): ${scores[1]}`;
    }

    nextRoundBtn.addEventListener("click", () => {
      currentRound++;
      if (currentRound > rounds) {
        message.textContent = scores[0] > scores[1]
          ? `🏆 Final Winner: ${p1()}`
          : scores[0] < scores[1]
            ? `🏆 Final Winner: ${p2()}`
            : "⚖️ It's a Tie!";
        nextRoundBtn.classList.add("hidden");
        return;
      }
      nextRoundBtn.classList.add("hidden");
      initBoard();
      updateUI();
    });

    restartBtn.addEventListener("click", () => {
      bgMusic.pause();
      location.reload();
    });
  