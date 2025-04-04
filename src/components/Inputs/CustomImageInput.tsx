import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { globalStyles } from "../../constants/GlobalStyles";
import AddRemoveButton from "../AddRemoveButton";
import CustomButton from "../CustomButton";
import { AppColors } from "../../constants/AppColors";

type CustomImageInputProps = {
  onImageSelected: (uris: string[]) => void;
  errorMessage?: string;
  label?: string;
};

const CustomImageInput: React.FC<CustomImageInputProps> = ({
  onImageSelected,
  errorMessage,
  label,
}) => {
  const [imageUris, setImageUris] = useState<string[]>([]);

  const removeImage = (index: number) => {
    setImageUris((uris) => uris.filter((_, i) => i !== index));
  };

  const handleImagePicker = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      // Compress the image
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Resize to a width of 800px (adjust as needed)
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } // Compress to 50% quality
      );
      const fileInfo = await FileSystem.getInfoAsync(compressedImage.uri);
      console.log(`Compressed image size: ${JSON.stringify(fileInfo)} bytes`);

      setImageUris((prevUris) => {
        const updatedUris = [...prevUris, compressedImage.uri];
        onImageSelected(updatedUris); // Pass the updated list of URIs to the parent
        return updatedUris;
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={globalStyles.row}>
        <Text
          style={[globalStyles.textBold, { paddingBottom: 5, flexGrow: 1 }]}
        >
          {label}
        </Text>
        <AddRemoveButton
          color={AppColors.whitePrimary}
          backgroundColor={AppColors.bluePrimary}
          size={28}
          onPress={handleImagePicker}
        />
      </View>

      <FlatList
        data={imageUris}
        numColumns={3}
        renderItem={({ item: imageUri, index }) => (
          <View style={styles.imageContainer}>
            <CustomButton
              primary
              buttonContainerStyle={styles.closeButtonStyle}
              buttonStyle={{ padding: 0 }}
              buttonTextStyle={{ paddingHorizontal: 5 }}
              onPress={() => removeImage(index)}
            >
              <Ionicons
                name="close"
                size={18}
                color={AppColors.darkBluePrimary}
              />
            </CustomButton>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 10,
  },
  header: {
    flexGrow: 1,
  },
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
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});

export default CustomImageInput;
