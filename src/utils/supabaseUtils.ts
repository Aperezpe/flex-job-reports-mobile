import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import { supabase } from "../config/supabase";
import { STORAGE_BUCKET } from "../constants";

// Handles Upload image to supabase storage and returns the imageUri just uploaded
// Path for the file in storage will be {companyId}/{jobReportId}/{fieldId}/
export const getStoragePath = async (
  { localUri,
    companyId,
    jobReportId,
    fieldId,
  }:
    {
      localUri: string,
      companyId: string,
      jobReportId: string,
      fieldId: number,
    }
): Promise<string> => {
  try {
    // Validate the localUri
    if (!localUri) {
      console.error("Invalid localUri provided for image upload.");
      throw new Error("Invalid localUri. Cannot upload image.");
    }

    // Read the file as a Base64-encoded string using Expo's FileSystem
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Decode the Base64 string to an ArrayBuffer
    const arrayBuffer = decode(base64);

    const fileName = localUri.split("/").pop();
    const storageFilePath = `${companyId}/${jobReportId}/${fieldId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storageFilePath, arrayBuffer, {
        upsert: false,
      });

    if (error) {
      console.error("Image upload failed:", error.message);
      throw new Error("Failed to upload image");
    }

    return data.path;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Image upload failed");
  }
};
