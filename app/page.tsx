'use client';

import { useState, useEffect, useRef } from 'react';

interface Session {
  id: string;
  duration: number;
  completedAt: string;
  date: string;
}

const QUOTES = [
  { text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thích Nhất Hạnh" },
  { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
  { text: "One moment can change a day, one day can change a life, and one life can change the world.", author: "Buddha" },
  { text: "The moon does not fight. It attacks no one. It does not worry. It does not try to crush others.", author: "Zen Proverb" },
  { text: "Let go or be dragged.", author: "Zen Saying" },
  { text: "Be master of mind rather than mastered by mind.", author: "Zen Saying" },
  { text: "The obstacle is the path.", author: "Zen Proverb" },
  { text: "When walking, walk. When eating, eat.", author: "Zen Proverb" },
  { text: "Sitting quietly, doing nothing, spring comes, and the grass grows by itself.", author: "Zen Poem" },
  { text: "You should sit in meditation for 20 minutes a day, unless you're too busy; then you should sit for an hour.", author: "Old Zen Saying" },
];

const DURATIONS = [
  { label: '15 min', value: 15 },
  { label: '25 min', value: 25 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

export default function Home() {
  const [view, setView] = useState<'timer' | 'dashboard'>('timer');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalDuration, setTotalDuration] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('incenseSessions');
    if (saved) {
      setSessions(JSON.parse(saved));
    }

    if (typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        const audio = new Audio();
        audioRef.current = audio;
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const playBellSound = () => {
    if (typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 528;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 2);
    }
  };

  const handleComplete = () => {
    setIsRunning(false);
    playBellSound();

    const newSession: Session = {
      id: Date.now().toString(),
      duration: totalDuration / 60,
      completedAt: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem('incenseSessions', JSON.stringify(updatedSessions));
  };

  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft(totalDuration);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalDuration);
  };

  const handleDurationChange = (minutes: number) => {
    setSelectedDuration(minutes);
    const seconds = minutes * 60;
    setTotalDuration(seconds);
    setTimeLeft(seconds);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getIncenseHeight = () => {
    const percentage = (timeLeft / totalDuration) * 100;
    return `${percentage}%`;
  };

  const getTodayQuote = () => {
    const today = new Date().toDateString();
    const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return QUOTES[hash % QUOTES.length];
  };

  const stats = {
    total: sessions.length,
    thisWeek: sessions.filter(s => {
      const sessionDate = new Date(s.completedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    }).length,
    totalMinutes: sessions.reduce((acc, s) => acc + s.duration, 0),
  };

  return (
    <div className="container">
      <nav className="nav">
        <h1>香 INCENSE</h1>
        <div className="nav-buttons">
          <button
            className={`nav-button ${view === 'timer' ? 'active' : ''}`}
            onClick={() => setView('timer')}
          >
            Timer
          </button>
          <button
            className={`nav-button ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            Dashboard
          </button>
        </div>
      </nav>

      {view === 'timer' ? (
        <div className="timer-view">
          <div className="duration-selector">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                className={`duration-button ${selectedDuration === d.value ? 'active' : ''}`}
                onClick={() => handleDurationChange(d.value)}
                disabled={isRunning}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="incense-container">
            <div className="incense-stick" style={{ height: getIncenseHeight() }}>
              {isRunning && timeLeft > 0 && (
                <>
                  <div className="incense-glow"></div>
                  <div className="smoke"></div>
                </>
              )}
            </div>
          </div>

          <div className="timer-display">{formatTime(timeLeft)}</div>

          <div className="controls">
            {!isRunning ? (
              <button className="button" onClick={handleStart}>
                {timeLeft === totalDuration ? 'Begin' : 'Resume'}
              </button>
            ) : (
              <button className="button" onClick={handlePause}>
                Pause
              </button>
            )}
            <button
              className="button"
              onClick={handleReset}
              disabled={timeLeft === totalDuration && !isRunning}
            >
              Reset
            </button>
          </div>
        </div>
      ) : (
        <div className="dashboard-view">
          <div className="quote-section">
            <p className="quote-text">"{getTodayQuote().text}"</p>
            <p className="quote-author">— {getTodayQuote().author}</p>
          </div>

          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">TOTAL SESSIONS</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.thisWeek}</div>
                <div className="stat-label">THIS WEEK</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalMinutes}</div>
                <div className="stat-label">TOTAL MINUTES</div>
              </div>
            </div>
          </div>

          <div className="sessions-section">
            <h2>Past Sessions</h2>
            {sessions.length === 0 ? (
              <div className="empty-state">
                No sessions yet. Begin your first incense ritual.
              </div>
            ) : (
              <div className="ash-piles">
                {sessions.map((session) => (
                  <div key={session.id} className="ash-pile">
                    <div className="ash-visual">
                      <div className="ash-base"></div>
                      <div className="ash-mound"></div>
                    </div>
                    <div className="ash-date">{session.date}</div>
                    <div className="ash-duration">{session.duration}m</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
