import { AppColors } from "./AppColors";
import { lightColors as rnuiLightcolors, darkColors as rnuiDarkColors, Colors } from "@rneui/themed";

export const lightColors: Colors = {
  ...rnuiLightcolors,
  background: AppColors.whitePrimary,
  black: AppColors.darkBluePrimary,
  placeholder: "rgba(0, 0, 0, 0.35)",
  textInput: AppColors.textInput,
  transparent: AppColors.transparent,
};

export const darkColors: Colors = {
  ...rnuiDarkColors,
  background: 'rgb(29, 30, 36)',
  black: AppColors.whitePrimary,
  placeholder: "rgba(255, 255, 255, 0.35)",
  textInput: AppColors.textInput,
  disabled: AppColors.grayPlaceholder,
  transparent: AppColors.transparent,
};