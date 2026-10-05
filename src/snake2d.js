import React, { useState, useRef, useEffect, useCallback } from 'react';
import './styles/snake.css';
import { useInterval } from './useInterval';
import { sound } from './utils/sound';
import {
    CANVAS_SIZE,
    SCALE,
    INITIAL_SPEED,
    MIN_SPEED,
    SPEED_DECREMENT,
    SNAKE_START,
    APPLE_START,
    DIRECTIONS,
} from './init';

const Snake2D = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const [snake, setSnake] = useState(SNAKE_START);
    const [apple, setApple] = useState(APPLE_START);
    const [direction, setDirection] = useState([0, -1]);
    const [speed, setSpeed] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(() => {
        try {
            return parseInt(localStorage.getItem('snake_best_score') || '0', 10) || 0;
        } catch (e) {
            return 0;
        }
    });
    const [isNewRecord, setIsNewRecord] = useState(false);
    const [isMuted, setIsMuted] = useState(sound.isMuted());

    // Buffered next direction to prevent rapid double-key suicide
    const nextDirectionRef = useRef([0, -1]);
    const touchStartRef = useRef({ x: null, y: null });

    const createApple = useCallback((currentSnake) => {
        const gridWidth = CANVAS_SIZE[0] / SCALE;
        const gridHeight = CANVAS_SIZE[1] / SCALE;
        let newApple;
        let collision = true;

        while (collision) {
            newApple = [
                Math.floor(Math.random() * gridWidth),
                Math.floor(Math.random() * gridHeight),
            ];
            collision = false;
            for (let i = 0; i < currentSnake.length; i++) {
                if (currentSnake[i][0] === newApple[0] && currentSnake[i][1] === newApple[1]) {
                    collision = true;
                    break;
                }
            }
        }
        return newApple;
    }, []);

    const startGame = useCallback(() => {
        sound.playClick();
        if (containerRef.current) {
            containerRef.current.focus();
        }
        setSnake(SNAKE_START);
        setApple(APPLE_START);
        setDirection([0, -1]);
        nextDirectionRef.current = [0, -1];
        setSpeed(INITIAL_SPEED);
        setGameOver(false);
        setIsPaused(false);
        setScore(0);
        setIsNewRecord(false);
    }, []);

    const endGame = useCallback(() => {
        setSpeed(null);
        setGameOver(true);
        sound.playGameOver();

        setBestScore((currentBest) => {
            const finalScore = (snake.length - SNAKE_START.length) * 10;
            if (finalScore > currentBest) {
                sound.playHighScore();
                setIsNewRecord(true);
                try {
                    localStorage.setItem('snake_best_score', finalScore.toString());
                } catch (e) {}
                return finalScore;
            }
            return currentBest;
        });
    }, [snake.length]);

    const togglePause = useCallback(() => {
        if (gameOver) return;
        sound.playClick();
        if (isPaused) {
            const currentSpeed = Math.max(
                MIN_SPEED,
                INITIAL_SPEED - (snake.length - SNAKE_START.length) * SPEED_DECREMENT
            );
            setSpeed(currentSpeed);
            setIsPaused(false);
        } else {
            setSpeed(null);
            setIsPaused(true);
        }
    }, [gameOver, isPaused, snake.length]);

    const toggleSound = useCallback(() => {
        const muted = sound.toggleMute();
        setIsMuted(muted);
    }, []);

    const changeDirection = useCallback(
        (newDir) => {
            if (gameOver || isPaused) return;
            const currentDir = direction;

            // Prevent 180° reverse into self
            if (newDir[0] !== -currentDir[0] || newDir[1] !== -currentDir[1]) {
                nextDirectionRef.current = newDir;
            }
        },
        [direction, gameOver, isPaused]
    );

    const handleKeyDown = useCallback(
        (e) => {
            const code = e.keyCode;

            // Spacebar: Pause / Resume
            if (code === 32) {
                e.preventDefault();
                togglePause();
                return;
            }

            // 'R' key: Restart
            if (code === 82) {
                e.preventDefault();
                startGame();
                return;
            }

            // Directional keys (Arrows & WASD)
            if (DIRECTIONS[code]) {
                e.preventDefault();
                changeDirection(DIRECTIONS[code]);
            }
        },
        [changeDirection, startGame, togglePause]
    );

    const handleTouchStart = (e) => {
        if (e.touches.length !== 1) return;
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 1) {
            e.preventDefault();
        }
    };

    const handleTouchEnd = (e) => {
        const { x, y } = touchStartRef.current;
        if (x === null || y === null || e.changedTouches.length !== 1) return;

        const deltaX = e.changedTouches[0].clientX - x;
        const deltaY = e.changedTouches[0].clientY - y;
        touchStartRef.current = { x: null, y: null };

        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (Math.max(absX, absY) > 20) {
            if (absX > absY) {
                changeDirection(deltaX > 0 ? [1, 0] : [-1, 0]);
            } else {
                changeDirection(deltaY > 0 ? [0, 1] : [0, -1]);
            }
        }
    };

    const checkCollision = (piece, currentSnake = snake) => {
        const maxX = CANVAS_SIZE[0] / SCALE;
        const maxY = CANVAS_SIZE[1] / SCALE;

        // Wall collisions
        if (piece[0] < 0 || piece[0] >= maxX || piece[1] < 0 || piece[1] >= maxY) {
            return true;
        }

        // Self-collision
        for (const segment of currentSnake) {
            if (piece[0] === segment[0] && piece[1] === segment[1]) {
                return true;
            }
        }
        return false;
    };

    const gameLoop = () => {
        const currentDir = nextDirectionRef.current;
        setDirection(currentDir);

        const newSnakeHead = [
            snake[0][0] + currentDir[0],
            snake[0][1] + currentDir[1],
        ];

        // Check if collision occurs
        if (checkCollision(newSnakeHead, snake)) {
            endGame();
            return;
        }

        const newSnake = [newSnakeHead, ...snake];

        // Check apple eating
        if (newSnakeHead[0] === apple[0] && newSnakeHead[1] === apple[1]) {
            const applesEaten = newSnake.length - SNAKE_START.length;
            const newScore = applesEaten * 10;
            setScore(newScore);

            sound.playEat(applesEaten);
            setApple(createApple(newSnake));

            // Progressive speed acceleration
            const newSpeed = Math.max(
                MIN_SPEED,
                INITIAL_SPEED - applesEaten * SPEED_DECREMENT
            );
            setSpeed(newSpeed);
        } else {
            newSnake.pop();
            sound.playMove();
        }

        setSnake(newSnake);
    };

    useInterval(gameLoop, speed);

    useEffect(() => {
        startGame();
    }, [startGame]);

    // Canvas drawing effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = CANVAS_SIZE[0];
        const height = CANVAS_SIZE[1];

        // Background
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, width, height);

        // Subtle Grid Dots / Lines
        ctx.strokeStyle = 'rgba(55, 65, 81, 0.25)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= width; x += SCALE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y <= height; y += SCALE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw Apple (Radial gradient circle + cute leaf)
        const appleX = apple[0] * SCALE + SCALE / 2;
        const appleY = apple[1] * SCALE + SCALE / 2;
        const radius = SCALE / 2 - 2;

        const appleGrad = ctx.createRadialGradient(
            appleX - 2,
            appleY - 2,
            2,
            appleX,
            appleY,
            radius
        );
        appleGrad.addColorStop(0, '#f87171');
        appleGrad.addColorStop(0.8, '#ef4444');
        appleGrad.addColorStop(1, '#b91c1c');

        ctx.fillStyle = appleGrad;
        ctx.beginPath();
        ctx.arc(appleX, appleY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Apple leaf
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(appleX + 3, appleY - radius, 3, 5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw Snake Body & Head
        snake.forEach(([segX, segY], index) => {
            const px = segX * SCALE;
            const py = segY * SCALE;
            const isHead = index === 0;

            if (isHead) {
                // Snake Head
                ctx.fillStyle = '#10b981';
                ctx.beginPath();
                ctx.roundRect
                    ? ctx.roundRect(px + 1, py + 1, SCALE - 2, SCALE - 2, 6)
                    : ctx.rect(px + 1, py + 1, SCALE - 2, SCALE - 2);
                ctx.fill();

                // Eyes
                ctx.fillStyle = '#ffffff';
                const eyeOffset = 5;
                const eyeRadius = 2.5;

                let eye1 = [px + eyeOffset, py + eyeOffset];
                let eye2 = [px + SCALE - eyeOffset, py + eyeOffset];

                if (direction[0] === 1) {
                    // Moving Right
                    eye1 = [px + SCALE - eyeOffset, py + eyeOffset];
                    eye2 = [px + SCALE - eyeOffset, py + SCALE - eyeOffset];
                } else if (direction[0] === -1) {
                    // Moving Left
                    eye1 = [px + eyeOffset, py + eyeOffset];
                    eye2 = [px + eyeOffset, py + SCALE - eyeOffset];
                } else if (direction[1] === 1) {
                    // Moving Down
                    eye1 = [px + eyeOffset, py + SCALE - eyeOffset];
                    eye2 = [px + SCALE - eyeOffset, py + SCALE - eyeOffset];
                }

                ctx.beginPath();
                ctx.arc(eye1[0], eye1[1], eyeRadius, 0, Math.PI * 2);
                ctx.arc(eye2[0], eye2[1], eyeRadius, 0, Math.PI * 2);
                ctx.fill();

                // Pupils
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(eye1[0], eye1[1], 1.2, 0, Math.PI * 2);
                ctx.arc(eye2[0], eye2[1], 1.2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Body segments with fading emerald gradient
                const alpha = Math.max(0.6, 1 - (index / snake.length) * 0.4);
                ctx.fillStyle = `rgba(5, 150, 105, ${alpha})`;
                ctx.beginPath();
                ctx.roundRect
                    ? ctx.roundRect(px + 2, py + 2, SCALE - 4, SCALE - 4, 4)
                    : ctx.rect(px + 2, py + 2, SCALE - 4, SCALE - 4);
                ctx.fill();
            }
        });
    }, [snake, apple, direction]);

    return (
        <div
            className="snake-game-wrapper"
            ref={containerRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {/* Header Section */}
            <header className="snake-header">
                <div className="brand-section">
                    <h1 className="snake-title">SNAKE 2D</h1>
                    <p className="snake-subtitle">Classic Retro Arcade in React</p>
                </div>

                <div className="scores-container">
                    <div className="score-card">
                        <span className="score-card-label">SCORE</span>
                        <span className="score-card-val">{score}</span>
                    </div>

                    <div className="score-card best-card">
                        <span className="score-card-label">BEST</span>
                        <span className="score-card-val">{bestScore}</span>
                    </div>

                    <div className="score-card">
                        <span className="score-card-label">LENGTH</span>
                        <span className="score-card-val">{snake.length}</span>
                    </div>
                </div>
            </header>

            {/* Action Toolbar */}
            <div className="snake-toolbar">
                <button
                    className="toolbar-btn btn-restart"
                    onClick={startGame}
                    title="Restart game (R)"
                >
                    <span>🔄 New Game</span>
                </button>

                <button
                    className="toolbar-btn btn-pause"
                    onClick={togglePause}
                    disabled={gameOver}
                    title="Pause or Resume (Space)"
                >
                    <span>{isPaused ? '▶️ Resume' : '⏸️ Pause'}</span>
                </button>

                <button
                    className={`toolbar-btn btn-sound ${isMuted ? 'muted' : ''}`}
                    onClick={toggleSound}
                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                    <span>{isMuted ? '🔇 Muted' : '🔊 Sound'}</span>
                </button>
            </div>

            {/* Game Canvas Board */}
            <main
                className="canvas-wrapper"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <canvas
                    className="game-canvas"
                    ref={canvasRef}
                    width={CANVAS_SIZE[0]}
                    height={CANVAS_SIZE[1]}
                />

                {/* Game Over Modal */}
                {gameOver && (
                    <div className="modal-overlay">
                        <span
                            className={`modal-badge ${
                                isNewRecord ? 'badge-new-record' : ''
                            }`}
                        >
                            {isNewRecord ? '🏆 NEW RECORD!' : '💀 GAME OVER'}
                        </span>
                        <h2 className="modal-title">
                            {isNewRecord ? 'Outstanding!' : 'You Crashed!'}
                        </h2>
                        <p className="modal-stats">
                            Score: <strong>{score}</strong> • Best:{' '}
                            <strong>{bestScore}</strong>
                        </p>
                        <button className="modal-btn" onClick={startGame}>
                            Play Again 🔄
                        </button>
                    </div>
                )}

                {/* Pause Modal */}
                {isPaused && !gameOver && (
                    <div className="modal-overlay">
                        <span className="modal-badge">⏸️ PAUSED</span>
                        <h2 className="modal-title">Game Paused</h2>
                        <p className="modal-stats">Press Space or Resume to continue</p>
                        <button className="modal-btn" onClick={togglePause}>
                            Resume ▶️
                        </button>
                    </div>
                )}
            </main>

            {/* Virtual Directional D-Pad for Mobile */}
            <div className="virtual-dpad">
                <div className="dpad-row">
                    <button
                        className="dpad-btn up"
                        onClick={() => changeDirection([0, -1])}
                        aria-label="Move Up"
                    >
                        ▲
                    </button>
                </div>
                <div className="dpad-row">
                    <button
                        className="dpad-btn left"
                        onClick={() => changeDirection([-1, 0])}
                        aria-label="Move Left"
                    >
                        ◀
                    </button>
                    <button
                        className="dpad-btn down"
                        onClick={() => changeDirection([0, 1])}
                        aria-label="Move Down"
                    >
                        ▼
                    </button>
                    <button
                        className="dpad-btn right"
                        onClick={() => changeDirection([1, 0])}
                        aria-label="Move Right"
                    >
                        ▶
                    </button>
                </div>
            </div>

            {/* Footer Navigation Hints */}
            <footer className="snake-footer">
                <p>
                    💡 <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> or{' '}
                    <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> to steer •{' '}
                    <kbd>Space</kbd> pause • <kbd>R</kbd> restart • Touch swipe on screen
                </p>
            </footer>
        </div>
    );
};

export default Snake2D;