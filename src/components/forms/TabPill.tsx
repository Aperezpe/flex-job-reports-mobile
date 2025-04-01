import { Alert, Pressable, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { TabItemProps } from "@rneui/base";
import { makeStyles } from "@rneui/themed";
import { globalStyles } from "../../constants/GlobalStyles";
import { TextInput } from "react-native-gesture-handler";
import { AntDesign } from "@expo/vector-icons";
import { FormSection } from "../../types/SystemForm";

type Props = {
  edit?: boolean;
  onDelete?: (sectionId: number) => void;
  isSelected: boolean;
  onChangeText?: (text: string, sectionId: number) => void;
  section: FormSection;
} & TabItemProps;

const TabPill = ({
  section,
  onPress,
  isSelected,
  edit = false,
  onDelete,
  onFocus,
  onChangeText,
}: Props) => {
  const styles = useStyles({ isSelected });

  const [width, setWidth] = useState<number>(50);
  const textInputRef = useRef<TextInput | null>(null);
  const textRef = useRef<Text | null>(null);

  useEffect(() => {
    if (isSelected) {
      textInputRef.current?.focus();
    }
  }, [isSelected]);

  const updateWidth = () => {
    if (textRef.current) {
      textRef.current.measure((_, __, measuredWidth) => {
        setWidth(measuredWidth);
      });
    }
  };

  const handleDelete = () => {
    if (section.title) {
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
            onPress: () => onDelete?.(section.id),
          },
        ]
      );
      return;
    }

    onDelete?.(section.id);
  };

  if (edit) {
    return (
      <Pressable style={[globalStyles.row, styles.container]} onPress={onPress}>
        <Text
          ref={textRef}
          style={[
            globalStyles.textBold,
            styles.hiddenText,
            { position: "absolute", opacity: 0 },
          ]}
          onLayout={updateWidth}
        >
          {section.title || "A"}
        </Text>
        <TextInput
          ref={textInputRef}
          style={[globalStyles.textBold, styles.text, { width }]}
          value={section.title}
          onFocus={(e) => {
            onFocus?.(e);
          }}
          onChangeText={(text) => {
            onChangeText?.(text, section.id);
            updateWidth();
          }}
          autoCapitalize={"words"}
          autoFocus={isSelected}
        />
        <AntDesign
          name="closecircle"
          color={styles.removeIcon.backgroundColor}
          size={18}
          onPress={handleDelete}
        />
      </Pressable>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={[globalStyles.textBold, styles.text]}>{section.title}</Text>
    </TouchableOpacity>
  );
};

export default TabPill;

type StypeProps = {
  isSelected?: boolean;
};

const useStyles = makeStyles((theme, { isSelected }: StypeProps) => ({
  container: {
    justifyContent: "space-between",
    backgroundColor: isSelected ? theme.colors.black : theme.colors.background,
    borderColor: theme.colors.black,
    borderWidth: 3,
    padding: 7,
    paddingHorizontal: 10,
    paddingStart: 15,
    borderRadius: 25,
  },
  text: {
    color: isSelected ? theme.colors.white : theme.colors.black,
  },
  hiddenText: {
    paddingLeft: 15,
  },
  removeIcon: {
    backgroundColor: theme.colors.platform.ios.error,
  },
}));
