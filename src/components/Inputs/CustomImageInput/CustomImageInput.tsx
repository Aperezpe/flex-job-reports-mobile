import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { globalStyles } from "../../../constants/GlobalStyles";
import AddRemoveButton from "../../AddRemoveButton";
import { AppColors } from "../../../constants/AppColors";
import AttachedImage from "./AttachedImage";

type CustomImageInputProps = {
  onChange: (uris: string[]) => void;
  errorMessage?: string;
  value: string[];
  label?: string;
  description?: string;
  editable?: boolean;
};

const CustomImageInput: React.FC<CustomImageInputProps> = ({
  onChange,
  errorMessage,
  value = [],
  label,
  description,
  editable = true,
}) => {
  // const [imageUris, setImageUris] = useState<string[]>([]);

  const removeImage = (index: number) => {
    // setImageUris((uris) => uris.filter((_, i) => i !== index));
    onChange(value.filter((_, i) => i !== index));
  };

  // useEffect(() => {
  //   setImageUris(value);
  // }, []);

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
    const updatedUris =
      index !== undefined
        ? value.map((uri, i) => (i === index ? newUri : uri))
        : [...value, newUri];

    onChange(updatedUris);
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
        {editable && (
          <AddRemoveButton
            color={AppColors.whitePrimary}
            backgroundColor={AppColors.bluePrimary}
            size={28}
            onPress={handleImagePicker}
          />
        )}
      </View>
      <Text
        style={[
          globalStyles.textRegular,
          styles.description
        ]}
      >
        {description}
      </Text>

      <FlatList
        data={value}
        numColumns={3}
        renderItem={({ item: imageUri, index }) => (
          <AttachedImage
            index={index}
            imageUri={imageUri}
            editable={editable}
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
    alignItems: "flex-start",
    marginVertical: 10,
  },
  header: {
    flexGrow: 1,
  },
  description: {
    marginTop: -5
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});

export default CustomImageInput;
