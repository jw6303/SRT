
import React from 'react';

const PoolCard = ({ pool, onEnter }) => {
    const ticketsSold = 50; // Replace with dynamic data if available
    const progress = (ticketsSold / pool.totalTickets) * 100;

    return (
        <div style={styles.card}>
            {/* Pool Image */}
            <div style={styles.imageContainer}>
                <img
                    src={pool.image}
                    alt={pool.name}
                    style={styles.image}
                />
            </div>

            {/* Pool Details */}
            <div style={styles.details}>
                <h3 style={styles.title}>{pool.name}</h3>
                <p style={styles.detail}>
                    <span className="syntax-yellow">Price:</span> {pool.priceInSol} SOL
                </p>
                <p style={styles.detail}>
                    <span className="syntax-green">Prize:</span> {pool.prize}
                </p>
                <p style={styles.detail}>
                    <span className="syntax-cyan">Tickets Sold:</span> {ticketsSold} / {pool.totalTickets}
                </p>

                {/* Progress Bar */}
                <div style={styles.progressBarContainer}>
                    <div style={{ ...styles.progressBar, width: `${progress}%` }} />
                </div>

                {/* Enter Button */}
                <button style={styles.enterButton} onClick={onEnter}>
                    ENTER
                </button>
            </div>
        </div>
    );
};

const styles = {
    card: {
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '10px',
        backgroundColor: '#2D2D2D',
        color: '#CCCCCC',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
        maxWidth: '300px',
        margin: '10px auto',
        display: 'flex',
        flexDirection: 'column',
    },
    cardHover: {
        transform: 'scale(1.03)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
    },
    imageContainer: {
        width: '100%',
        height: '200px',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    details: {
        padding: '15px',
        textAlign: 'center',
    },
    title: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#FFFFFF',
    },
    detail: {
        fontSize: '14px',
        marginBottom: '8px',
    },
    progressBarContainer: {
        backgroundColor: '#444',
        borderRadius: '10px',
        overflow: 'hidden',
        height: '10px',
        margin: '10px 0',
    },
    progressBar: {
        backgroundColor: '#28a745',
        height: '100%',
        transition: 'width 0.5s ease-in-out',
    },
    enterButton: {
        padding: '10px 20px',
        backgroundColor: '#007BFF',
        color: '#FFFFFF',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.2s ease',
    },
    enterButtonHover: {
        backgroundColor: '#0056b3',
    },
};

export default PoolCard;
