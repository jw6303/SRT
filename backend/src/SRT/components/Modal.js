import React, { useState } from 'react';
import { syntaxHighlight } from '../utils/syntaxHighlighter';
import './TerminalProgressBar.css'; // For terminal-style progress bar animation

const Modal = ({ pool, onClose }) => {
    const [ticketCount, setTicketCount] = useState(1);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [warning, setWarning] = useState(false);

    // Calculate Progress
    const ticketsSold = 50; // Replace with dynamic data if available
    const progress = (ticketsSold / pool.totalTickets) * 100;

    const handleConfirm = () => {
        if (!selectedAnswer) {
            setWarning(true);
            setTimeout(() => setWarning(false), 3000); // Auto-hide warning after 3 seconds
            return;
        }

        alert(`You entered ${ticketCount} tickets for ${pool.name} with the answer: ${selectedAnswer}`);
        onClose();
    };

    const handleSliderChange = (event) => {
        const value = parseInt(event.target.value, 10);
        setTicketCount(value);
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* Close Button */}
                <button style={styles.closeButton} onClick={onClose}>
                    &times;
                </button>

                {/* Pool Image */}
                <img src={pool.image} alt={pool.name} style={styles.image} />

                {/* Pool Details */}
                <h2 style={styles.title}>{pool.name}</h2>
                <div style={styles.section}>
                    <p style={styles.detail}>
                        <strong>Live Draw:</strong>{' '}
                        {syntaxHighlight('date', new Date(pool.endTime).toLocaleString())}
                    </p>
                    <p style={styles.detail}>
                        <strong>Tickets Sold:</strong>{' '}
                        {syntaxHighlight('tickets', `${ticketsSold} / ${pool.totalTickets}`)}
                    </p>

                    {/* Terminal-Like Progress Bar */}
                    <div className="terminal-progress-bar">
                        <div
                            className="terminal-progress-fill"
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Divider */}
                <hr style={styles.divider} />

                {/* Question Section */}
                <div style={styles.section}>
                    <p style={styles.question}>
                        <strong>What is the capital city of England?</strong>
                    </p>
                    <div style={styles.answerOptions}>
                        {['Belfast', 'London', 'Dublin'].map((answer, index) => (
                            <button
                                key={index}
                                style={{
                                    ...styles.answerButton,
                                    backgroundColor: selectedAnswer === answer ? '#007BFF' : '#ddd',
                                    color: selectedAnswer === answer ? '#fff' : '#000',
                                }}
                                onClick={() => setSelectedAnswer(answer)}
                            >
                                {answer}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <hr style={styles.divider} />

                {/* Ticket Selection */}
                <div style={styles.section}>
                    <p>
                        <strong>{syntaxHighlight('number', ticketCount)} Tickets</strong>
                    </p>
                    <input
                        type="range"
                        min="1"
                        max={pool.entryCap}
                        value={ticketCount}
                        onChange={handleSliderChange}
                        style={styles.slider}
                    />
                    <div style={styles.ticketButtons}>
                        <button
                            style={styles.ticketButton}
                            onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                        >
                            -
                        </button>
                        <button
                            style={styles.ticketButton}
                            onClick={() => setTicketCount(Math.min(pool.entryCap, ticketCount + 1))}
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Warning Message */}
                {warning && <p style={styles.warningText}>Please select an answer to proceed.</p>}

                {/* Confirm Button */}
                <button style={styles.confirmButton} onClick={handleConfirm}>
                    Add to Basket
                </button>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: '#1E1E1E', // Dark gray for terminal background
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '500px',
        width: '90%',
        color: '#CCCCCC',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
    },
    closeButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '20px',
        color: '#FFFFFF',
        cursor: 'pointer',
    },
    image: {
        width: '100%',
        height: '500px',
        objectFit: 'cover',
        borderRadius: '8px',
        marginBottom: '15px',
    },
    title: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: '15px',
    },
    section: {
        marginBottom: '20px',
    },
    detail: {
        fontSize: '16px',
        marginBottom: '10px',
    },
    divider: {
        border: 'none',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        margin: '20px 0',
    },
    slider: {
        width: '100%',
        margin: '10px 0',
    },
    ticketButtons: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '10px',
    },
    ticketButton: {
        padding: '5px 10px',
        backgroundColor: '#333',
        border: '1px solid #555',
        borderRadius: '5px',
        color: '#FFF',
        cursor: 'pointer',
    },
    warningText: {
        color: '#FF0000',
        fontSize: '19px',
        marginTop: '10px',
    },
    confirmButton: {
        padding: '12px 20px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
    },
};

export default Modal;
