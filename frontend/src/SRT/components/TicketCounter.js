// frontend/src/blank/components/TicketCounter.js

import React from 'react';

const TicketCounter = ({ ticketCount, setTicketCount, maxTickets }) => {
    return (
        <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <button
                style={{
                    padding: '5px 10px',
                    backgroundColor: '#ddd',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginRight: '10px',
                }}
                onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
            >
                -
            </button>
            <span>{ticketCount}</span>
            <button
                style={{
                    padding: '5px 10px',
                    backgroundColor: '#ddd',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginLeft: '10px',
                }}
                onClick={() => setTicketCount(Math.min(maxTickets, ticketCount + 1))}
            >
                +
            </button>
        </div>
    );
};

export default TicketCounter;
