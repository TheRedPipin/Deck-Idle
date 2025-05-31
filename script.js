const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const cardSuits = ['hearts', 'diamonds', 'clubs', 'spades'];
const deck = [];
const drawnCards = [];
let currentDeckComposition = [];

function createDeck() {
    deck.length = 0;
    for (const suit of cardSuits) {
        for (const value of cardValues) {
            deck.push({ value, suit });
        }
    }
    shuffleDeck();
    displayDeck();
    currentDeckComposition = getCurrentDeckComposition();
}

function drawCard() {
    const deckContainer = document.getElementById('deck');
    const drawCountInput = document.getElementById('drawCount');
    let count = parseInt(drawCountInput.value, 10);
    if (isNaN(count) || count < 1) count = 1;
    if (count > 52) count = 52;

    if (deck.length === 0) {
        const composition = currentDeckComposition;
        deck.length = 0;
        drawnCards.length = 0;
        document.getElementById('drawnCards').innerHTML = '';
        refillDeckFromComposition(composition);
        shuffleDeck();
        displayDeck();
        deckContainer.classList.add('reshuffling');
        setTimeout(() => {
            deckContainer.classList.remove('reshuffling');
        }, 800);
        return;
    }

    for (let i = 0; i < count && deck.length > 0; i++) {
        const card = deck.pop();
        drawnCards.push(card);
        displayDrawnCard(card);
    }
    animateCardDraw();
    displayDeck();
}

function displayDeck() {
    const deckContainer = document.getElementById('deck');
    deckContainer.innerHTML = '';
    const backDesign = document.getElementById('cardBackDesign')?.value || 'classic';
    deck.forEach((_, i) => {
        const cardBack = document.createElement('div');
        cardBack.className = `card back ${backDesign}`;
        const rotation = (Math.random() - 0.5) * 14;
        cardBack.style.transform = `rotate(${rotation}deg) translateY(-${i * 0.5}px)`;
        deckContainer.appendChild(cardBack);
    });
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('drawCardButton').addEventListener('click', drawCard);

    document.getElementById('reshuffleButton').addEventListener('click', () => {
        const deckContainer = document.getElementById('deck');
        const composition = getCurrentDeckComposition();
        deck.length = 0;
        drawnCards.length = 0;
        document.getElementById('drawnCards').innerHTML = '';
        refillDeckFromComposition(composition);
        shuffleDeck();
        displayDeck();
        deckContainer.classList.add('reshuffling');
        setTimeout(() => {
            deckContainer.classList.remove('reshuffling');
        }, 800);
    });

    const drawCountInput = document.getElementById('drawCount');
    drawCountInput.addEventListener('blur', () => {
        let val = parseInt(drawCountInput.value, 10);
        if (isNaN(val) || val < 1) drawCountInput.value = 1;
        else if (val > 52) drawCountInput.value = 52;
    });

    const backSelect = document.getElementById('cardBackDesign');
    if (backSelect) {
        backSelect.addEventListener('change', () => {
            const deckContainer = document.getElementById('deck');
            deckContainer.classList.add('fade');
            setTimeout(() => {
                displayDeck();
                deckContainer.classList.remove('fade');
            }, 300);
        });
    }

    const editDeckButton = document.getElementById('editDeckButton');
    const deckEditorMenu = document.getElementById('deckEditorMenu');
    const deckEditorCards = document.getElementById('deckEditorCards');
    const saveDeckButton = document.getElementById('saveDeckButton');
    const closeDeckEditorButton = document.getElementById('closeDeckEditorButton');
    const setAllZeroButton = document.getElementById('setAllZeroButton');
    const resetDeckEditorButton = document.getElementById('resetDeckEditorButton');

    editDeckButton.addEventListener('click', () => {
        deckEditorMenu.style.display = 'flex';
        deckEditorCards.innerHTML = '';
        for (const suit of cardSuits) {
            const suitHeader = document.createElement('div');
            suitHeader.textContent = suit[0].toUpperCase() + suit.slice(1);
            suitHeader.className = 'deck-editor-suit-header';
            deckEditorCards.appendChild(suitHeader);

            for (const value of cardValues) {
                const count = deck.filter(c => c.value === value && c.suit === suit).length;
                const row = document.createElement('div');
                row.className = 'deck-editor-row';
                row.innerHTML = `
                    <label>${value} ${suit[0].toUpperCase()}</label>
                    <button type="button" class="decrement">−</button>
                    <input type="number" min="0" max="52" value="${count}" data-value="${value}" data-suit="${suit}">
                    <button type="button" class="increment">+</button>
                `;
                deckEditorCards.appendChild(row);

                const input = row.querySelector('input');
                row.querySelector('.increment').addEventListener('click', () => {
                    let val = parseInt(input.value, 10) || 0;
                    if (val < 52) input.value = val + 1;
                });
                row.querySelector('.decrement').addEventListener('click', () => {
                    let val = parseInt(input.value, 10) || 0;
                    if (val > 0) input.value = val - 1;
                });
            }
        }
    });

    closeDeckEditorButton.addEventListener('click', () => {
        deckEditorMenu.style.display = 'none';
    });

    saveDeckButton.addEventListener('click', () => {
        deck.length = 0;
        const inputs = deckEditorCards.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            const value = input.getAttribute('data-value');
            const suit = input.getAttribute('data-suit');
            const count = Math.max(0, parseInt(input.value, 10) || 0);
            for (let i = 0; i < count; i++) {
                deck.push({ value, suit });
            }
        });
        drawnCards.length = 0;
        document.getElementById('drawnCards').innerHTML = '';
        displayDeck();
        deckEditorMenu.style.display = 'none';
        currentDeckComposition = getCurrentDeckComposition();
    });

    setAllZeroButton.addEventListener('click', () => {
        const inputs = deckEditorCards.querySelectorAll('input[type="number"]');
        inputs.forEach(input => input.value = 0);
    });

    resetDeckEditorButton.addEventListener('click', () => {
        deckEditorCards.innerHTML = '';
        for (const suit of cardSuits) {
            const suitHeader = document.createElement('div');
            suitHeader.textContent = suit[0].toUpperCase() + suit.slice(1);
            suitHeader.className = 'deck-editor-suit-header';
            deckEditorCards.appendChild(suitHeader);

            for (const value of cardValues) {
                const compEntry = currentDeckComposition.find(
                    c => c.value === value && c.suit === suit
                );
                const count = compEntry ? compEntry.count : 0;
                const row = document.createElement('div');
                row.className = 'deck-editor-row';
                row.innerHTML = `
                    <label>${value} ${suit[0].toUpperCase()}</label>
                    <button type="button" class="decrement">−</button>
                    <input type="number" min="0" max="52" value="${count}" data-value="${value}" data-suit="${suit}">
                    <button type="button" class="increment">+</button>
                `;
                deckEditorCards.appendChild(row);

                const input = row.querySelector('input');
                row.querySelector('.increment').addEventListener('click', () => {
                    let val = parseInt(input.value, 10) || 0;
                    if (val < 52) input.value = val + 1;
                });
                row.querySelector('.decrement').addEventListener('click', () => {
                    let val = parseInt(input.value, 10) || 0;
                    if (val > 0) input.value = val - 1;
                });
            }
        }
    });

    createDeck();
});

function displayDrawnCard(card) {
    const drawnCardsContainer = document.getElementById('drawnCards');
    const deckContainer = document.getElementById('deck');
    const backDesign = document.getElementById('cardBackDesign')?.value || 'classic';

    const flipContainer = document.createElement('div');
    flipContainer.className = 'card flip-container';

    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';

    const cardBack = document.createElement('div');
    cardBack.className = `card-back card back ${backDesign}`;

    const cardFace = document.createElement('div');
    cardFace.className = `card-face card ${card.suit}`;
    const suitSymbols = {
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣',
        spades: '♠'
    };
    cardFace.innerHTML = `
        <div class="corner top">
            <span class="value">${card.value}</span>
            <span class="suit">${suitSymbols[card.suit]}</span>
        </div>
        <div class="corner bottom">
            <span class="value">${card.value}</span>
            <span class="suit">${suitSymbols[card.suit]}</span>
        </div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:2em;opacity:0.2;">
            ${suitSymbols[card.suit]}
        </div>
    `;

    cardInner.appendChild(cardBack);
    cardInner.appendChild(cardFace);
    flipContainer.appendChild(cardInner);

    const deckRect = deckContainer.getBoundingClientRect();
    const drawnRect = drawnCardsContainer.getBoundingClientRect();
    const offsetX = deckRect.left - drawnRect.left;
    const offsetY = deckRect.top - drawnRect.top;

    flipContainer.style.position = 'absolute';
    flipContainer.style.left = '0';
    flipContainer.style.top = '0';
    flipContainer.style.zIndex = 1000;

    flipContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    cardInner.style.transform = 'rotateY(0deg)';

    drawnCardsContainer.appendChild(flipContainer);

    void flipContainer.offsetWidth;

    const stackY = (drawnCards.length - 1) * -1.5;
    const finalRotation = (Math.random() - 0.5) * 14;

    flipContainer.style.transition = 'transform 0.35s cubic-bezier(.4,2,.6,1)';
    flipContainer.style.transform = `translate(80px, ${stackY - 20}px)`;
    cardInner.style.transition = 'transform 0.35s cubic-bezier(.4,2,.6,1)';
    cardInner.style.transform = 'rotateY(0deg)';

    setTimeout(() => {
        flipContainer.style.transition = 'transform 0.35s cubic-bezier(.4,2,.6,1)';
        flipContainer.style.transform = `translate(0px, ${stackY}px) rotate(${finalRotation}deg)`;
        cardInner.style.transition = 'transform 0.35s cubic-bezier(.4,2,.6,1)';
        cardInner.style.transform = 'rotateY(180deg)';
    }, 350);

    cardInner.addEventListener('transitionend', function handler(e) {
        if (e.propertyName !== 'transform') return;
        cardInner.removeEventListener('transitionend', handler);

        flipContainer.style.transition = '';
        flipContainer.style.transform = `rotate(${finalRotation}deg)`;
        flipContainer.style.top = `${stackY}px`;
        flipContainer.style.left = '0';
        flipContainer.style.zIndex = drawnCards.length;
        cardInner.style.transition = '';
        cardInner.style.transform = 'rotateY(180deg)';
    });
}

function animateCardDraw() {
    const cardDeck = document.getElementById('deck');
    cardDeck.classList.add('draw-animation');
    setTimeout(() => {
        cardDeck.classList.remove('draw-animation');
    }, 1000);
}

function getCurrentDeckComposition() {
    const composition = [];
    for (const suit of cardSuits) {
        for (const value of cardValues) {
            const count = deck.filter(c => c.value === value && c.suit === suit).length;
            if (count > 0) {
                composition.push({ value, suit, count });
            }
        }
    }
    return composition;
}

function refillDeckFromComposition(composition) {
    deck.length = 0;
    for (const entry of composition) {
        for (let i = 0; i < entry.count; i++) {
            deck.push({ value: entry.value, suit: entry.suit });
        }
    }
}