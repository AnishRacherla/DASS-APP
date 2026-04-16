function CrosswordGrid({ grid, cellState, selectedCell, onCellClick }) {
  return (
    <section className="card grid-card">
      <h3>Crossword</h3>
      <div className="crossword-grid">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            if (!cell) {
              return <div key={key} className="grid-cell blocked" />;
            }

            const state = cellState[key] || { value: '', status: 'idle', shake: 0 };
            const isSelected = selectedCell === key;
            const className = [
              'grid-cell',
              state.status,
              isSelected ? 'selected' : '',
              state.status === 'wrong' ? 'shake' : '',
            ]
              .join(' ')
              .trim();

            return (
              <button
                key={key}
                type="button"
                className={className}
                onClick={() => onCellClick(key)}
                aria-pressed={isSelected}
                title={`Cell ${rowIndex + 1}, ${colIndex + 1}`}
              >
                {state.value}
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

export default CrosswordGrid;
