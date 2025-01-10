import { findAll } from "highlight-words-core";
import React from "react";
import { Text } from "react-native";

interface HighlightedTextProps {
  autoEscape?: boolean;
  highlightStyle?: any;
  searchWords: any;
  textToHighlight: any;
  sanitize?: any;
  style?: any;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({
  autoEscape,
  highlightStyle,
  searchWords,
  textToHighlight,
  sanitize,
  style,
  ...props
}) => {
  const chunks = findAll({
    textToHighlight,
    searchWords,
    sanitize,
    autoEscape,
  });

  return (
    <Text style={style} {...props}>
      {chunks.map((chunk, index) => {
        const text = textToHighlight.substr(
          chunk.start,
          chunk.end - chunk.start
        );

        return !chunk.highlight ? (
          text
        ) : (
          <Text key={index} style={chunk.highlight && highlightStyle}>
            {text}
          </Text>
        );
      })}
    </Text>
  );
};

export default HighlightedText;
