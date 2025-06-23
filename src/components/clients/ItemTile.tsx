import React, { useRef, forwardRef, useImperativeHandle } from "react";
import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableHighlight,
  TouchableHighlightProps,
  ViewStyle,
} from "react-native";
import { ListItem } from "@rneui/themed";
import { globalStyles } from "../../constants/GlobalStyles";
import { AppColors } from "../../constants/AppColors";
import HighlightedText from "./HighlightedText";
import { TextInputRef } from "../Inputs/CustomInput";

type Props = {
  query?: string;
  title: string;
  subtitle?: string;
  clickable?: boolean;
  editable?: boolean;
  LeftIcon?: React.ComponentType<any>;
  RightIcon?: React.ComponentType<any>;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
} & TouchableHighlightProps &
  TextInputProps;

const ItemTile = (props: Props) => {
  const {
    query = "",
    onPress,
    title,
    subtitle,
    editable = false,
    LeftIcon,
    RightIcon,
    titleStyle,
    clickable = true,
    containerStyle,
    onChangeText,
    value: textInputValue = "",
    onFocus,
  } = props;

  const handlePress = (e: GestureResponderEvent) => {
    if (clickable) {
      onPress?.(e);
    }
  };

  return (
    <TouchableHighlight
      onPress={handlePress}
      underlayColor={clickable ? undefined : "transparent"}
    >
      <ListItem containerStyle={containerStyle}>
        {LeftIcon && <LeftIcon />}
        <ListItem.Content>
          <ListItem.Title style={[globalStyles.textBold, titleStyle]}>
            {editable ? (
              <TextInput
                style={[globalStyles.textBold, titleStyle, { width: "100%" }]}
                value={textInputValue}
                onChangeText={onChangeText}
                onFocus={onFocus}
                placeholder="Other"
                placeholderTextColor={AppColors.grayPlaceholder}
              />
            ) : (
              <HighlightedText
                highlightStyle={{ backgroundColor: "yellow" }}
                searchWords={[query]}
                textToHighlight={title}
              />
            )}
          </ListItem.Title>
          {subtitle && (
            <ListItem.Subtitle
              style={[globalStyles.textRegular, styles.subtitle]}
            >
              <HighlightedText
                highlightStyle={{ backgroundColor: "yellow" }}
                searchWords={[query]}
                textToHighlight={subtitle}
              />
            </ListItem.Subtitle>
          )}
        </ListItem.Content>
        {RightIcon ? <RightIcon /> : <ListItem.Chevron />}
      </ListItem>
    </TouchableHighlight>
  );
};

export default ItemTile;

const styles = StyleSheet.create({
  subtitle: {
    color: AppColors.primaryDarkGray,
  },
});
