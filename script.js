document.addEventListener('DOMContentLoaded', () => {
    const startGameBtn = document.getElementById('start-game-btn');
    const gameSection = document.getElementById('game-section');
    const gameBoard = document.getElementById('game-board');
    const leftCardsColumn = document.getElementById('left-cards');
    const rightCardsColumn = document.getElementById('right-cards');
    const gameFeedback = document.getElementById('game-feedback');
    const resetGameBtn = document.getElementById('reset-game-btn');

    let matchedPairs = 0;
    let totalPairs = 0;
    let draggedItem = null;

    // Game data: { id: "unique", type: "image/text", content: "Lao_letter/word", matchId: "corresponding_id", image: "path_to_image.png" }
    const gameData = [
        { id: 'korkai', type: 'text', content: 'ກ', matchId: 'korkai-word' },
        { id: 'korkai-word', type: 'word', content: 'ໄກ່' },
        { id: 'korkai-img', type: 'image', image: 'https://via.placeholder.com/80x80?text=ໄກ່', matchId: 'korkai-word' },

        { id: 'khorkhai', type: 'text', content: 'ຂ', matchId: 'khorkhai-word' },
        { id: 'khorkhai-word', type: 'word', content: 'ໄຂ່' },
        { id: 'khorkhai-img', type: 'image', image: 'https://via.placeholder.com/80x80?text=ໄຂ່', matchId: 'khorkhai-word' },
        
        { id: 'khorkhwai', type: 'text', content: 'ຄ', matchId: 'khorkhwai-word' },
        { id: 'khorkhwai-word', type: 'word', content: 'ຄວາຍ' },
        { id: 'khorkhwai-img', type: 'image', image: 'https://via.placeholder.com/80x80?text=ຄວາຍ', matchId: 'khorkhwai-word' },
        
        { id: 'ngongoo', type: 'text', content: 'ງ', matchId: 'ngongoo-word' },
        { id: 'ngongoo-word', type: 'word', content: 'ງູ' },
        { id: 'ngongoo-img', type: 'image', image: 'https://via.placeholder.com/80x80?text=ງູ', matchId: 'ngongoo-word' },

        { id: 'chorsang', type: 'text', content: 'ຊ', matchId: 'chorsang-word' },
        { id: 'chorsang-word', type: 'word', content: 'ຊ້າງ' },
        { id: 'chorsang-img', type: 'image', image: 'https://via.placeholder.com/80x80?text=ຊ້າງ', matchId: 'chorsang-word' },

        // ເພີ່ມຄຳສັບ ແລະ ຮູບພາບອື່ນໆທີ່ນີ້:
        // { id: 'dordek', type: 'text', content: 'ດ', matchId: 'dordek-word' },
        // { id: 'dordek-word', type: 'word', content: 'ເດັກ' },
        // { id: 'dordek-img', type: 'image', image: 'https://via.placeholder.com/80x80?text=ເດັກ', matchId: 'dordek-word' },
    ];

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createCardElement(item) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('draggable', 'true');
        card.dataset.id = item.id;
        card.dataset.matchId = item.matchId || item.id; // If it's a word, its matchId is itself

        if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.content;
            card.appendChild(img);
        }
        const p = document.createElement('p');
        p.textContent = item.content;
        card.appendChild(p);

        card.addEventListener('dragstart', handleDragStart);
        return card;
    }

    function initializeGame() {
        leftCardsColumn.innerHTML = '';
        rightCardsColumn.innerHTML = '';
        gameFeedback.textContent = '';
        matchedPairs = 0;
        totalPairs = 0;
        resetGameBtn.style.display = 'none';

        const sourceItems = [];
        const targetItems = [];

        // Filter and prepare items for columns
        gameData.forEach(item => {
            if (item.type === 'text' || item.type === 'image') {
                sourceItems.push(item);
                totalPairs++; // Count each source item as a potential pair
            } else if (item.type === 'word') {
                targetItems.push(item);
            }
        });
        
        shuffleArray(sourceItems);
        shuffleArray(targetItems); // Shuffle words too, so they are not in order

        sourceItems.forEach(item => {
            leftCardsColumn.appendChild(createCardElement(item));
        });

        targetItems.forEach(item => {
            rightCardsColumn.appendChild(createCardElement(item));
        });

        // Add dragover and drop listeners to the columns
        leftCardsColumn.addEventListener('dragover', handleDragOver);
        leftCardsColumn.addEventListener('drop', handleDrop);
        rightCardsColumn.addEventListener('dragover', handleDragOver);
        rightCardsColumn.addEventListener('drop', handleDrop);
    }

    function handleDragStart(e) {
        draggedItem = e.target;
        e.dataTransfer.setData('text/plain', draggedItem.dataset.id);
        draggedItem.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault(); // Allow dropping
    }

    function handleDrop(e) {
        e.preventDefault();
        const droppedOn = e.target.closest('.card') || e.target.closest('.card-column');

        if (!draggedItem || !droppedOn || draggedItem === droppedOn) {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
            return;
        }

        const draggedId = draggedItem.dataset.id;
        const draggedMatchId = draggedItem.dataset.matchId;
        const droppedOnId = droppedOn.dataset.id;
        const droppedOnMatchId = droppedOn.dataset.matchId;

        // Determine if they are a match
        const isMatch = (draggedMatchId === droppedOnId) || (draggedId === droppedOnMatchId);

        if (isMatch) {
            gameFeedback.textContent = 'ຖືກຕ້ອງ!';
            gameFeedback.className = 'correct';

            // Mark both as matched and remove draggable
            draggedItem.classList.add('matched');
            droppedOn.classList.add('matched');
            draggedItem.setAttribute('draggable', 'false');
            droppedOn.setAttribute('draggable', 'false');

            // Remove event listeners for matched cards
            draggedItem.removeEventListener('dragstart', handleDragStart);
            droppedOn.removeEventListener('dragstart', handleDragStart);

            // Hide them or move them off the board
            setTimeout(() => {
                draggedItem.style.display = 'none';
                droppedOn.style.display = 'none';
            }, 500); // Hide after a short delay

            matchedPairs++;
            if (matchedPairs === totalPairs) {
                gameFeedback.textContent = 'ຍິນດີດ້ວຍ! ທ່ານຈັບຄູ່ຖືກຕ້ອງທຸກຄູ່ແລ້ວ!';
                gameFeedback.classList.add('correct');
                resetGameBtn.style.display = 'block';
            }
        } else {
            gameFeedback.textContent = 'ຜິດ! ລອງໃໝ່ອີກຄັ້ງ.';
            gameFeedback.className = 'incorrect';
        }

        draggedItem.classList.remove('dragging');
        draggedItem = null;
    }

    // Event Listeners for buttons
    startGameBtn.addEventListener('click', () => {
        document.getElementById('home').style.display = 'none';
        gameSection.style.display = 'flex'; // Use flex to center content
        initializeGame();
    });

    resetGameBtn.addEventListener('click', () => {
        initializeGame();
    });

    // Initial setup on page load (optional, but good for refresh)
    // initializeGame(); // Don't auto-start, wait for button click
});
