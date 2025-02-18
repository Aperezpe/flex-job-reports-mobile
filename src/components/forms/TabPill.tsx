import { Alert, Text, TouchableOpacity, View } from "react-native";
import React, { useRef, useState } from "react";
import { TabItemProps } from "@rneui/base";
import { makeStyles } from "@rneui/themed";
import { globalStyles } from "../../constants/GlobalStyles";
import { TextInput } from "react-native-gesture-handler";
import { AntDesign } from "@expo/vector-icons";

type Props = { edit?: boolean; onDelete?: () => void } & TabItemProps;

type StypeProps = {
  isFocused?: boolean;
};

const TabPill = ({ title, onPress, edit = false, onDelete }: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const styles = useStyles({ isFocused });

  const [content, setContent] = useState<string>("");
  const [width, setWidth] = useState<number>(50);
  const textRef = useRef<Text | null>(null);

  const updateWidth = () => {
    if (textRef.current) {
      textRef.current.measure((_, __, measuredWidth) => {
        setWidth(measuredWidth);
      });
    }
  };

  const handleDelete = () => {
    if (!content) onDelete?.();
    else
      Alert.alert(
        "Are you sure?",
        "You will remove this section of the form.",
        [
          {
            text: "Cancel",
          },
          {
            isPreferred: true,
            text: "Remove",
            style: "destructive",
            onPress: onDelete,
          },
        ]
      );
  };

  if (edit) {
    return (
      <View style={[globalStyles.row, styles.container]}>
        <Text
          ref={textRef}
          style={[
            globalStyles.textBold,
            styles.hiddenText,
            { position: "absolute", opacity: 0 },
          ]}
          onLayout={updateWidth}
        >
          {content || "A"}
        </Text>
        <TextInput
          style={[globalStyles.textBold, styles.text, { width }]}
          value={content}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={(text) => {
            setContent(text);
            updateWidth();
          }}
          autoCapitalize={"words"}
          autoFocus
        />
        <AntDesign
          name="closecircle"
          color={styles.removeIcon.backgroundColor}
          size={18}
          onPress={handleDelete}
        />
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={[globalStyles.textBold, styles.text]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default TabPill;

const useStyles = makeStyles((theme, { isFocused }: StypeProps) => ({
  container: {
    justifyContent: "space-between",
    backgroundColor: isFocused ? theme.colors.black : theme.colors.background,
    borderColor: theme.colors.black,
    borderWidth: 3,
    padding: 7,
    paddingHorizontal: 10,
    paddingStart: 15,
    borderRadius: 25,
  },
  text: {
    color: isFocused ? theme.colors.white : theme.colors.black,
  },
  hiddenText: {
    paddingLeft: 15,
  },
  removeIcon: {
    backgroundColor: theme.colors.platform.ios.error,
  },
}));
