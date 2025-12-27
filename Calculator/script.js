document.addEventListener('DOMContentLoaded', () => {
    const previousOperationEl = document.getElementById('previous-operation');
    const currentResultEl = document.getElementById('current-result');
    const keypad = document.querySelector('.keypad');
    const historyListEl = document.getElementById('history-list');
    const historyToggle = document.getElementById('history-toggle');
    const themeSwitchBtn = document.getElementById('theme-switch'); 
    const body = document.body;

    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    let resetDisplay = false;
    let history = [];

    // --- Core Calculator Logic ---

    function updateDisplay() {
        // Limit display size to avoid overflow (e.g., 12 characters)
        const displayValue = currentInput.length > 12 ? parseFloat(currentInput).toPrecision(10) : currentInput;
        currentResultEl.textContent = displayValue;
        
        // Use full operation for the previous line
        previousOperationEl.textContent = previousInput + (operation ? ' ' + operation : '');
    }

    function appendNumber(key) {
        if (key === '.' && currentInput.includes('.')) return;
        
        if (currentInput === '0' || resetDisplay) {
            currentInput = key === '.' ? '0.' : key;
            resetDisplay = false;
        } else {
            currentInput += key;
        }
        updateDisplay();
    }

    function chooseOperation(op) {
        if (currentInput === '') return;
        if (previousInput !== '') {
            calculate();
        }

        operation = op;
        previousInput = currentInput;
        currentInput = '0';
        updateDisplay();
        resetDisplay = true;
    }

    function calculate() {
        let prev = parseFloat(previousInput);
        let current = parseFloat(currentInput);
        let result;

        if (isNaN(prev) || isNaN(current) || !operation) return;

        const expression = `${previousInput} ${operation} ${currentInput}`;

        switch (operation) {
            case '+':
                result = prev + current;
                break;
            case '−':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    currentInput = 'Error';
                    previousInput = '';
                    operation = null;
                    updateDisplay();
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        let finalResult = parseFloat(result.toFixed(10)).toString();

        currentInput = finalResult;
        operation = null;
        previousInput = '';
        resetDisplay = true;

        addToHistory(expression, finalResult);
        updateDisplay();
    }

    function clearAll() {
        currentInput = '0';
        previousInput = '';
        operation = null;
        resetDisplay = false;
        updateDisplay();
    }
    
    // --- Backspace Function ---
    function backspace() {
        if (currentInput === 'Error') {
            currentInput = '0';
        } else if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
            currentInput = '0';
        } else {
            currentInput = currentInput.slice(0, -1);
        }
        updateDisplay();
    }

    function toggleSign() {
        if (currentInput === '0' || currentInput === 'Error') return;
        currentInput = (parseFloat(currentInput) * -1).toString();
        updateDisplay();
    }

    function calculatePercent() {
        let value = parseFloat(currentInput);
        if (isNaN(value) || currentInput === 'Error') return;
        
        if (previousInput && operation) {
            let prevValue = parseFloat(previousInput);
            currentInput = ((prevValue * value) / 100).toString();
        } else {
            currentInput = (value / 100).toString();
        }
        updateDisplay();
    }
    
    // --- Event Listener for Keypad (Updated to handle DEL) ---
    keypad.addEventListener('click', e => {
        if (!e.target.matches('button')) return;
        
        const key = e.target.dataset.key;
        
        if (!key) return; 

        if (key >= '0' && key <= '9' || key === '.') {
            appendNumber(key);
        } else if (key === '+' || key === '-') {
            const displayOp = key === '-' ? '−' : key;
            chooseOperation(displayOp);
        } else if (key === '*') {
            chooseOperation('×');
        } else if (key === '/') {
            chooseOperation('/');
        } else if (key === '=') {
            calculate();
        } else if (key === 'C') {
            clearAll();
        } else if (key === 'DEL') { // Handler for Backspace
            backspace();
        } else if (key === '±') {
            toggleSign();
        } else if (key === '%') {
            calculatePercent();
        }
    });

    // --- History Functionality ---
    function addToHistory(expression, result) {
        history.unshift({ expression: expression, result: result });
        if (history.length > 8) {
            history.pop();
        }
        renderHistory();
    }

    function renderHistory() {
        historyListEl.innerHTML = '';
        history.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${item.expression}</span> <span>= ${item.result}</span>`;
            historyListEl.appendChild(li);
        });
    }

    historyToggle.addEventListener('click', () => {
        const isHidden = historyListEl.classList.toggle('hidden');
        const arrow = historyToggle.querySelector('.arrow');
        arrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
    });

    // --- Theme Switching Logic ---
    function updateThemeIcon(isDarkMode) {
        if (!themeSwitchBtn) return;
        if (isDarkMode) {
            themeSwitchBtn.innerHTML = '🌙 Dark Mode';
            themeSwitchBtn.setAttribute('aria-label', 'Switch to Light Mode');
        } else {
            themeSwitchBtn.innerHTML = '☀️ Light Mode';
            themeSwitchBtn.setAttribute('aria-label', 'Switch to Dark Mode');
        }
    }

    if (themeSwitchBtn) {
        themeSwitchBtn.addEventListener('click', () => {
            const isDarkMode = body.classList.toggle('dark-mode');
            localStorage.setItem('calculator-theme', isDarkMode ? 'dark' : 'light');
            updateThemeIcon(isDarkMode);
        });
    }

    // Load theme preference on startup
    const savedTheme = localStorage.getItem('calculator-theme');
    const isDarkMode = savedTheme === 'dark';
    if (isDarkMode) {
        body.classList.add('dark-mode');
    }
    updateThemeIcon(isDarkMode);

    // Initialize display
    updateDisplay();
});