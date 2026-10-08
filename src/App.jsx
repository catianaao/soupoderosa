import React, { useState, useEffect } from 'react';
import { Trophy, BookOpen, X, Sparkles, Check } from 'lucide-react';
import { dailyMessages, games, routines } from './data';
import { playClickSound, playSuccessSound, playUnlockSound } from './audio';
import './index.css';

const TrophyConfetti = () => {
  const [trophies] = useState(() => 
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + 'vw',
      animationDuration: Math.random() * 2 + 2 + 's',
      animationDelay: Math.random() * 0.5 + 's',
      fontSize: Math.random() * 2 + 1.5 + 'rem',
    }))
  );

  return (
    <div className="confetti-container">
      {trophies.map(t => (
        <span
          key={t.id}
          className="confetti-trophy"
          style={{
            left: t.left,
            animationDuration: t.animationDuration,
            animationDelay: t.animationDelay,
            fontSize: t.fontSize
          }}
        >
          🏆
        </span>
      ))}
    </div>
  );
};

function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem('outubroRosaUserName') || null);
  const [userRoutine, setUserRoutine] = useState(() => localStorage.getItem('outubroRosaUserRoutine') || null);
  const [tempName, setTempName] = useState('');
  const [tempRoutine, setTempRoutine] = useState('seca_tudo');

  // completedClasses: array of class indices (0-based) that have been completed
  const [completedClasses, setCompletedClasses] = useState(() => {
    const saved = localStorage.getItem('outubroRosaCompletedClasses');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedClass, setSelectedClass] = useState(null); // { index, name }
  const [activeGame, setActiveGame] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [gameHistory, setGameHistory] = useState(() => {
    const saved = localStorage.getItem('outubroRosaGameHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('outubroRosaCompletedClasses', JSON.stringify(completedClasses));
  }, [completedClasses]);

  useEffect(() => {
    localStorage.setItem('outubroRosaGameHistory', JSON.stringify(gameHistory));
  }, [gameHistory]);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      playSuccessSound();
      setUserName(tempName.trim());
      setUserRoutine(tempRoutine);
      localStorage.setItem('outubroRosaUserName', tempName.trim());
      localStorage.setItem('outubroRosaUserRoutine', tempRoutine);
    }
  };

  const handleCircleClick = (classIndex, className) => {
    if (completedClasses.includes(classIndex)) return; // already done
    playClickSound();
    setSelectedClass({ index: classIndex, name: className });
  };

  const handleCompleteClass = () => {
    playSuccessSound();
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4500);

    const idx = selectedClass.index;
    let newCompleted = [...completedClasses];

    if (!newCompleted.includes(idx)) {
      newCompleted.push(idx);
      setCompletedClasses(newCompleted);
    }

    setSelectedClass(null);

    // Every 3 completions unlock a game
    if (newCompleted.length > 0 && newCompleted.length % 3 === 0) {
      const gameIndex = Math.floor(newCompleted.length / 3) - 1;
      if (gameIndex >= 0 && gameIndex < games.length) {
        setTimeout(() => {
          playUnlockSound();
          setActiveGame(games[gameIndex]);
          setGameResult(null);
        }, 1500);
      }
    }
  };

  const handleGameOptionClick = (option) => {
    playClickSound();
    setGameResult(option);
  };

  const closeGame = () => {
    playClickSound();
    if (activeGame && gameResult) {
      setGameHistory(prev => {
        const exists = prev.find(item => item.gameTitle === activeGame.title);
        if (exists) return prev;
        return [...prev, {
          gameTitle: activeGame.title,
          optionLabel: gameResult.label,
          message: gameResult.message,
          image: gameResult.image
        }];
      });
    }
    setActiveGame(null);
    setGameResult(null);
  };

  // Welcome screen
  if (!userName || !userRoutine) {
    return (
      <div className="app-container" style={{ justifyContent: 'center' }}>
        <div className="modal-content" style={{ animation: 'slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)', maxWidth: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Sparkles size={40} color="var(--gold)" />
          </div>
          <h1 className="title" style={{ fontSize: '2.5rem' }}>Bem-vinda ao seu mês</h1>
          <p className="subtitle" style={{ marginBottom: '2rem' }}>Para começarmos essa jornada de autocuidado, preencha os dados abaixo:</p>
          <form onSubmit={handleSaveName} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Como você gostaria de ser chamada?"
              style={{
                padding: '1rem 1.5rem',
                borderRadius: '50px',
                border: '2px solid var(--pink-medium)',
                fontSize: '1.1rem',
                fontFamily: 'Outfit',
                width: '100%',
                textAlign: 'center',
                outline: 'none',
                color: 'var(--bordo)'
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
              <p style={{ color: 'var(--bordo)', fontWeight: 700, fontSize: '1rem' }}>Qual rotina de treino você quer seguir?</p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['seca_tudo', 'mais_gostosa'].map(key => (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.8rem 1.4rem',
                      borderRadius: '50px',
                      border: `2px solid ${tempRoutine === key ? 'var(--bordo)' : 'var(--pink-medium)'}`,
                      background: tempRoutine === key ? 'var(--bordo)' : 'white',
                      color: tempRoutine === key ? 'white' : 'var(--bordo)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="routine"
                      value={key}
                      checked={tempRoutine === key}
                      onChange={() => setTempRoutine(key)}
                      style={{ display: 'none' }}
                    />
                    {routines[key].label}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
              Começar minha jornada 💪
            </button>
          </form>
        </div>
      </div>
    );
  }

  const routine = routines[userRoutine];
  // flat list of all classes in order
  const allClasses = routine.weeks.flatMap(w => w.classes);

  return (
    <div className="app-container">
      {showConfetti && <TrophyConfetti />}

      <header>
        <h1 className="title">Outubro Rosa, ame-se, {userName}!</h1>
        <p className="subtitle">
          Clique no círculo ao lado de cada aula para registrar que você treinou e receber sua mensagem e troféu do dia!
        </p>
      </header>

      {/* Routine Table */}
      <div className="routine-card">
        {/* Header */}
        <div className="routine-header">
          <div>
            <h2 className="routine-title">Poderosa<br /><span>{userRoutine === 'seca_tudo' ? 'SECA TUDO' : 'MAIS GOSTOSA'}</span></h2>
            <p className="routine-month">Mês: Outubro</p>
          </div>
          <p className="routine-quote">{routine.quote}</p>
        </div>

        {/* Weeks Grid */}
        <div className="routine-weeks-grid">
          {routine.weeks.map((weekData, wi) => (
            <div key={wi} className="routine-week">
              <div className="routine-week-label">{weekData.week}</div>
              <ul className="routine-class-list">
                {weekData.classes.map((cls, ci) => {
                  const globalIndex = routine.weeks.slice(0, wi).reduce((acc, w) => acc + w.classes.length, 0) + ci;
                  const done = completedClasses.includes(globalIndex);
                  return (
                    <li key={ci} className={`routine-class-item ${done ? 'done' : ''}`}>
                      <span className="routine-class-name">
                        {done && <Trophy size={15} className="inline-trophy" />}
                        {cls}
                      </span>
                      <button
                        className={`routine-circle ${done ? 'checked' : ''}`}
                        onClick={() => handleCircleClick(globalIndex, cls)}
                        title={done ? 'Concluído!' : 'Marcar como feito'}
                        disabled={done}
                      >
                        {done && <Check size={16} strokeWidth={3} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="routine-progress">
          <div className="routine-progress-bar">
            <div
              className="routine-progress-fill"
              style={{ width: `${(completedClasses.length / allClasses.length) * 100}%` }}
            />
          </div>
          <p className="routine-progress-text">
            {completedClasses.length} de {allClasses.length} aulas concluídas
            {completedClasses.length === allClasses.length && ' 🏆 Desafio concluído!'}
          </p>
        </div>
      </div>

      {/* History button */}
      <button className="history-btn" onClick={() => { playClickSound(); setIsHistoryOpen(true); }}>
        <BookOpen size={24} />
      </button>

      {/* Class completion modal */}
      {selectedClass && (
        <div className="modal-overlay" onClick={() => setSelectedClass(null)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <X size={24} cursor="pointer" color="var(--bordo)" onClick={() => setSelectedClass(null)} />
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <h2 style={{ color: 'var(--bordo)', fontFamily: 'Playfair Display', fontSize: '1.6rem' }}>
                {selectedClass.name}
              </h2>
            </div>

            <p className="message-text" style={{ marginBottom: '1.5rem' }}>
              "{dailyMessages[(selectedClass.index) % dailyMessages.length]}"
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <button className="btn-primary" onClick={handleCompleteClass}>
                ✅ Aula feita! Sou Poderosa!
              </button>
              <p style={{ color: 'var(--bordo-light)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Caso não tenha treinado ainda,{' '}
                <a
                  href="https://app.hub.la/m/8wzPHmtjkmHQiFx2OoTQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--bordo)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={playClickSound}
                >
                  acesse aqui: Bora Treinar 🔥
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Game Modal */}
      {activeGame && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Sparkles size={32} color="var(--gold)" />
            </div>
            <h2 className="title" style={{ fontSize: '2rem' }}>{activeGame.title}</h2>

            {!gameResult ? (
              <>
                <p className="subtitle" style={{ marginBottom: '2rem' }}>
                  Você completou mais um ciclo de 3 aulas! Escolha a opção que mais ressoa com você agora:
                </p>
                <div className="game-options-grid">
                  {activeGame.options.map(option => (
                    <button
                      key={option.id}
                      className="game-option-card"
                      onClick={() => handleGameOptionClick(option)}
                    >
                      {option.image ? (
                        <div className="game-option-image">
                          <img src={option.image} alt={option.label} />
                        </div>
                      ) : (
                        <div className="game-option-placeholder">
                          <span>?</span>
                        </div>
                      )}
                      <span className="game-option-label">{option.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="game-result">
                {gameResult.image && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <img src={gameResult.image} alt={gameResult.label} style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--pink-medium)' }} />
                  </div>
                )}
                <h3 style={{ color: 'var(--bordo-light)', marginBottom: '1rem' }}>{gameResult.label}</h3>
                <p className="message-text">"{gameResult.message}"</p>
                <button className="btn-primary" onClick={closeGame}>
                  Guardar no Coração
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Sidebar */}
      <div className={`history-sidebar ${isHistoryOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="history-title" style={{ margin: 0 }}>Diário da {userName}</h2>
          <X size={28} cursor="pointer" color="var(--bordo)" onClick={() => { playClickSound(); setIsHistoryOpen(false); }} />
        </div>

        {completedClasses.length === 0 && gameHistory.length === 0 ? (
          <p style={{ color: 'var(--bordo-light)', fontStyle: 'italic', textAlign: 'center', marginTop: '3rem' }}>
            Ainda não há memórias guardadas. Complete uma aula para começar!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {completedClasses.length > 0 && (
              <div>
                <h3 style={{ color: 'var(--bordo-light)', marginBottom: '1rem', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Aulas Concluídas
                </h3>
                {[...completedClasses].sort((a, b) => a - b).map(idx => (
                  <div key={`cls-${idx}`} className="history-item">
                    <div className="history-day">✅ {allClasses[idx]}</div>
                    <p className="history-text">"{dailyMessages[idx % dailyMessages.length]}"</p>
                  </div>
                ))}
              </div>
            )}

            {gameHistory.length > 0 && (
              <div>
                <h3 style={{ color: 'var(--bordo-light)', marginBottom: '1rem', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Minhas Intuições
                </h3>
                {gameHistory.map((historyItem, idx) => (
                  <div key={`game-${idx}`} className="history-item" style={{ borderLeftColor: 'var(--gold)' }}>
                    <div className="history-day">{historyItem.gameTitle} — {historyItem.optionLabel}</div>
                    <p className="history-text">"{historyItem.message}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <footer style={{ marginTop: '3rem', paddingBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <img
          src="/patricia_dias.png"
          alt="Patricia Dias"
          style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--bordo)', boxShadow: '0 4px 10px rgba(128, 0, 32, 0.2)' }}
        />
        <div style={{ textAlign: 'left', fontFamily: 'Playfair Display', fontStyle: 'italic', color: 'var(--bordo)', fontSize: '1.2rem' }}>
          Com amor, Patricia Dias<br />
          <span style={{ fontWeight: 600, fontSize: '1rem', fontStyle: 'normal', fontFamily: 'Outfit' }}>Clube das Poderosas</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
