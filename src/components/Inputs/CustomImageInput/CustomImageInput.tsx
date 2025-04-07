import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { globalStyles } from "../../../constants/GlobalStyles";
import AddRemoveButton from "../../AddRemoveButton";
import { AppColors } from "../../../constants/AppColors";
import AttachedImage from "./AttachedImage";

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

  /**
   * Updates or inserts an image URI into the list of image URIs.
   *
   * @param newUri - The new image URI to be added or updated.
   * @param index - (Optional) The index of the URI to be updated. If not provided, the new URI will be appended to the list.
   *
   * @remarks
   * - If an `index` is provided, the URI at the specified index will be replaced with `newUri`.
   * - If no `index` is provided, `newUri` will be added to the end of the list.
   * - The updated list of URIs is passed to the `onImageSelected` callback.
   *
   * @example
   * ```typescript
   * // Add a new URI to the list
   * upsertImageUri('https://example.com/image1.jpg');
   *
   * // Update the URI at index 0
   * upsertImageUri('https://example.com/image2.jpg', 0);
   * ```
   */
  const upsertImageUri = (newUri: string, index?: number) => {
    setImageUris((uris) => {
      const updatedUris = index !== undefined
        ? uris.map((uri, i) => (i === index ? newUri : uri))
        : [...uris, newUri];
      onImageSelected(updatedUris);
      return updatedUris;
    });
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

      upsertImageUri(uri);
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
          <AttachedImage
            index={index}
            imageUri={imageUri}
            onRemoveImage={removeImage}
            updateImageUri={upsertImageUri}
          />
        )}
        keyExtractor={(item) => item} // Use the image URI as a stable key
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

  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});

export default CustomImageInput;
