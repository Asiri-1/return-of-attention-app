import React, { useState, useEffect, useRef, RefCallback } from 'react';
import './AnimatedLogo.css';

const AnimatedLogo = () => {
    const dotRef = useRef<HTMLDivElement>(null);
    const matrixRef = useRef<HTMLDivElement>(null);
    const cellsRef = useRef<(HTMLDivElement | null)[]>([]);
    const [isAnimating, setIsAnimating] = useState(true); // Changed to true for auto-start
    const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentPositionRef = useRef(4); // Start at center

    // Outer cells (excluding center cell 4)
    const outerCells = [0, 1, 2, 3, 5, 6, 7, 8];

    const positionDotAtCell = (cellIndex: number) => {
        if (!dotRef.current || !matrixRef.current || !cellsRef.current[cellIndex]) return;

        const cell = cellsRef.current[cellIndex];
        if (!cell) return; // Type guard for null

        const rect = cell.getBoundingClientRect();
        const matrixRect = matrixRef.current.getBoundingClientRect();

        dotRef.current.style.left = (rect.left - matrixRect.left + rect.width / 2 - 8) + "px";
        dotRef.current.style.top = (rect.top - matrixRect.top + rect.height / 2 - 8) + "px";
    };

    const positionDotAtCenter = () => {
        if (!dotRef.current) return;
        positionDotAtCell(4);
        dotRef.current.classList.add("visible", "glowing");
    };

    const getRandomOuterCell = () => {
        const randomIndex = Math.floor(Math.random() * outerCells.length);
        return outerCells[randomIndex];
    };

    const animateToCell = (targetCell: number) => {
        return new Promise<void>((resolve) => {
            positionDotAtCell(targetCell);
            currentPositionRef.current = targetCell;

            // Wait for transition to complete
            setTimeout(resolve, 800);
        });
    };

    const performRandomMovement = async () => {
        if (!isAnimating) return;

        // Choose a random outer cell
        const targetCell = getRandomOuterCell();

        // Move to the outer cell
        await animateToCell(targetCell);

        if (!isAnimating) return;

        // Wait a bit at the outer cell
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!isAnimating) return;

        // Return to center
        await animateToCell(4);

        if (!isAnimating) return;

        // Wait at center before next movement
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Schedule next movement
        if (isAnimating) {
            animationTimeoutRef.current = setTimeout(() => performRandomMovement(), 500);
        }
    };

    // Start animation on mount
    useEffect(() => {
        positionDotAtCenter();
        if (isAnimating) {
            performRandomMovement();
        }

        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, [isAnimating]); // Dependency on isAnimating to re-trigger if it changes

    return (
        <div className="logo-container">
            <div className="logo-matrix" ref={matrixRef}>
                {Array.from({ length: 9 }).map((_, i) => (
                    <div
                        key={i}
                        className={`logo-cell cell-${i}`}
                        data-cell={i}
                        ref={(el: HTMLDivElement | null) => {
                            cellsRef.current[i] = el;
                        }}
                    >
                        {i === 4 && (
                            <div className="center-text">
                                <div className="text-small">THE</div>
                                <div className="text-large">RETURN</div>
                                <div className="text-small">OF</div>
                                <div className="text-medium">ATTENTION</div>
                            </div>
                        )}
                    </div>
                ))}

                <div className="animated-dot" ref={dotRef}></div>
            </div>
        </div>
    );
};

export default AnimatedLogo;
