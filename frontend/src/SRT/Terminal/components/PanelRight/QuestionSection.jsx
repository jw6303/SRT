// QuestionSection.jsx
import React from "react";

const QuestionSection = ({ question, selectedAnswer, setSelectedAnswer, addLog }) => (
  question.text && (
    <div className="question-section tree-branch">
      <p>
        <span className="tree-key">Question:</span> {question.text}
        <span className="required-indicator"> *</span>
      </p>
      {question.options?.map((option, index) => (
        <label key={index} className="answer-option">
          <input
            type="radio"
            name="question"
            value={option}
            checked={selectedAnswer === option}
            onChange={() => {
              setSelectedAnswer(option);
              addLog(`Answer selected: ${option}`, "info");
            }}
          />
          {option}
        </label>
      ))}
    </div>
  )
);

export default QuestionSection;
