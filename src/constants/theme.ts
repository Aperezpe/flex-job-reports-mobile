import { AppColors } from "./AppColors";
import { lightColors as rnuiLightcolors, darkColors as rnuiDarkColors, Colors } from "@rneui/themed";

export const lightColors: Colors = {
  ...rnuiLightcolors,
  background: AppColors.whitePrimary,
  highlightOpacity: `rgba(0, 0, 0, 0.1)`,
  black: AppColors.darkBluePrimary,
  placeholder: "rgba(0, 0, 0, 0.35)",
  textInput: AppColors.textInput,
  transparent: AppColors.transparent,
  modalOverlay: AppColors.modalOverlay,
  modalBackground: AppColors.whitePrimary,
  blueOpacity: AppColors.blueOpacity,
  secondary: AppColors.orange,
};

export const darkColors: Colors = {
  ...rnuiDarkColors,
  background: 'rgb(29, 30, 36)',
  black: AppColors.whitePrimary,
  placeholder: "rgba(255, 255, 255, 0.35)",
  highlightOpacity: `rgba(255,255,255, 0.1)`,
  textInput: AppColors.textInput,
  disabled: AppColors.grayPlaceholder,
  transparent: AppColors.transparent,
  modalOverlay: AppColors.modalOverlay,
  modalBackground: 'rgb(73, 73, 84)',
  blueOpacity: AppColors.blueOpacity,
  secondary: AppColors.orange,
};