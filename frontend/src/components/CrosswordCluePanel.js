function CluePanel({ clues, completedWords, language }) {
  const orientationText = {
    hi: {
      across: 'आड़ा',
      down: 'खड़ा',
    },
    te: {
      across: 'అడ్డంగా',
      down: 'నిలువుగా',
    },
  };

  return (
    <section className="card clue-card">
      <h3>Picture Clues</h3>
      <div className="clue-list">
        {clues.map((clue) => {
          const done = completedWords.includes(clue.id);
          return (
            <div key={clue.id} className={done ? 'clue-item done' : 'clue-item'}>
              <div className="emoji">{clue.clue}</div>
              <div>
                <p>
                  {orientationText[language][clue.orientation]} • {clue.letters.length} letters
                </p>
                <div className="blanks">{clue.letters.map((_, idx) => <span key={idx}>_</span>)}</div>
              </div>
              {done ? <span className="star">⭐</span> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CluePanel;
