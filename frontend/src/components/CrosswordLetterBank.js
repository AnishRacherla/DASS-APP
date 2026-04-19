function LetterBank({ letters, availableCount, onPick }) {
  const uniqueLetters = Array.from(new Set(letters));

  return (
    <section className="card bank-card">
      <h3>Letter Bank</h3>
      <div className="letter-bank">
        {uniqueLetters.map((letter) => {
          const left = availableCount[letter] || 0;
          return (
            <button
              key={letter}
              type="button"
              className="letter-btn"
              onClick={() => onPick(letter)}
              disabled={left <= 0}
            >
              <span>{letter}</span>
              <small>x{left}</small>
            </button>
          );
        })}
      </div>
      <p className="hint">Tap a box in crossword, then tap a letter.</p>
    </section>
  );
}

export default LetterBank;
