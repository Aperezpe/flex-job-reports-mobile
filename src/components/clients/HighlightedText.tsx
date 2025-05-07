import { findAll } from "highlight-words-core";
import React from "react";
import { StyleProp, Text, TextStyle } from "react-native";

interface HighlightedTextProps {
  autoEscape?: boolean;
  highlightStyle?: StyleProp<TextStyle>;
  searchWords: string[];
  textToHighlight: string;
  sanitize?: ((text: string) => string) | undefined;
  style?: StyleProp<TextStyle>;
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
