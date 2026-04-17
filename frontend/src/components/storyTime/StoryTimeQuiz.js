import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { storyTimeData } from '../../data/storyTimeData';
import Confetti from 'react-confetti';
import { saveStars } from '../../hooks/useGameProgress';
import './StoryTime.css';

const StoryTimeQuiz = () => {
    const { storyId } = useParams();
    const navigate = useNavigate();
    const story = storyTimeData.find(s => s.id === storyId);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    if (!story) return <div>Story not found</div>;

    const currentQ = story.quiz[currentQIndex];

    const handleOptionSelect = (index) => {
        if (selectedOption !== null) return; // Prevent multiple clicks
        setSelectedOption(index);

        if (index === currentQ.correctIndex) {
            setScore(prev => prev + 1);
        }

        setTimeout(() => {
            setSelectedOption(null);
            if (currentQIndex < story.quiz.length - 1) {
                setCurrentQIndex(prev => prev + 1);
            } else {
                const finalScore = score + (index === currentQ.correctIndex ? 1 : 0);
                const stars = finalScore === story.quiz.length ? 3 : finalScore >= Math.ceil(story.quiz.length / 2) ? 2 : 1;
                saveStars('story-time', stars);
                setShowResults(true);
            }
        }, 1500);
    };

    if (showResults) {
        return (
            <div className="quiz-results">
                <Confetti width={window.innerWidth} height={window.innerHeight} />
                <h1>Quiz Complete!</h1>
                <h2>You scored {score} out of {story.quiz.length} 🌟</h2>
                <button onClick={() => navigate('/story-time')}>Back to Story Hub</button>
            </div>
        );
    }

    return (
        <div className="story-quiz-container">
            <div className="quiz-card">
                <h3>Question {currentQIndex + 1} of {story.quiz.length}</h3>
                <h2>{currentQ.question}</h2>
                <div className="options-grid">
                    {currentQ.options.map((opt, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ scale: selectedOption === null ? 1.02 : 1 }}
                            whileTap={{ scale: selectedOption === null ? 0.98 : 1 }}
                            className={`quiz-option ${selectedOption !== null
                                ? i === currentQ.correctIndex
                                    ? 'correct'
                                    : selectedOption === i
                                        ? 'incorrect'
                                        : ''
                                : ''
                                }`}
                            onClick={() => handleOptionSelect(i)}
                        >
                            {opt}
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StoryTimeQuiz;
