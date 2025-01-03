import React, { useState, useEffect } from 'react';
import poolsConfig from '../../config/poolsConfig';
import './Transactions.css';

const Transactions = ({ activeTab, setActiveTab }) => {
    const [transactionsByPool, setTransactionsByPool] = useState({});

    useEffect(() => {
        const generateTransaction = (poolName) => {
            const randomAmount = Math.floor(Math.random() * 10) + 1; // Number of tickets (1-10)
            const randomPrice = (Math.random() * 0.001).toFixed(6);
            const randomTime = `${Math.floor(Math.random() * 60)}s ago`;

            let classificationEmoji;
            if (randomAmount <= 2) {
                classificationEmoji = '🦐'; // Shrimp
            } else if (randomAmount <= 5) {
                classificationEmoji = '🐟'; // Fish
            } else {
                classificationEmoji = '🦈'; // Shark
            }

            return {
                poolName,
                time: randomTime,
                ticketsBought: `x${randomAmount}`,
                price: `$${randomPrice}`,
                classification: classificationEmoji,
            };
        };

        const interval = setInterval(() => {
            setTransactionsByPool((prev) => {
                const updated = { ...prev };
                poolsConfig.forEach((pool) => {
                    const poolName = pool.name;
                    if (!updated[poolName]) updated[poolName] = [];
                    updated[poolName] = [
                        generateTransaction(poolName),
                        ...updated[poolName].slice(0, 24), // Limit to 25 transactions per pool
                    ];
                });
                return updated;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const allTransactions = Object.values(transactionsByPool).flat();

    const transactionsToDisplay =
        activeTab === 'all'
            ? allTransactions
            : transactionsByPool[activeTab] || [];

    const ticketsRemaining = (poolName) => {
        const pool = poolsConfig.find((p) => p.name === poolName);
        return pool ? pool.totalTickets - 50 : 'N/A';
    };

    return (
        <div className="transactions-section">
            {/* Static Titles */}
            <div className="pool-title-container">
                <h2 className="pool-title">
                    {activeTab === 'all' ? 'All Pools' : activeTab}
                </h2>
                {activeTab !== 'all' && (
                    <p className="pool-tickets-remaining">
                        {ticketsRemaining(activeTab)} Tickets Remaining
                    </p>
                )}
            </div>

            {/* Tabs Section */}
            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Pools
                    </button>
                    {poolsConfig.map((pool) => (
                        <button
                            key={pool.name}
                            className={`tab-button ${activeTab === pool.name ? 'active' : ''}`}
                            onClick={() => setActiveTab(pool.name)}
                        >
                            {pool.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions Table */}
            <div className="transactions-table-container">
                <table className="transaction-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Tickets Bought</th>
                            <th>Classification</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactionsToDisplay.map((tx, index) => (
                            <tr key={index}>
                                <td className="time">{tx.time}</td>
                                <td className="tickets-bought">{tx.ticketsBought}</td>
                                <td className="classification">{tx.classification}</td>
                                <td className="price">{tx.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Transactions;
