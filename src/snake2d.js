import React, {useState, useRef, useEffect} from "react";

import {useInterval} from "./useInterval";
import {
    CANVAS_SIZE,
    SCALE,
    SPEED,
    SNAKE_START,
    APPLE_START,
    DIRECTIONS,
} from './init';

const Snake2D = () => {
    const canvasRef = useRef();
    const gameBoard = useRef();
    const [snake, setSnake] = useState(SNAKE_START);
    const [apple, setApple] = useState(APPLE_START);
    const [direction, setDirection] = useState([0, -1]);
    const [speed, setSpeed] = useState(null);
    const [gameOver, setGameOver] = useState(false);

    useInterval(() => gameLoop(), speed);

    const startGame = () => {
        gameBoard.current.focus();
        setSnake(SNAKE_START);
        setApple(APPLE_START);
        setDirection([0, -1]);
        setSpeed(SPEED);
        setGameOver(false);
    }

    const endGame = () => {
        setSpeed(null);
        setGameOver(true);
    }

    const moveSnake = ({keyCode}) => {
        keyCode === 82 && gameOver && startGame();
        keyCode >= 37 && keyCode <= 40 && setDirection(DIRECTIONS[keyCode]);
    }

    const createApple = () =>
        apple.map((_a, i) => Math.floor(Math.random() * (CANVAS_SIZE[i] / SCALE)));

    const checkCollision = (piece, snk = snake) => {
        if (
            piece[0] * SCALE >= CANVAS_SIZE[0] ||
            piece[0] < 0 ||
            piece[1] * SCALE >= CANVAS_SIZE[1] ||
            piece[1] < 0
        )
            return true;

        for (const segment of snk) {
            if (piece[0] === segment[0] && piece[1] === segment[1]) return true;
        }
        return false;
    };

    const checkAppleCollision = newSnake => {
        if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
            let newApple = createApple();
            while (checkCollision(newApple, newSnake)) {
                newApple = createApple();
            }
            setApple(newApple);
            return true;
        }
        return false;
    };

    const gameLoop = () => {
        const snakeCopy = JSON.parse(JSON.stringify(snake));
        const newSnakeHead = [snakeCopy[0][0] + direction[0], snakeCopy[0][1] + direction[1]];
        snakeCopy.unshift(newSnakeHead);
        if (checkCollision(newSnakeHead)) endGame();
        if (!checkAppleCollision(snakeCopy)) snakeCopy.pop();
        setSnake(snakeCopy);
    };


    useEffect(() => startGame(), []);

    useEffect(() => {
        const context = canvasRef.current.getContext("2d");
        context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        context.fillStyle = "black";
        snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
        context.fillStyle = "red";
        context.fillRect(apple[0], apple[1], 1, 1);
    }, [snake, apple, gameOver]);


    return (
        <div
            role="button"
            ref={gameBoard}
            tabIndex={0}
            onKeyDown={e => moveSnake(e)}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '90vh'
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    border: 5,
                    borderColor: '#000',
                    borderStyle: 'solid',
                    borderRadius: 5,
                    opacity: gameOver ? 0.4 : 1
                }}
                width={`${CANVAS_SIZE}[0]`}
                height={`${CANVAS_SIZE}[1]`} />
            {gameOver && <h1 style={{position: 'absolute', textAlign: 'center'}}>GAME OVER<br />PRESS 'R' TO RESTART</h1>}
        </div >
    )
}

export default Snake2D;