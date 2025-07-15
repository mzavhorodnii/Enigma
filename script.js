const ROTORS = {
    'I':    { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', turnover: 'Q' },
    'II':   { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', turnover: 'E' },
    'III':  { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', turnover: 'V' },
    'IV':   { wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', turnover: 'J' },
    'V':    { wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK', turnover: 'Z' }
};

const REFLECTORS = {
    B: 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
    C: 'FVPJIAOYEDRZXWGCTKUQSBNMHL'
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let plugboardMap = {};
let currentRotorPositions = { left: 0, middle: 0, right: 0 };
let initialPositions = { left: 0, middle: 0, right: 0 };

document.addEventListener('DOMContentLoaded', initializeInterface);

function initializeInterface() {
    const lightboardContainer = document.getElementById('lightboard');
    lightboardContainer.innerHTML = '';

    ALPHABET.split('').forEach(letter => {
        const light = document.createElement('div');
        light.className = 'light';
        light.textContent = letter;
        light.id = `light-${letter}`;
        lightboardContainer.appendChild(light);
    });

    const plugboardInput = document.getElementById('plugboardInput');
    if (plugboardInput) {
        plugboardInput.addEventListener('input', updatePlugboardAndSettings);
        plugboardInput.addEventListener('keydown', handlePlugboardKeydown);
    }

    const inputText = document.getElementById('inputText');
    if (inputText) {
        inputText.addEventListener('input', processText);
    }

    ['leftRotor', 'middleRotor', 'rightRotor', 'reflectorSelect'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateSettings);
        }
    });

    ['leftPosition', 'middlePosition', 'rightPosition'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', (e) => {
                let value = e.target.value ? e.target.value.toUpperCase() : '';
                if (value && !value.match(/^[A-Z]$/)) {
                    value = value.slice(0, -1);
                }
                e.target.value = value;
                if (value.match(/^[A-Z]$/)) {
                    updateInitialPositions();
                }
            });
        }
    });

    document.addEventListener('keydown', (e) => {
        const key = e.key ? e.key.toUpperCase() : '';
        const activeElement = document.activeElement;
        
        const inputFields = ['plugboardInput', 'leftPosition', 'middlePosition', 'rightPosition', 'inputText', 'outputText'];
        const textareas = ['inputText', 'outputText'];
        
        if (activeElement && (
            inputFields.includes(activeElement.id) || 
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.tagName === 'SELECT'
        )) {
            return; 
        }

        if (ALPHABET.includes(key)) {
            e.preventDefault();
            const inputTextArea = document.getElementById('inputText');
            if (inputTextArea) {
                inputTextArea.value += key;
                processText();
            }
        }
    });

    updateInitialPositions();
    updateSettings();
}

function handlePlugboardKeydown(e) {
    const key = e.key.toUpperCase();
    
    if (key.length === 1 && !ALPHABET.includes(key) && key !== ' ') {
        e.preventDefault();
        return;
    }
    
    const allowedKeys = ['BACKSPACE', 'DELETE', 'ARROWLEFT', 'ARROWRIGHT', 'HOME', 'END', 'TAB'];
    if (!ALPHABET.includes(key) && key !== ' ' && !allowedKeys.includes(key)) {
        e.preventDefault();
    }
}

function updatePlugboardAndSettings() {
    const plugboardInput = document.getElementById('plugboardInput');
    if (!plugboardInput) return;

    let input = plugboardInput.value.toUpperCase().replace(/[^A-Z ]/g, '');
    
    plugboardInput.value = input;
    
    const pairs = input.split(' ').filter(pair => pair.length === 2 && /^[A-Z]{2}$/.test(pair));

    plugboardMap = {};
    const usedLetters = new Set();
    const validPairs = [];

    for (const pair of pairs) {
        const [a, b] = pair;
        if (a !== b && !usedLetters.has(a) && !usedLetters.has(b)) {
            plugboardMap[a] = b;
            plugboardMap[b] = a;
            usedLetters.add(a);
            usedLetters.add(b);
            validPairs.push(pair);
        }
    }

    plugboardInput.value = validPairs.join(' ');
    
    const display = document.getElementById('plugboardDisplay');
    if (display) {
        const statusIndicator = validPairs.length > 0 ? 
            '<span class="status-indicator" style="background: #00ff00;"></span>' : 
            '<span class="status-indicator"></span>';
        display.innerHTML = `${statusIndicator}Соединения: ${validPairs.length > 0 ? validPairs.join(' ') : '...'}`;
    }

    updateSettings();
}

function updateInitialPositions() {
    const leftPosElement = document.getElementById('leftPosition');
    const middlePosElement = document.getElementById('middlePosition');
    const rightPosElement = document.getElementById('rightPosition');

    const leftPos = leftPosElement ? leftPosElement.value || 'A' : 'A';
    const middlePos = middlePosElement ? middlePosElement.value || 'A' : 'A';
    const rightPos = rightPosElement ? rightPosElement.value || 'A' : 'A';

    initialPositions = {
        left: ALPHABET.indexOf(leftPos),
        middle: ALPHABET.indexOf(middlePos),
        right: ALPHABET.indexOf(rightPos)
    };
    updateSettings();
}

function updateSettings() {
    const leftRotor = document.getElementById('leftRotor');
    const middleRotor = document.getElementById('middleRotor');
    const rightRotor = document.getElementById('rightRotor');
    const reflectorSelect = document.getElementById('reflectorSelect');
    const leftPosition = document.getElementById('leftPosition');
    const middlePosition = document.getElementById('middlePosition');
    const rightPosition = document.getElementById('rightPosition');
    const plugboardInput = document.getElementById('plugboardInput');

    if (!leftRotor || !middleRotor || !rightRotor || !reflectorSelect || 
        !leftPosition || !middlePosition || !rightPosition || !plugboardInput) {
        return;
    }

    const settings = {
        rotors: `${leftRotor.value} ${middleRotor.value} ${rightRotor.value}`,
        positions: `${leftPosition.value} ${middlePosition.value} ${rightPosition.value}`,
        reflector: reflectorSelect.value,
        plugs: plugboardInput.value.trim() || '...'
    };

    const settingsDisplay = document.getElementById('settingsDisplay');
    if (settingsDisplay) {
        settingsDisplay.innerHTML = `
            <div class="settings-line">
                <span class="settings-label">Роторы:</span>
                <span class="settings-value">${settings.rotors}</span>
            </div>
            <div class="settings-line">
                <span class="settings-label">Позиция:</span>
                <span class="settings-value">${settings.positions}</span>
            </div>
            <div class="settings-line">
                <span class="settings-label">Рефлектор:</span>
                <span class="settings-value">${settings.reflector}</span>
            </div>
            <div class="settings-line">
                <span class="settings-label">Соединение:</span>
                <span class="settings-value">${settings.plugs}</span>
            </div>
        `;
    }

    processText();
}

function stepRotors() {
    const rightRotorType = document.getElementById('rightRotor').value;
    const middleRotorType = document.getElementById('middleRotor').value;

    const rightAtTurnover = ALPHABET[currentRotorPositions.right] === ROTORS[rightRotorType].turnover;
    
    if (ALPHABET[currentRotorPositions.middle] === ROTORS[middleRotorType].turnover) {
        currentRotorPositions.left = (currentRotorPositions.left + 1) % 26;
        currentRotorPositions.middle = (currentRotorPositions.middle + 1) % 26;
    }
    
    if (rightAtTurnover) {
        currentRotorPositions.middle = (currentRotorPositions.middle + 1) % 26;
    }

    currentRotorPositions.right = (currentRotorPositions.right + 1) % 26;
}

function passThroughRotor(letter, rotorType, position, reverse) {
    const rotor = ROTORS[rotorType];
    const letterIndex = ALPHABET.indexOf(letter);

    if (reverse) {
        const entryIndex = (letterIndex + position) % 26;
        const exitIndex = rotor.wiring.indexOf(ALPHABET[entryIndex]);
        return ALPHABET[(exitIndex - position + 26) % 26];
    } else {
        const entryIndex = (letterIndex + position) % 26;
        const exitChar = rotor.wiring[entryIndex];
        return ALPHABET[(ALPHABET.indexOf(exitChar) - position + 26) % 26];
    }
}

function encryptLetter(char) {
    if (!ALPHABET.includes(char)) return char;

    stepRotors();
    let currentLetter = plugboardMap[char] || char;

    const rightRotor = document.getElementById('rightRotor').value;
    const middleRotor = document.getElementById('middleRotor').value;
    const leftRotor = document.getElementById('leftRotor').value;
    
    currentLetter = passThroughRotor(currentLetter, rightRotor, currentRotorPositions.right, false);
    currentLetter = passThroughRotor(currentLetter, middleRotor, currentRotorPositions.middle, false);
    currentLetter = passThroughRotor(currentLetter, leftRotor, currentRotorPositions.left, false);

    const reflector = document.getElementById('reflectorSelect').value;
    currentLetter = REFLECTORS[reflector][ALPHABET.indexOf(currentLetter)];

    currentLetter = passThroughRotor(currentLetter, leftRotor, currentRotorPositions.left, true);
    currentLetter = passThroughRotor(currentLetter, middleRotor, currentRotorPositions.middle, true);
    currentLetter = passThroughRotor(currentLetter, rightRotor, currentRotorPositions.right, true);

    currentLetter = plugboardMap[currentLetter] || currentLetter;
    return currentLetter;
}

let lightTimeout;

function processText() {
    const inputTextElement = document.getElementById('inputText');
    const outputTextElement = document.getElementById('outputText');
    const rightPositionElement = document.getElementById('rightPosition');
    const middlePositionElement = document.getElementById('middlePosition');
    const leftPositionElement = document.getElementById('leftPosition');
    
    if (!inputTextElement || !outputTextElement) return;

    const inputText = inputTextElement.value.toUpperCase();
    
    currentRotorPositions = { ...initialPositions };

    let outputText = '';
    let lastEncryptedChar = '';
    for (const char of inputText) {
        const encrypted = encryptLetter(char);
        outputText += encrypted;
        if(ALPHABET.includes(encrypted)) {
            lastEncryptedChar = encrypted;
        }
    }
    
    outputTextElement.value = outputText;

    if (rightPositionElement) {
        rightPositionElement.value = ALPHABET[currentRotorPositions.right];
    }
    if (middlePositionElement) {
        middlePositionElement.value = ALPHABET[currentRotorPositions.middle];
    }
    if (leftPositionElement) {
        leftPositionElement.value = ALPHABET[currentRotorPositions.left];
    }

    if (lightTimeout) clearTimeout(lightTimeout);
    document.querySelectorAll('.light').forEach(light => light.classList.remove('lit'));

    if (lastEncryptedChar) {
        const lightEl = document.getElementById(`light-${lastEncryptedChar}`);
        if(lightEl) {
            lightEl.classList.add('lit');
            lightTimeout = setTimeout(() => {
                lightEl.classList.remove('lit');
            }, 800);
        }
    }
}

function swapIO() {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    
    if (!inputText || !outputText) return;
    
    const temp = inputText.value;
    inputText.value = outputText.value;
    outputText.value = temp;
    
    processText();
}

function clearAll() {
    const elements = {
        inputText: document.getElementById('inputText'),
        outputText: document.getElementById('outputText'),
        plugboardInput: document.getElementById('plugboardInput'),
        leftRotor: document.getElementById('leftRotor'),
        middleRotor: document.getElementById('middleRotor'),
        rightRotor: document.getElementById('rightRotor'),
        reflectorSelect: document.getElementById('reflectorSelect'),
        leftPosition: document.getElementById('leftPosition'),
        middlePosition: document.getElementById('middlePosition'),
        rightPosition: document.getElementById('rightPosition')
    };

    if (elements.inputText) elements.inputText.value = '';
    if (elements.outputText) elements.outputText.value = '';
    if (elements.plugboardInput) elements.plugboardInput.value = '';

    if (elements.leftRotor) elements.leftRotor.value = 'III';
    if (elements.middleRotor) elements.middleRotor.value = 'II';
    if (elements.rightRotor) elements.rightRotor.value = 'I';
    if (elements.reflectorSelect) elements.reflectorSelect.value = 'B';

    if (elements.leftPosition) elements.leftPosition.value = 'A';
    if (elements.middlePosition) elements.middlePosition.value = 'A';
    if (elements.rightPosition) elements.rightPosition.value = 'A';
    
    updatePlugboardAndSettings();
    updateInitialPositions();
}


document.addEventListener('DOMContentLoaded', () => {
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
    
    initializeInterface();
});