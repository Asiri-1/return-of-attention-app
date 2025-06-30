import React, { useState, useEffect, useRef, useCallback } from 'react';

const ImprovedAnimatedLogo = () => {
    const dotRef = useRef<HTMLDivElement>(null);
    const matrixRef = useRef<HTMLDivElement>(null);
    const cellsRef = useRef<(HTMLDivElement | null)[]>([]);
    const [isAnimating, setIsAnimating] = useState(true);
    const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentPositionRef = useRef(4);
    const [isInitialized, setIsInitialized] = useState(false);

    // Outer cells (excluding center cell 4)
    const outerCells = [0, 1, 2, 3, 5, 6, 7, 8];

    // Cleanup function
    const cleanup = useCallback(() => {
        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
            animationTimeoutRef.current = null;
        }
    }, []);

    const positionDotAtCell = useCallback((cellIndex: number) => {
        if (!dotRef.current || !matrixRef.current || !cellsRef.current[cellIndex]) return false;

        const cell = cellsRef.current[cellIndex];
        if (!cell) return false;

        try {
            const rect = cell.getBoundingClientRect();
            const matrixRect = matrixRef.current.getBoundingClientRect();

            dotRef.current.style.left = (rect.left - matrixRect.left + rect.width / 2 - 8) + "px";
            dotRef.current.style.top = (rect.top - matrixRect.top + rect.height / 2 - 8) + "px";
            return true;
        } catch (error) {
            console.warn('Error positioning dot:', error);
            return false;
        }
    }, []);

    const positionDotAtCenter = useCallback(() => {
        if (!dotRef.current) return;
        
        const success = positionDotAtCell(4);
        if (success) {
            dotRef.current.style.opacity = '1';
            setIsInitialized(true);
        }
    }, [positionDotAtCell]);

    const getRandomOuterCell = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * outerCells.length);
        return outerCells[randomIndex];
    }, []);

    const animateToCell = useCallback((targetCell: number): Promise<void> => {
        return new Promise((resolve) => {
            const success = positionDotAtCell(targetCell);
            if (success) {
                currentPositionRef.current = targetCell;
            }
            // Wait for transition to complete
            setTimeout(resolve, 800);
        });
    }, [positionDotAtCell]);

    const performRandomMovement = useCallback(async () => {
        if (!isAnimating || !isInitialized) return;

        try {
            // Choose a random outer cell
            const targetCell = getRandomOuterCell();

            // Move to the outer cell
            await animateToCell(targetCell);
            if (!isAnimating) return;

            // Wait at the outer cell
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
        } catch (error) {
            console.warn('Animation error:', error);
        }
    }, [isAnimating, isInitialized, getRandomOuterCell, animateToCell]);

    // Initialize position
    useEffect(() => {
        const timer = setTimeout(() => {
            positionDotAtCenter();
        }, 100); // Small delay to ensure DOM is ready

        return () => clearTimeout(timer);
    }, [positionDotAtCenter]);

    // Start animation
    useEffect(() => {
        if (isInitialized && isAnimating) {
            performRandomMovement();
        }

        return cleanup;
    }, [isInitialized, isAnimating, performRandomMovement, cleanup]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (isInitialized) {
                positionDotAtCenter();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isInitialized, positionDotAtCenter]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    const cellColors = [
        '#F5E6A3', // 0: Light yellow
        '#B8E6B8', // 1: Light mint green  
        '#A3C4E6', // 2: Light blue
        '#F5E6A3', // 3: Light yellow
        '#FFFFFF', // 4: Pure white (center)
        '#A3C4E6', // 5: Light blue
        '#F5B8B8', // 6: Light pink
        '#F5B8B8', // 7: Light pink
        '#D4B8E6'  // 8: Light lavender
    ];

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            // ✅ TRANSPARENT BACKGROUND - No white background
            backgroundColor: 'transparent',
            padding: '20px',
            // ✅ IMPROVED: Subtle border instead of heavy shadow for transparent bg
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            // ✅ IMPROVED: Light shadow that works on any background
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            // ✅ IMPROVED: Backdrop blur for glass effect
            backdropFilter: 'blur(10px)',
            // ✅ IMPROVED: Slight background tint for better visibility
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
        }}>
            <div 
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 80px)',
                    gridTemplateRows: 'repeat(3, 80px)',
                    gap: '8px',
                    position: 'relative'
                }} 
                ref={matrixRef}
            >
                {Array.from({ length: 9 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: i === 0 || i === 2 || i === 6 || i === 8 ? '25px' : '10px',
                            backgroundColor: cellColors[i],
                            border: i === 4 ? '2px solid #4A90E2' : 'none',
                            color: i === 4 ? '#4A90E2' : 'transparent',
                            // ✅ IMPROVED: Better shadows for cells on transparent bg
                            boxShadow: i === 4 ? '0 2px 8px rgba(74, 144, 226, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                            // ✅ IMPROVED: Smooth transitions
                            transition: 'all 0.3s ease'
                        }}
                        ref={(el: HTMLDivElement | null) => {
                            cellsRef.current[i] = el;
                        }}
                    >
                        {i === 4 && (
                            <div style={{ 
                                textAlign: 'center', 
                                lineHeight: '1.0',
                                userSelect: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                                padding: '4px'
                            }}>
                                <div style={{ fontSize: '10px', fontWeight: 400, margin: '0', letterSpacing: '0.5px' }}>THE</div>
                                <div style={{ fontSize: '12px', fontWeight: 700, margin: '1px 0', letterSpacing: '0.2px' }}>RETURN</div>
                                <div style={{ fontSize: '10px', fontWeight: 400, margin: '0', letterSpacing: '0.5px' }}>OF</div>
                                <div style={{ fontSize: '11px', fontWeight: 500, margin: '1px 0 0 0', letterSpacing: '0.3px' }}>ATTENTION</div>
                            </div>
                        )}
                    </div>
                ))}

                <div 
                    ref={dotRef}
                    style={{
                        width: '16px',
                        height: '16px',
                        background: 'radial-gradient(circle, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                        borderRadius: '50%',
                        position: 'absolute',
                        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
                        zIndex: 10,
                        opacity: 0,
                        // ✅ IMPROVED: Better visibility on transparent background
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        // ✅ IMPROVED: Prevent dot from being selectable
                        pointerEvents: 'none'
                    }}
                />
            </div>

            <style>{`
                @keyframes glow {
                    0%, 100% {
                        box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
                        transform: scale(1);
                    }
                    50% {
                        box-shadow: 0 0 30px rgba(255, 215, 0, 0.9);
                        transform: scale(1.1);
                    }
                }
            `}</style>
        </div>
    );
};

// ✅ FIX: Define Logo before exporting
const Logo = ImprovedAnimatedLogo;
export default Logo;