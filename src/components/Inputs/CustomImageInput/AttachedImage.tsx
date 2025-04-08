import { StyleSheet, View, Modal, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "../../CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { AppColors } from "../../../constants/AppColors";
import * as ImageManipulator from "expo-image-manipulator";
import { useImageManipulator } from "expo-image-manipulator";
import { supabase } from "../../../config/supabase";
import { BLUR_HASH, STORAGE_BUCKET } from "../../../constants";
import { Image } from "expo-image";

type Props = {
  imageUri: string;
  index: number;
  onRemoveImage: (index: number) => void;
  updateImageUri: (newUri: string, index: number) => void;
  editable?: boolean;
};

const AttachedImage = ({
  imageUri,
  index,
  onRemoveImage,
  updateImageUri,
  editable = true,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [signedUri, setSignedUri] = useState<string>();
  const [isModalVisible, setModalVisible] = useState(false);
  const context = useImageManipulator(imageUri);

  

  useEffect(() => {
    const fetchSignedUrl = async () => {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(imageUri, 60);
      if (error) {
        console.error("Error fetching signed URL:", error);
      } else {
        setSignedUri(data.signedUrl);
      }
      setLoading(false);
    };
    if (imageUri && !editable) {
      fetchSignedUrl();
    }
  }, [imageUri]);

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
    if (imageUri && !imageUri.split(".").pop()?.includes("webp")) {
      handleImageManipulation();
    }
  }, [imageUri, context, context.renderAsync]);

  if (loading) {
    return (
      <Image
        source={null}
        style={styles.imagePreview}
        placeholder={{blurhash:BLUR_HASH}}
        contentFit="cover"
        transition={1000}
      />
    );
  }

  return (
    <View style={styles.imageContainer}>
      {editable && (
        <CustomButton
          primary
          buttonContainerStyle={styles.closeButtonStyle}
          buttonStyle={{ padding: 0 }}
          buttonTextStyle={{ paddingHorizontal: 5 }}
          onPress={() => onRemoveImage(index)}
        >
          <Ionicons name="close" size={18} color={AppColors.darkBluePrimary} />
        </CustomButton>
      )}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image
          source={{ uri: signedUri || imageUri }}
          style={styles.imagePreview}
          placeholder={{blurhash:BLUR_HASH}}
          contentFit="cover"
          transition={1000}
        />
      </TouchableOpacity>
      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={30} color={AppColors.whitePrimary} />
          </TouchableOpacity>
          <Image
            source={{ uri: signedUri || imageUri }}
            style={styles.fullscreenImage}
            contentFit="contain" // Ensure the image scales properly
            placeholder={{blurhash: BLUR_HASH}}
            onError={(error) => {
              console.error("Failed to load full-screen image:", error);
            }}
          />
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  fullscreenImage: {
    width: "100%", // Use full width
    height: "100%", // Use full height
  },
});
