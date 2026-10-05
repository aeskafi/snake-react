export const CANVAS_SIZE = [500, 500];
export const SCALE = 25; // 20x20 grid (500 / 25 = 20 cells)
export const INITIAL_SPEED = 120;
export const MIN_SPEED = 50;
export const SPEED_DECREMENT = 2;

export const SNAKE_START = [
    [10, 10],
    [10, 11],
    [10, 12],
];

export const APPLE_START = [10, 5];

export const DIRECTIONS = {
    // Arrow keys
    37: [-1, 0], // Left
    38: [0, -1], // Up
    39: [1, 0],  // Right
    40: [0, 1],  // Down
    // WASD keys
    65: [-1, 0], // A
    87: [0, -1], // W
    68: [1, 0],  // D
    83: [0, 1],  // S
};