// Main JavaScript for Memory Game
const board = document.querySelector('.game-board');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const playAgainButton = document.getElementById('play-again');
const difficultySelector = document.getElementById('difficulty');
const timerModeSelector = document.getElementById('timer-mode');
const bgMusic = document.getElementById('background-music');
const flipSound = document.getElementById('flip-sound');
const playButton = document.getElementById('play-music');
const pauseButton = document.getElementById('pause-music');
const muteButton = document.getElementById('mute-music');
const volumeControl = document.getElementById('volume-control');

// Fruit Emojis for different difficulties
const emojiSets = {
  easy: ['🍎', '🍐', '🍊', '🍇'],
  medium: ['🍎', '🍐', '🍊', '🍇', '🍓', '🍉'],
  hard: ['🍎', '🍐', '🍊', '🍇', '🍓', '🍉', '🍒', '🍍', '🥭', '🥝']
};

let icons = [];
let shuffledIcons;
let firstCard, secondCard;
let moves = 0;
let matchCount = 0;
let isFlipping = false;
let timer = 0;
let timeLimit = 0;
let interval;
let currentPlayer = 1;
let player1Score = 0;
let player2Score = 0;
let isTwoPlayerMode = false;
let gameOver = false;

function initializeGame() {
  gameOver = false;
  const difficulty = difficultySelector.value;
  const timerMode = timerModeSelector.value;

  // Set time limit based on Timer Mode selection
  timeLimit = timerMode === 'off' ? 0 : timerMode === 'short' ? 60 : 120;

  // Get the custom emojis if entered by the player
  const emojiInput = document.getElementById('emoji-picker').value.trim();
  let customEmojis = emojiInput.split(',').map(emoji => emoji.trim()).filter(emoji => emoji !== '');

  // Default to emojiSets if no or insufficient emojis are entered
  if (customEmojis.length < 10) {
    customEmojis = emojiSets[difficulty];
  }

  icons = customEmojis.flatMap(icon => [icon, icon]);
  shuffledIcons = icons.sort(() => 0.5 - Math.random());

  // Reset variables
  firstCard = null;
  secondCard = null;
  moves = 0;
  matchCount = 0;
  isFlipping = false;
  timer = 0;
  isTwoPlayerMode = document.getElementById('game-mode').value === 'two-player';

  // Reset UI
  board.innerHTML = '';
  movesDisplay.textContent = moves;
  timerDisplay.textContent = timer;
  playAgainButton.style.display = 'none';

  // Hide player scores if in single-player mode
  const playerScoreElements = document.querySelectorAll('.player-score');
  if (isTwoPlayerMode) {
    playerScoreElements.forEach(el => el.style.display = 'block');
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    updateScores();
  } else {
    playerScoreElements.forEach(el => el.style.display = 'none');
  }

  // Create the board
  shuffledIcons.forEach(icon => {
    const card = document.createElement('div');
    card.classList.add('card');

    const front = document.createElement('div');
    front.classList.add('front');
    front.textContent = '';

    const back = document.createElement('div');
    back.classList.add('back');
    back.textContent = icon;

    card.appendChild(front);
    card.appendChild(back);
    card.addEventListener('click', flipCard);

    board.appendChild(card);
  });

  // Reset and start the timer
  clearInterval(interval);
  if (timerMode === 'off') {
    startTimer();
  } else {
    startCountdownTimer();
  }
}

function flipCard() {
  if (gameOver || isFlipping || this === firstCard || this.classList.contains('flipped')) return;

  this.classList.add('flipped');
  flipSound.play();

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  checkMatch();
}

function checkMatch() {
  isFlipping = true;
  moves++;
  movesDisplay.textContent = moves;

  const isMatch = firstCard.querySelector('.back').textContent === secondCard.querySelector('.back').textContent;
  if (isMatch) {
    matchCount++;
    if (isTwoPlayerMode) {
      if (currentPlayer === 1) {
        player1Score++;
      } else {
        player2Score++;
      }
      updateScores();
    }

    if (matchCount === icons.length / 2) endGame(true);
    resetCards();
  } else {
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetCards();
      if (isTwoPlayerMode) {
        switchPlayer();
      }
    }, 1000);
  }
}

function resetCards() {
  [firstCard, secondCard] = [null, null];
  isFlipping = false;
}

function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  document.getElementById('current-turn').textContent = `Player ${currentPlayer}`;
}

function updateScores() {
  document.getElementById('player1-score').textContent = player1Score;
  document.getElementById('player2-score').textContent = player2Score;
}

function startTimer() {
  interval = setInterval(() => {
    timer++;
    timerDisplay.textContent = timer;
  }, 1000);
}

function startCountdownTimer() {
  timer = timeLimit;
  timerDisplay.textContent = timer;

  interval = setInterval(() => {
    timer--;
    timerDisplay.textContent = timer;
    if (timer <= 0) {
      clearInterval(interval);
      endGame(false);
    }
  }, 1000);
}

function endGame(won) {
  gameOver = true;
  clearInterval(interval);
  playAgainButton.style.display = 'block';

  if (won) {
    if (isTwoPlayerMode) {
      if (player1Score > player2Score) {
        showWinMessage('Player 1 Wins!');
      } else if (player2Score > player1Score) {
        showWinMessage('Player 2 Wins!');
      } else {
        showDrawMessage();
      }
    } else {
      showWinMessage('You Win!');
    }
  } else {
    showLossMessage();
  }
}

function showWinMessage(message) {
  createBoardMessage(message, true);

  setTimeout(() => {
    playAgainButton.style.display = 'block';
  }, 2000);

  playAgainButton.addEventListener('click', () => {
    initializeGame();
  });
}

function showLossMessage() {
  createBoardMessage('You Lose!', false);

  setTimeout(() => {
    playAgainButton.style.display = 'block';
  }, 2000);

  playAgainButton.addEventListener('click', () => {
    initializeGame();
  });
}

function showDrawMessage() {
  createBoardMessage('It\'s a Draw!', false);

  setTimeout(() => {
    playAgainButton.style.display = 'block';
  }, 2000);

  playAgainButton.addEventListener('click', () => {
    initializeGame();
  });
}

function createBoardMessage(message, isWin) {
  const boardContainer = document.createElement('div');
  boardContainer.id = 'board-container';
  boardContainer.classList.add('board-overlay');
  document.body.appendChild(boardContainer);

  const boardContent = document.createElement('div');
  boardContent.classList.add('board-content');
  boardContent.innerHTML = `<h1>${message}</h1>`;
  boardContainer.appendChild(boardContent);

  const closeButton = document.createElement('button');
  closeButton.id = 'close-board';
  closeButton.textContent = 'X';
  boardContent.appendChild(closeButton);

  closeButton.addEventListener('click', () => {
    boardContainer.remove();
    const particles = document.querySelectorAll('.rain-particle');
    particles.forEach(particle => particle.remove());
  });

  if (isWin) {
    createRainParticles();
  }

  const sound = new Audio(isWin ? 'win-sound.mp3' : 'loss-sound.mp3');
  sound.play();
}

function createRainParticles() {
  const colors = ['#FF5733', '#FFC300', '#DAF7A6', '#33FFCE', '#338AFF'];
  for (let i = 0; i < 100; i++) {
    const particle = document.createElement('div');
    particle.classList.add('rain-particle');
    document.body.appendChild(particle);

    particle.style.left = `${Math.random() * 100}%`;
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.width = `${Math.random() * 5 + 3}px`;
    particle.style.height = `${Math.random() * 15 + 10}px`;
    particle.style.animationDuration = `${Math.random() * 2 + 3}s`;
    particle.style.animationDelay = `${Math.random() * 2}s`;

    setTimeout(() => {
      particle.remove();
    }, 5000);
  }
}

// Music controls
playButton.addEventListener('click', () => bgMusic.play());
pauseButton.addEventListener('click', () => bgMusic.pause());
muteButton.addEventListener('click', () => {
  bgMusic.muted = !bgMusic.muted;
  muteButton.textContent = bgMusic.muted ? 'Unmute' : 'Mute';
});
volumeControl.addEventListener('input', () => bgMusic.volume = volumeControl.value);

// Restart the game
playAgainButton.addEventListener('click', initializeGame);

// Start a new game when the difficulty or timer mode changes
difficultySelector.addEventListener('change', initializeGame);
timerModeSelector.addEventListener('change', initializeGame);

// Start the game when the page loads
window.addEventListener('load', () => {
  bgMusic.volume = 0.5;
  bgMusic.play();
  initializeGame();
});

// Sidebar toggle functionality
const openSidebarBtn = document.getElementById('open-sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar');
const sidebar = document.getElementById('sidebar');

openSidebarBtn.addEventListener('click', () => {
  sidebar.style.right = '0';
});

closeSidebarBtn.addEventListener('click', () => {
  sidebar.style.right = '-300px';
});

// Add feature actions (example: toggle dark mode)
const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');
toggleDarkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Example: Add game rules popup
const showRulesBtn = document.getElementById('show-rules');
showRulesBtn.addEventListener('click', () => {
  alert('Game Rules: Match all pairs to win!');
});
