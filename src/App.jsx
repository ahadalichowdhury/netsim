import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
import NetworkCanvas from './canvas/NetworkCanvas';
import SchematicCanvas from './canvas/SchematicCanvas';
import ControlBar from './components/ControlBar';
import InfoPanel from './components/InfoPanel';
import Sidebar from './components/Sidebar';
import { scenarios } from './simulations/scenarios';
import './App.css';

function App() {
  const [activeScenario, setActiveScenario] = useState(() => {
    const saved = localStorage.getItem('netsim-active-scenario');
    return saved && scenarios.find(s => s.id === saved) ? saved : scenarios[0].id;
  });
  const [stepIndex, setStepIndex] = useState(() => {
    const saved = localStorage.getItem('netsim-step-index');
    return saved ? parseInt(saved) : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [layoutKey, setLayoutKey] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = localStorage.getItem('netsim-panel-width');
    return saved ? parseInt(saved) : 380;
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const playTimerRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('netsim-active-scenario', activeScenario);
  }, [activeScenario]);

  useEffect(() => {
    localStorage.setItem('netsim-step-index', stepIndex);
  }, [stepIndex]);

  useEffect(() => {
    localStorage.setItem('netsim-panel-width', panelWidth);
  }, [panelWidth]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const scenario = scenarios.find(s => s.id === activeScenario);
  const steps = scenario?.steps || [];
  const currentStep = steps[stepIndex];

  useEffect(() => {
    if (stepIndex >= steps.length) {
      setStepIndex(Math.max(0, steps.length - 1));
    }
  }, [steps.length]);

  const handleScenarioChange = useCallback((id) => {
    setActiveScenario(id);
    setStepIndex(0);
    setIsPlaying(false);
    setLayoutKey(k => k + 1);
    if (playTimerRef.current) clearInterval(playTimerRef.current);
  }, []);

  const handleNext = useCallback(() => {
    setStepIndex(prev => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const handlePrev = useCallback(() => {
    setStepIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const handleReset = useCallback(() => {
    setStepIndex(0);
    setIsPlaying(false);
    if (playTimerRef.current) clearInterval(playTimerRef.current);
  }, []);

  const handleResetLayout = useCallback(() => {
    setLayoutKey(k => k + 1);
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    if (playTimerRef.current) clearInterval(playTimerRef.current);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const interval = 3000 / speed;
      playTimerRef.current = setInterval(() => {
        setStepIndex(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, speed, steps.length]);

  const currentTables = currentStep?.tables || {};
  const currentPacketDetails = currentStep?.packetDetails || {};

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="header-logo">
            <span>Net</span>Sim
          </div>
          <div className="header-badge">Interactive</div>
        </div>
        <div className="header-right">
          <div className="header-subtitle">
            Core Networking Concepts &mdash; Visualized
          </div>
          <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <div className="main">
        <Sidebar
          scenarios={scenarios}
          activeId={activeScenario}
          onSelect={handleScenarioChange}
          stepIndex={stepIndex}
          totalSteps={steps.length}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
        />

        <div className="canvas-area">
          {scenario.diagramStyle === 'schematic' ? (
            <SchematicCanvas scenario={scenario} step={currentStep} />
          ) : (
            <NetworkCanvas
              topology={scenario.topology}
              step={currentStep}
              layoutKey={layoutKey}
            />
          )}
        </div>

        <InfoPanel
          scenario={scenario}
          currentStep={currentStep}
          stepIndex={stepIndex}
          tables={currentTables}
          packetDetails={currentPacketDetails}
          width={panelWidth}
          onWidthChange={setPanelWidth}
        />
      </div>

      <ControlBar
        currentStep={stepIndex}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        speed={speed}
        onPrev={handlePrev}
        onNext={handleNext}
        onPlay={handlePlay}
        onPause={handlePause}
        onReset={handleReset}
        onResetLayout={handleResetLayout}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}

export default App;
