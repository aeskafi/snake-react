import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Snake2D from './snake2d';

// Mock HTMLCanvasElement.getContext to support testing in JSDOM
HTMLCanvasElement.prototype.getContext = () => ({
    fillRect: () => {},
    clearRect: () => {},
    beginPath: () => {},
    rect: () => {},
    roundRect: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    moveTo: () => {},
    lineTo: () => {},
    ellipse: () => {},
    createRadialGradient: () => ({
        addColorStop: () => {},
    }),
});

test('renders Snake 2D title, score cards, and action toolbar', () => {
    const { getByText, getAllByText } = render(<Snake2D />);
    expect(getByText('SNAKE 2D')).toBeInTheDocument();
    expect(getByText('SCORE')).toBeInTheDocument();
    expect(getByText('BEST')).toBeInTheDocument();
    expect(getByText(/New Game/i)).toBeInTheDocument();
    expect(getAllByText(/Pause/i)[0]).toBeInTheDocument();
});
