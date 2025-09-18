'use client';

import React, { useState } from 'react';
import QuizList from './components/QuizList';
import QuizSession from './components/QuizSession';
import QuizErrorBoundary from './components/QuizErrorBoundary';

type ViewState = 'list' | 'quiz';

const Quiz = () => {
    const [currentView, setCurrentView] = useState<ViewState>('list');
    const [activeQuizCode, setActiveQuizCode] = useState<string>('');
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null);

    const handleQuizStart = (quizCode: string) => {
        setActiveQuizCode(quizCode);
        setActiveSessionId(null); // Clear session ID when starting new quiz
        setCurrentView('quiz');
    };

    const handleSessionContinue = (sessionId: number) => {
        setActiveSessionId(sessionId);
        setActiveQuizCode(''); // Clear quiz code when continuing session
        setCurrentView('quiz');
    };

    const handleQuizComplete = () => {
        setActiveQuizCode('');
        setActiveSessionId(null);
        setCurrentView('list');
    };

    const handleQuizExit = () => {
        setActiveQuizCode('');
        setActiveSessionId(null);
        setCurrentView('list');
    };

    // Render the appropriate view based on current state
    const renderCurrentView = () => {
        switch (currentView) {
            case 'quiz':
                return (
                    <QuizSession 
                        quizCode={activeQuizCode}
                        sessionId={activeSessionId}
                        onComplete={handleQuizComplete}
                        onExit={handleQuizExit}
                    />
                );
            case 'list':
            default:
                return (
                    <QuizList 
                        onQuizStart={handleQuizStart} 
                        onSessionContinue={handleSessionContinue}
                    />
                );
        }
    };

    return (
        <QuizErrorBoundary>
            {renderCurrentView()}
        </QuizErrorBoundary>
    );
};

export default Quiz;
