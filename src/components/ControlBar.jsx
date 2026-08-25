import React from 'react';
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
  onSpeedChange
}) => {
  const atStart = currentStep === 0;
  const atEnd = currentStep >= totalSteps - 1;

  return (
    <div className="control-bar">
      <button className="ctrl-btn" onClick={onReset} title="Reset to beginning">
        <RotateCcw size={16} />
        Reset
      </button>

      <button className="ctrl-btn" onClick={onResetLayout} title="Reset device positions">
        <Move size={16} />
        Reset Layout
      </button>

      <div className="control-separator" />

      <button className="ctrl-btn" onClick={onPrev} disabled={atStart} title="Previous step">
        <SkipBack size={16} />
        Prev
      </button>

      <div className="step-indicator">
        <strong>{currentStep + 1}</strong> / {totalSteps}
      </div>

      <button className="ctrl-btn" onClick={onNext} disabled={atEnd} title="Next step">
        Next
        <SkipForward size={16} />
      </button>

      {!isPlaying ? (
        <button className="ctrl-btn primary" onClick={onPlay} disabled={atEnd} title="Auto-play">
          <Play size={16} />
          Play
        </button>
      ) : (
        <button className="ctrl-btn" onClick={onPause} title="Pause">
          <Pause size={16} />
          Pause
        </button>
      )}

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
    </div>
  );
};

export default ControlBar;
