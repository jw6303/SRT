// src/utils/syntaxHighlighter.js
export const syntaxHighlight = (key, value) => {
    let color;
    if (typeof value === 'string') {
        color = '#7FDBFF'; // Cyan for strings
    } else if (typeof value === 'number') {
        color = '#FFDC00'; // Yellow for numbers
    } else {
        color = '#FFFFFF'; // Default white for other types
    }
    return (
        <span style={{ color }}>
            {typeof value === 'string' ? `"${value}"` : value}
        </span>
    );
};
