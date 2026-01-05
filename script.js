// Initialize grids
const inputSize = 25;
const kernelSize = 3;
const outputSize = inputSize - kernelSize + 1; // 23x23

let inputGrid = Array(inputSize).fill(null).map(() => Array(inputSize).fill(0));
let kernelGrid = Array(kernelSize).fill(null).map(() => Array(kernelSize).fill(0));
let outputGrid = Array(outputSize).fill(null).map(() => Array(outputSize).fill(0));

// Initialize kernel with some default values for demonstration (edge detection)
kernelGrid = [
    [-0.1, -0.1, -0.1],
    [-0.1,  0.8, -0.1],
    [-0.1, -0.1, -0.1]
];

// Generate shape patterns (25×25) - Decimal values 0-1 for realistic anti-aliased look
// Shapes are centered with padding from borders (4 pixels padding)
function generateShapePattern(shapeType) {
    const size = 25;
    const center = 12;
    const padding = 4;
    const pattern = Array(size).fill(null).map(() => Array(size).fill(0));
    
    if (shapeType === 'circle') {
        const radius = 7;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const dx = i - center;
                const dy = j - center;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < radius - 0.5) {
                    pattern[i][j] = 1;
                } else if (dist < radius + 0.5) {
                    pattern[i][j] = Math.max(0, 1 - (dist - radius + 0.5));
                }
            }
        }
    } else if (shapeType === 'square') {
        const side = 17;
        for (let i = padding; i < padding + side; i++) {
            for (let j = padding; j < padding + side; j++) {
                const distToEdge = Math.min(
                    i - padding,
                    padding + side - 1 - i,
                    j - padding,
                    padding + side - 1 - j
                );
                if (distToEdge > 1) {
                    pattern[i][j] = 1;
                } else if (distToEdge >= 0) {
                    pattern[i][j] = distToEdge;
                }
            }
        }
    } else if (shapeType === 'triangle') {
        const height = 15;
        for (let i = padding; i < padding + height; i++) {
            for (let j = 0; j < size; j++) {
                const y = i - padding;
                const x = j - center;
                const halfWidth = (height - y) / 2;
                if (Math.abs(x) < halfWidth - 0.5) {
                    pattern[i][j] = 1;
                } else if (Math.abs(x) < halfWidth + 0.5) {
                    pattern[i][j] = Math.max(0, 1 - (Math.abs(x) - halfWidth + 0.5));
                }
            }
        }
    } else if (shapeType === 'diamond') {
        const radius = 7;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const dx = Math.abs(i - center);
                const dy = Math.abs(j - center);
                const dist = dx + dy;
                if (dist < radius - 0.5) {
                    pattern[i][j] = 1;
                } else if (dist < radius + 0.5) {
                    pattern[i][j] = Math.max(0, 1 - (dist - radius + 0.5));
                }
            }
        }
    } else if (shapeType === 'cross') {
        const thickness = 3;
        const length = 15;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const dx = Math.abs(i - center);
                const dy = Math.abs(j - center);
                if (dy < thickness && dx < length / 2) {
                    const dist = Math.min(dy, length / 2 - dx);
                    pattern[i][j] = dist > 0.5 ? 1 : dist * 2;
                } else if (dx < thickness && dy < length / 2) {
                    const dist = Math.min(dx, length / 2 - dy);
                    pattern[i][j] = dist > 0.5 ? 1 : dist * 2;
                }
            }
        }
    } else if (shapeType === 'star') {
        const outerRadius = 8;
        const innerRadius = 3;
        const points = 5;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const dx = i - center;
                const dy = j - center;
                const angle = Math.atan2(dy, dx);
                const dist = Math.sqrt(dx * dx + dy * dy);
                const normalizedAngle = (angle + Math.PI) / (2 * Math.PI / points);
                const pointIndex = Math.floor(normalizedAngle);
                const localAngle = (normalizedAngle - pointIndex) * (2 * Math.PI / points);
                const radius = pointIndex % 2 === 0 ? outerRadius : innerRadius;
                const nextRadius = pointIndex % 2 === 0 ? innerRadius : outerRadius;
                const currentRadius = radius + (nextRadius - radius) * (localAngle / (2 * Math.PI / points));
                if (dist < currentRadius - 0.5) {
                    pattern[i][j] = 1;
                } else if (dist < currentRadius + 0.5) {
                    pattern[i][j] = Math.max(0, 1 - (dist - currentRadius + 0.5));
                }
            }
        }
    }
    return pattern;
}

const shapePatterns = {
    circle: generateShapePattern('circle'),
    square: generateShapePattern('square'),
    triangle: generateShapePattern('triangle'),
    diamond: generateShapePattern('diamond'),
    cross: generateShapePattern('cross'),
    star: generateShapePattern('star')
};

// Load shape pattern into input grid
function loadShapePattern(shape) {
    const pattern = shapePatterns[shape];
    if (pattern) {
        for (let i = 0; i < inputSize; i++) {
            for (let j = 0; j < inputSize; j++) {
                inputGrid[i][j] = pattern[i][j];
            }
        }
        updateInputGrid();
        performConvolution();
    }
}

// Create input grid
function createInputGrid() {
    const grid = document.getElementById('input-grid');
    grid.innerHTML = '';
    
    for (let i = 0; i < inputSize; i++) {
        for (let j = 0; j < inputSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell input-cell editable';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = inputGrid[i][j].toFixed(2);
            cell.appendChild(tooltip);
            
            // Make editable
            cell.addEventListener('click', () => {
                const newValue = prompt(`Enter value (0-1) for position [${i}, ${j}]:`, inputGrid[i][j]);
                if (newValue !== null) {
                    const val = parseFloat(newValue);
                    if (!isNaN(val) && val >= 0 && val <= 1) {
                        inputGrid[i][j] = val;
                        updateInputGrid();
                        performConvolution();
                    } else {
                        alert('Please enter a number between 0 and 1');
                    }
                }
            });
            
            grid.appendChild(cell);
        }
    }
}

// Update input grid display
function updateInputGrid() {
    const cells = document.querySelectorAll('#input-grid .cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / inputSize);
        const col = index % inputSize;
        const value = inputGrid[row][col];
        
        // Update tooltip with value
        const tooltip = cell.querySelector('.tooltip');
        if (tooltip) {
            tooltip.textContent = value.toFixed(2);
        }
        
        // Visual intensity based on value (grayscale)
        const intensity = Math.round(value * 255);
        cell.style.setProperty('background-color', `rgb(${intensity}, ${intensity}, ${intensity})`, 'important');
    });
}

// Create kernel grid
function createKernelGrid() {
    const grid = document.getElementById('kernel-grid');
    grid.innerHTML = '';
    
    for (let i = 0; i < kernelSize; i++) {
        for (let j = 0; j < kernelSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell kernel-cell editable';
            cell.textContent = kernelGrid[i][j].toFixed(2);
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            // Make editable with direct input
            cell.addEventListener('click', () => {
                const newValue = prompt(`Enter kernel value for position [${i}, ${j}]:`, kernelGrid[i][j]);
                if (newValue !== null) {
                    const val = parseFloat(newValue);
                    if (!isNaN(val)) {
                        kernelGrid[i][j] = val;
                        updateKernelGrid();
                        performConvolution();
                    } else {
                        alert('Please enter a valid number');
                    }
                }
            });
            
            grid.appendChild(cell);
        }
    }
}

// Update kernel grid display
function updateKernelGrid() {
    const cells = document.querySelectorAll('#kernel-grid .cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / kernelSize);
        const col = index % kernelSize;
        const value = kernelGrid[row][col];
        cell.textContent = value.toFixed(2);
        
        // Color coding for dark theme: positive (cyan), negative (red), zero (gray)
        if (value > 0) {
            const intensity = Math.min(255, Math.round(value * 200));
            // Cyan tint for positive values
            cell.style.backgroundColor = `rgb(${Math.max(0, 100 - intensity)}, ${Math.max(0, 200 - intensity)}, 255)`;
            cell.style.color = 'hsl(210 40% 98%)';
        } else if (value < 0) {
            const intensity = Math.min(255, Math.round(Math.abs(value) * 200));
            // Red tint for negative values
            cell.style.backgroundColor = `rgb(255, ${Math.max(0, 100 - intensity)}, ${Math.max(0, 100 - intensity)})`;
            cell.style.color = 'hsl(210 40% 98%)';
        } else {
            cell.style.backgroundColor = 'hsl(217.2 32.6% 17.5%)';
            cell.style.color = 'hsl(215 20.2% 65.1%)';
        }
    });
}

// Create output grid
function createOutputGrid() {
    const grid = document.getElementById('output-grid');
    grid.innerHTML = '';
    
    for (let i = 0; i < outputSize; i++) {
        for (let j = 0; j < outputSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell output-cell';
            
            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = outputGrid[i][j].toFixed(2);
            cell.appendChild(tooltip);
            
            grid.appendChild(cell);
        }
    }
}

// Update output grid display
function updateOutputGrid() {
    const cells = document.querySelectorAll('#output-grid .cell');
    let minVal = Infinity;
    let maxVal = -Infinity;
    
    // Find min and max for normalization
    outputGrid.forEach(row => {
        row.forEach(val => {
            minVal = Math.min(minVal, val);
            maxVal = Math.max(maxVal, val);
        });
    });
    
    // Find maximum absolute value for normalization
    const maxAbs = Math.max(Math.abs(minVal), Math.abs(maxVal));
    
    cells.forEach((cell, index) => {
        const row = Math.floor(index / outputSize);
        const col = index % outputSize;
        const value = outputGrid[row][col];
        
        // Update tooltip with value
        const tooltip = cell.querySelector('.tooltip');
        if (tooltip) {
            tooltip.textContent = value.toFixed(2);
        }
        
        // Color scheme: zero = black, negative = red (dark maroon to vibrant red), positive = blue (dark teal to bright cyan)
        let r, g, b;
        
        // Much smaller threshold for zero detection
        if (Math.abs(value) < 0.0001) {
            // Zero or very close to zero: black
            r = 0;
            g = 0;
            b = 0;
        } else if (value < 0) {
            // Negative: red gradient
            // Numbers closer to zero = dark maroon-red, more negative = bright vibrant red
            const intensity = maxAbs > 0 ? Math.abs(value) / maxAbs : 0;
            
            // Reverse the gradient: low intensity (close to zero) = dark, high intensity (very negative) = bright
            // Dark maroon-red (rgb(100, 0, 0)) for values close to zero
            // Bright vibrant red (rgb(255, 0, 0)) for very negative values
            r = Math.round(100 + intensity * 155); // 100 to 255
            g = 0;
            b = 0;
        } else {
            // Positive: blue/cyan gradient
            // Numbers closer to zero = dark teal-blue, more positive = bright cyan-blue
            const intensity = maxAbs > 0 ? value / maxAbs : 0;
            
            // Reverse the gradient: low intensity (close to zero) = dark, high intensity (very positive) = bright
            // Dark teal-blue (rgb(0, 100, 100)) for values close to zero
            // Bright cyan-blue (rgb(0, 255, 255)) for very positive values
            r = 0;
            g = Math.round(100 + intensity * 155); // 100 to 255
            b = Math.round(100 + intensity * 155); // 100 to 255
        }
        
        cell.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    });
    
    // Update range display
    document.getElementById('output-range').textContent = 
        `[${minVal.toFixed(2)}, ${maxVal.toFixed(2)}]`;
}

// Perform convolution
function performConvolution() {
    for (let i = 0; i < outputSize; i++) {
        for (let j = 0; j < outputSize; j++) {
            let sum = 0;
            
            // Apply kernel at position (i, j)
            for (let ki = 0; ki < kernelSize; ki++) {
                for (let kj = 0; kj < kernelSize; kj++) {
                    sum += inputGrid[i + ki][j + kj] * kernelGrid[ki][kj];
                }
            }
            
            outputGrid[i][j] = sum;
        }
    }
    
    updateOutputGrid();
}

// Randomize input
function randomizeInput() {
    for (let i = 0; i < inputSize; i++) {
        for (let j = 0; j < inputSize; j++) {
            inputGrid[i][j] = Math.random();
        }
    }
    updateInputGrid();
    performConvolution();
}

// Reset input to zeros
function resetInput() {
    inputGrid = Array(inputSize).fill(null).map(() => Array(inputSize).fill(0));
    updateInputGrid();
    performConvolution();
}

// Randomize kernel
function randomizeKernel() {
    for (let i = 0; i < kernelSize; i++) {
        for (let j = 0; j < kernelSize; j++) {
            kernelGrid[i][j] = (Math.random() - 0.5) * 2; // Range: -1 to 1
        }
    }
    updateKernelGrid();
    performConvolution();
}

// Reset kernel
function resetKernel() {
    kernelGrid = Array(kernelSize).fill(null).map(() => Array(kernelSize).fill(0));
    updateKernelGrid();
    performConvolution();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createInputGrid();
    createKernelGrid();
    createOutputGrid();
    
    // Set up event listeners
    document.getElementById('random-input').addEventListener('click', randomizeInput);
    document.getElementById('reset-input').addEventListener('click', resetInput);
    document.getElementById('random-kernel').addEventListener('click', randomizeKernel);
    document.getElementById('reset-kernel').addEventListener('click', resetKernel);
    
    // Shape selector
    const shapeSelect = document.getElementById('shape-select');
    shapeSelect.addEventListener('change', (e) => {
        loadShapePattern(e.target.value);
    });
    
    // Load initial shape (circle)
    loadShapePattern('circle');
    updateKernelGrid();
    performConvolution();
});

