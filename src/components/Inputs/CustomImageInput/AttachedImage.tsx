import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "../../CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { AppColors } from "../../../constants/AppColors";
import { Image } from "@rneui/themed";
import * as ImageManipulator from "expo-image-manipulator";
import { useImageManipulator } from "expo-image-manipulator";
import LoadingComponent from "../../LoadingComponent";

type Props = {
  imageUri: string;
  index: number;
  onRemoveImage: (index: number) => void;
  updateImageUri: (newUri: string, index: number) => void;
};

const AttachedImage = ({
  imageUri,
  index,
  onRemoveImage,
  updateImageUri,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const context = useImageManipulator(imageUri);

  const handleImageManipulation = async () => {
    setLoading(true);
    try {
      context.resize({ height: 1500 });
      const image = await context.renderAsync();
      const result = await image.saveAsync({
        compress: 0.2,
        format: ImageManipulator.SaveFormat.WEBP,
      });
      updateImageUri(result.uri, index);
    } catch (error) {
      console.error("Error manipulating image:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (imageUri && !imageUri.split('.').pop()?.includes('webp')) {
      handleImageManipulation();
    }
  }, [imageUri, context, context.renderAsync]);

  if (loading) {
    return (
      <View style={[styles.imagePreview, styles.imagePlaceholder]}>
        <LoadingComponent />
      </View>
    );
  }

  return (
    <View style={styles.imageContainer}>
      <CustomButton
        primary
        buttonContainerStyle={styles.closeButtonStyle}
        buttonStyle={{ padding: 0 }}
        buttonTextStyle={{ paddingHorizontal: 5 }}
        onPress={() => onRemoveImage(index)}
      >
        <Ionicons name="close" size={18} color={AppColors.darkBluePrimary} />
      </CustomButton>
      <Image source={{ uri: imageUri }} style={styles.imagePreview} />
    </View>
  );
};

export default AttachedImage;

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 15,
    resizeMode: "cover",
    margin: 5,
  },
  imagePlaceholder: {
    backgroundColor: AppColors.grayBackdrop,
  },
  closeButtonStyle: {
    borderRadius: 50,
    position: "absolute",
    right: 0,
    zIndex: 99999,
    margin: 10,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: AppColors.darkBluePrimary,
  },
});
