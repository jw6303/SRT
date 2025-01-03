import React from 'react';
import { syntaxHighlight } from '../utils/syntaxHighlighter';

const SyntaxHighlightPool = ({ pool }) => {
    return (
        <pre style={styles.container}>
            {'{'}
            {Object.entries(pool).map(([key, value], index) => (
                <div key={index} style={styles.line}>
                    <span style={styles.key}>{key}:</span>{' '}
                    {syntaxHighlight(key, value)},
                </div>
            ))}
            {'}'}
        </pre>
    );
};

const styles = {
    container: {
        backgroundColor: '#1E1E1E', // Terminal-style background
        color: '#CCCCCC',
        fontFamily: 'Courier, monospace',
        fontSize: '14px',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    line: {
        marginBottom: '5px',
    },
    key: {
        color: '#0074D9', // Blue for keys
    },
};

export default SyntaxHighlightPool;
