import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Move } from 'lucide-react';

const ControlBar = ({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  onPrev,
  onNext,
  onPlay,
  onPause,
  onReset,
  onResetLayout,
  onSpeedChange,
  isMobile
}) => {
  const atStart = currentStep === 0;
  const atEnd = currentStep >= totalSteps - 1;
  const barRef = useRef(null);
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('netsim-control-pos');
    return saved ? JSON.parse(saved) : { x: null, y: null };
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  useEffect(() => {
    if (position.x !== null) {
      localStorage.setItem('netsim-control-pos', JSON.stringify(position));
    }
  }, [position]);

  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    const rect = barRef.current.getBoundingClientRect();
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      posX: rect.left,
      posY: rect.top
    };
    setIsDragging(true);
  }, [isMobile]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;
    const newX = dragStartRef.current.posX + dx;
    const newY = dragStartRef.current.posY + dy;
    const maxX = window.innerWidth - 50;
    const maxY = window.innerHeight - 200;
    setPosition({
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(56, Math.min(maxY, newY))
    });
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  const style = isMobile && position.x !== null ? {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    right: 'auto',
    transform: 'none'
  } : {};

  return (
    <div
      className={`control-bar ${isDragging ? 'dragging' : ''}`}
      ref={barRef}
      style={style}
    >
      {isMobile && (
        <div
          className="control-bar-drag-handle"
          onTouchStart={handleTouchStart}
        >
          <Move size={12} />
        </div>
      )}

      <button className="ctrl-btn" onClick={onReset} title="Reset to beginning">
        <RotateCcw size={16} />
        {!isMobile && 'Reset'}
      </button>

      {!isMobile && (
        <>
          <button className="ctrl-btn" onClick={onResetLayout} title="Reset device positions">
            <Move size={16} />
            Reset Layout
          </button>
          <div className="control-separator" />
        </>
      )}

      <button className="ctrl-btn" onClick={onPrev} disabled={atStart} title="Previous step">
        <SkipBack size={16} />
        {!isMobile && 'Prev'}
      </button>

      <div className="step-indicator">
        <strong>{currentStep + 1}</strong> / {totalSteps}
      </div>

      <button className="ctrl-btn" onClick={onNext} disabled={atEnd} title="Next step">
        {!isMobile && 'Next'}
        <SkipForward size={16} />
      </button>

      {!isPlaying ? (
        <button className="ctrl-btn primary" onClick={onPlay} disabled={atEnd} title="Auto-play">
          <Play size={16} />
          {!isMobile && 'Play'}
        </button>
      ) : (
        <button className="ctrl-btn" onClick={onPause} title="Pause">
          <Pause size={16} />
          {!isMobile && 'Pause'}
        </button>
      )}

      {!isMobile && (
        <div className="speed-control">
          <span className="speed-label">Speed</span>
          <input
            type="range"
            className="speed-slider"
            min="0.5"
            max="3"
            step="0.5"
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          />
          <span className="speed-value">{speed}x</span>
        </div>
      )}
    </div>
  );
};

export default ControlBar;
