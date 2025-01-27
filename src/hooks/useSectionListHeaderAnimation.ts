import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

const useSectionListHeaderAnimation = (headerHeight: number) => {
  // Shared value for scroll position
  const scrollY = useSharedValue(0);

  // Scroll handler to update scrollY value
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  // Animated style based on scroll position
  const animatedHeaderStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 100], // Scroll range where the animation happens
      [0, -100], // Translation range (how much it moves up)
      Extrapolation.CLAMP
    );

    // Interpolate height (shrink as the user scrolls)
    const height = interpolate(
      scrollY.value,
      [0, 120], // Scroll range
      [headerHeight, 0], // height range (start at 100 and shrink to 50)
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
      height,
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    const paddingTop = interpolate(
      scrollY.value,
      [0, 100], // Scroll range where the animation happens
      [20, 0], // Translation range (how much it moves up)
      Extrapolation.CLAMP
    );

    return {
      paddingTop,
    };
  });


  return {
    onScroll,
    animatedHeaderStyle,
    animatedContainerStyle,
  };
}

export default useSectionListHeaderAnimation;