import syntaxRules from "./syntaxRules";

export const applySyntaxHighlighting = (text) => {
  let formattedText = text;

  syntaxRules.forEach(({ regex, className }) => {
    formattedText = formattedText.replace(
      regex,
      (match) => `<span class="${className}">${match}</span>`
    );
  });

  return formattedText;
};
