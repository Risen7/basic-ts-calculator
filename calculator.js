const display = document.querySelector('#display-value');
const previousOperation = document.querySelector('#previous-operation');
const keys = document.querySelector('.keypad');
if (!display || !previousOperation || !keys) {
    throw new Error('Calculator elements are missing from the page.');
}
let currentValue = '0';
let storedValue = null;
let pendingOperation = null;
let waitingForOperand = false;
const symbols = { add: '+', subtract: '−', multiply: '×', divide: '÷' };
function render() {
    display.value = currentValue;
    previousOperation.textContent = storedValue !== null && pendingOperation
        ? `${formatNumber(storedValue)} ${symbols[pendingOperation]}`
        : '';
}
function formatNumber(value) {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(10)));
}
function inputNumber(number) {
    if (waitingForOperand || currentValue === 'Error') {
        currentValue = number;
        waitingForOperand = false;
    }
    else if (currentValue === '0')
        currentValue = number;
    else if (currentValue.length < 14)
        currentValue += number;
    render();
}
function inputDecimal() {
    if (waitingForOperand || currentValue === 'Error') {
        currentValue = '0.';
        waitingForOperand = false;
    }
    else if (!currentValue.includes('.'))
        currentValue += '.';
    render();
}
function calculate(left, right, operation) {
    if (operation === 'add')
        return left + right;
    if (operation === 'subtract')
        return left - right;
    if (operation === 'multiply')
        return left * right;
    return right === 0 ? NaN : left / right;
}
function chooseOperation(operation) {
    const inputValue = Number(currentValue);
    if (Number.isNaN(inputValue))
        return;
    if (pendingOperation && storedValue !== null && !waitingForOperand) {
        const result = calculate(storedValue, inputValue, pendingOperation);
        currentValue = Number.isFinite(result) ? formatNumber(result) : 'Error';
        storedValue = Number.isFinite(result) ? result : null;
    }
    else {
        storedValue = inputValue;
    }
    pendingOperation = operation;
    waitingForOperand = true;
    render();
}
function equals() {
    if (storedValue === null || pendingOperation === null)
        return;
    const result = calculate(storedValue, Number(currentValue), pendingOperation);
    currentValue = Number.isFinite(result) ? formatNumber(result) : 'Error';
    storedValue = null;
    pendingOperation = null;
    waitingForOperand = true;
    render();
}
function clear() {
    currentValue = '0';
    storedValue = null;
    pendingOperation = null;
    waitingForOperand = false;
    render();
}
function deleteLast() {
    if (waitingForOperand || currentValue === 'Error')
        return;
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
    render();
}
keys.addEventListener('click', (event) => {
    const target = event.target;
    if (target.dataset.number)
        inputNumber(target.dataset.number);
    if (target.dataset.operation)
        chooseOperation(target.dataset.operation);
    if (target.dataset.action === 'decimal')
        inputDecimal();
    if (target.dataset.action === 'equals')
        equals();
    if (target.dataset.action === 'clear')
        clear();
    if (target.dataset.action === 'delete')
        deleteLast();
});
document.addEventListener('keydown', (event) => {
    if (/^\d$/.test(event.key))
        inputNumber(event.key);
    else if (event.key === '.')
        inputDecimal();
    else if (event.key === 'Enter' || event.key === '=')
        equals();
    else if (event.key === 'Escape')
        clear();
    else if (event.key === 'Backspace')
        deleteLast();
    else if (event.key === '+')
        chooseOperation('add');
    else if (event.key === '-')
        chooseOperation('subtract');
    else if (event.key === '*')
        chooseOperation('multiply');
    else if (event.key === '/')
        chooseOperation('divide');
    else
        return;
    event.preventDefault();
});
render();