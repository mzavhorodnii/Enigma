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
    const keyboardContainer = document.getElementById('keyboard');
    const lightboardContainer = document.getElementById('lightboard');
    keyboardContainer.innerHTML = '';
    lightboardContainer.innerHTML = '';

    ALPHABET.split('').forEach(letter => {
        const light = document.createElement('div');
        light.className = 'light';
        light.textContent = letter;
        light.id = `light-${letter}`;
        lightboardContainer.appendChild(light);

        const key = document.createElement('div');
        key.className = 'key';
        key.textContent = letter;
        key.onclick = () => {
            document.getElementById('inputText').value += letter;
            pressKey(letter);
            processText();
        };
        keyboardContainer.appendChild(key);
    });

    document.getElementById('plugboardInput').addEventListener('input', updatePlugboardAndSettings);
    document.getElementById('inputText').addEventListener('input', processText);

    ['leftRotor', 'middleRotor', 'rightRotor', 'reflectorSelect'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateSettings);
    });

    ['leftPosition', 'middlePosition', 'rightPosition'].forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
            let value = e.target.value.toUpperCase();
            if (!value.match(/^[A-Z]$/)) {
                value = e.target.value.slice(0, -1).toUpperCase();
            }
            e.target.value = value;
            if (value.match(/^[A-Z]$/)) {
                 updateInitialPositions();
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        const key = e.key.toUpperCase();
        const activeElement = document.activeElement;
        const inputFields = ['plugboardInput', 'leftPosition', 'middlePosition', 'rightPosition'];

        if (activeElement && inputFields.includes(activeElement.id)) {
            return;
        }

        if (ALPHABET.includes(key)) {
            e.preventDefault();
            const inputTextArea = document.getElementById('inputText');
            inputTextArea.value += key;
            pressKey(key);
            processText();
        }
    });

    updateInitialPositions();
}

function updatePlugboardAndSettings() {
    const input = document.getElementById('plugboardInput').value.toUpperCase();
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

    document.getElementById('plugboardInput').value = validPairs.join(' ');
    const display = document.getElementById('plugboardDisplay');
    display.textContent = validPairs.length > 0 ? `Соединения: ${validPairs.join(' ')}` : 'Соединения: нет';

    updateSettings();
}

function updateInitialPositions() {
    const leftPos = document.getElementById('leftPosition').value || 'A';
    const middlePos = document.getElementById('middlePosition').value || 'A';
    const rightPos = document.getElementById('rightPosition').value || 'A';

    initialPositions = {
        left: ALPHABET.indexOf(leftPos),
        middle: ALPHABET.indexOf(middlePos),
        right: ALPHABET.indexOf(rightPos)
    };
    updateSettings();
}

function updateSettings() {
    const settings = {
        rotors: `${document.getElementById('leftRotor').value} ${document.getElementById('middleRotor').value} ${document.getElementById('rightRotor').value}`,
        positions: `${document.getElementById('leftPosition').value} ${document.getElementById('middlePosition').value} ${document.getElementById('rightPosition').value}`,
        reflector: document.getElementById('reflectorSelect').value,
        plugs: document.getElementById('plugboardInput').value.trim() || 'нет'
    };

    document.getElementById('settingsDisplay').textContent =
        `Роторы: ${settings.rotors} | Позиции: ${settings.positions} | Рефлектор: ${settings.reflector} | Коммутации: ${settings.plugs}`;

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
function pressKey(letter) {
    document.querySelectorAll('.key').forEach(k => k.classList.remove('pressed'));
    const keyEl = Array.from(document.querySelectorAll('.key')).find(k => k.textContent === letter);
    if(keyEl) keyEl.classList.add('pressed');
    
    if (lightTimeout) clearTimeout(lightTimeout);
    document.querySelectorAll('.light').forEach(light => light.classList.remove('lit'));

    setTimeout(() => {
        if(keyEl) keyEl.classList.remove('pressed');
    }, 200);
}

function processText() {
    const inputText = document.getElementById('inputText').value.toUpperCase();
    const outputTextarea = document.getElementById('outputText');
    
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
    
    outputTextarea.value = outputText;

    if (lastEncryptedChar) {
        const lightEl = document.getElementById(`light-${lastEncryptedChar}`);
        if(lightEl) {
            lightEl.classList.add('lit');
            lightTimeout = setTimeout(() => {
                lightEl.classList.remove('lit');
            }, 500);
        }
    }

    document.getElementById('rightPosition').value = ALPHABET[currentRotorPositions.right];
    document.getElementById('middlePosition').value = ALPHABET[currentRotorPositions.middle];
    document.getElementById('leftPosition').value = ALPHABET[currentRotorPositions.left];
}

function swapIO() {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    
    const temp = inputText.value;
    inputText.value = outputText.value;
    outputText.value = temp;
    
    processText();
}

function clearAll() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').value = '';
    document.getElementById('plugboardInput').value = '';

    document.getElementById('leftRotor').value = 'III';
    document.getElementById('middleRotor').value = 'II';
    document.getElementById('rightRotor').value = 'I';
    document.getElementById('reflectorSelect').value = 'B';

    document.getElementById('leftPosition').value = 'A';
    document.getElementById('middlePosition').value = 'A';
    document.getElementById('rightPosition').value = 'A';
    
    updatePlugboardAndSettings();
    updateInitialPositions();
}

function exportSettings() {
    const settings = {
        leftRotor: document.getElementById('leftRotor').value,
        middleRotor: document.getElementById('middleRotor').value,
        rightRotor: document.getElementById('rightRotor').value,
        reflector: document.getElementById('reflectorSelect').value,
        leftPosition: document.getElementById('leftPosition').value,
        middlePosition: document.getElementById('middlePosition').value,
        rightPosition: document.getElementById('rightPosition').value,
        plugboard: document.getElementById('plugboardInput').value
    };

    const settingsJson = JSON.stringify(settings, null, 2);
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enigma-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
            try {
                const settings = JSON.parse(event.target.result);
                document.getElementById('leftRotor').value = settings.leftRotor || 'III';
                document.getElementById('middleRotor').value = settings.middleRotor || 'II';
                document.getElementById('rightRotor').value = settings.rightRotor || 'I';
                document.getElementById('reflectorSelect').value = settings.reflector || 'B';
                document.getElementById('leftPosition').value = settings.leftPosition || 'A';
                document.getElementById('middlePosition').value = settings.middlePosition || 'A';
                document.getElementById('rightPosition').value = settings.rightPosition || 'A';
                document.getElementById('plugboardInput').value = settings.plugboard || '';

                updatePlugboardAndSettings();
                updateInitialPositions();
            } catch (error) {
                console.error("Ошибка при чтении файла настроек:", error);
                alert("Не удалось прочитать файл настроек. Убедитесь, что это корректный JSON файл.");
            }
        };
        reader.readAsText(file);
    };
    input.click();
}