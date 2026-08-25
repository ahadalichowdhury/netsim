import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Sun, Moon, Menu, X, ChevronUp, ChevronDown, Globe } from 'lucide-react';
import NetworkCanvas from './canvas/NetworkCanvas';
import SchematicCanvas from './canvas/SchematicCanvas';
import ControlBar from './components/ControlBar';
import InfoPanel from './components/InfoPanel';
import Sidebar from './components/Sidebar';
import { scenarios } from './simulations/scenarios';
import { loadTopicMarkdown } from './utils/markdownLoader';
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
  const [lang, setLang] = useState(() => localStorage.getItem('netsim-lang') || 'en');
  const [mdSteps, setMdSteps] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const playTimerRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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

  useEffect(() => {
    localStorage.setItem('netsim-lang', lang);
  }, [lang]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const toggleLang = () => setLang(l => l === 'en' ? 'bn' : 'en');

  const scenario = scenarios.find(s => s.id === activeScenario);
  const steps = scenario?.steps || [];

  useEffect(() => {
    setMdSteps([]);
    if (!scenario) return;
    loadTopicMarkdown(scenario.id, lang).then(parsed => {
      setMdSteps(parsed);
    });
  }, [scenario?.id, lang]);

  const mergedSteps = steps.map((s, i) => {
    const md = mdSteps[i];
    return {
      ...s,
      title: md?.title || s.title,
      explanation: md?.explanation || s.explanation || ''
    };
  });

  const currentStep = mergedSteps[stepIndex];

  useEffect(() => {
    if (stepIndex >= mergedSteps.length) {
      setStepIndex(Math.max(0, mergedSteps.length - 1));
    }
  }, [mergedSteps.length]);

  const handleScenarioChange = useCallback((id) => {
    setActiveScenario(id);
    setStepIndex(0);
    setIsPlaying(false);
    setLayoutKey(k => k + 1);
    setMobileSidebarOpen(false);
    if (playTimerRef.current) clearInterval(playTimerRef.current);
  }, []);

  const handleNext = useCallback(() => {
    setStepIndex(prev => Math.min(prev + 1, mergedSteps.length - 1));
  }, [mergedSteps.length]);

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
          if (prev >= mergedSteps.length - 1) {
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
  }, [isPlaying, speed, mergedSteps.length]);

  const currentTables = currentStep?.tables || {};
  const currentPacketDetails = currentStep?.packetDetails || {};

  return (
    <div className={`app ${isMobile ? 'is-mobile' : ''}`}>
      <header className="header">
        <div className="header-left">
          {isMobile && (
            <button className="mobile-menu-btn" onClick={() => setMobileSidebarOpen(o => !o)}>
              {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          <div className="header-logo">
            <span>Net</span>Sim
          </div>
          {!isMobile && <div className="header-badge">Interactive</div>}
        </div>
        <div className="header-right">
          {!isMobile && (
            <div className="header-subtitle">
              Core Networking Concepts &mdash; Visualized
            </div>
          )}
          <button className="lang-toggle" onClick={toggleLang} title={`Switch to ${lang === 'en' ? 'Bangla' : 'English'}`}>
            <Globe size={16} />
            <span>{lang === 'en' ? 'EN' : 'BN'}</span>
          </button>
          <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <div className="main">
        {isMobile && mobileSidebarOpen && (
          <div className="mobile-overlay" onClick={() => setMobileSidebarOpen(false)} />
        )}
        <div className={`sidebar-drawer${isMobile ? ' mobile' : ''}${mobileSidebarOpen ? ' open' : ''}`}>
          <Sidebar
            scenarios={scenarios}
            activeId={activeScenario}
            onSelect={handleScenarioChange}
            stepIndex={stepIndex}
            totalSteps={steps.length}
            collapsed={isMobile ? false : sidebarCollapsed}
            onToggle={() => isMobile ? setMobileSidebarOpen(false) : setSidebarCollapsed(c => !c)}
          />
        </div>

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

          {isMobile && (
            <button className="mobile-panel-toggle" onClick={() => setMobilePanelOpen(o => !o)}>
              {mobilePanelOpen ? <X size={16} /> : <ChevronUp size={16} />}
              <span>{currentStep?.title || 'Details'}</span>
            </button>
          )}
        </div>

        {isMobile ? (
          <div className={`bottom-sheet ${mobilePanelOpen ? 'open' : ''}`}>
            <InfoPanel
              scenario={scenario}
              currentStep={currentStep}
              stepIndex={stepIndex}
              tables={currentTables}
              packetDetails={currentPacketDetails}
              width={panelWidth}
              onWidthChange={setPanelWidth}
              isMobile={isMobile}
            />
          </div>
        ) : (
          <InfoPanel
            scenario={scenario}
            currentStep={currentStep}
            stepIndex={stepIndex}
            tables={currentTables}
            packetDetails={currentPacketDetails}
            width={panelWidth}
            onWidthChange={setPanelWidth}
            isMobile={isMobile}
          />
        )}
      </div>

      <ControlBar
        currentStep={stepIndex}
        totalSteps={mergedSteps.length}
        isPlaying={isPlaying}
        speed={speed}
        onPrev={handlePrev}
        onNext={handleNext}
        onPlay={handlePlay}
        onPause={handlePause}
        onReset={handleReset}
        onResetLayout={handleResetLayout}
        onSpeedChange={setSpeed}
        isMobile={isMobile}
      />
    </div>
  );
}

export default App;
