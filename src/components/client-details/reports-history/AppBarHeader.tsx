import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PlatformColor,
  Platform,
} from "react-native";
import { AntDesign, EvilIcons } from "@expo/vector-icons";
import DrawerMenu from "../../navigation/DrawerMenu";
import { AppColors } from "../../../constants/AppColors";
import { globalStyles } from "../../../constants/GlobalStyles";
import debounce from "lodash/debounce";

const HEADER_HEIGHT = 35;
const MARGING_TOP = -5;

const defaultNavigationFont = Platform.select({
  ios: "System",
  android: "sans-serif",
});

type Props = {
  onSearch?: (text: string) => void;
  onCancelSearch?: () => void;
}

const AppBarHeader = ({ onSearch, onCancelSearch  }: Props) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchText, setSearchText] = useState("");
  const fadeAnim = useState(new Animated.Value(0))[0];

  const showSearchBar = () => {
    setIsSearchActive(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideSearchBar = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsSearchActive(false);
      setSearchText("");
      debouncedSearch.cancel();
    });
  };

  const handleOnCancel = () => {
    setSearchText("")
    onCancelSearch?.()
  }

  const debouncedSearch = debounce((text: string) => {
    onSearch?.(text);
  }, 1250); // Adjust delay (ms) here

  useEffect(() => {
    debouncedSearch(searchText);
    return () => debouncedSearch.cancel();
  }, [searchText]);

  return (
    <>
      {!isSearchActive && (
        <View style={styles.topRow}>
          <DrawerMenu />
          <Text style={[globalStyles.textSemiBold, styles.title]}>
            Job Reports
          </Text>
          <TouchableOpacity onPress={showSearchBar}>
            <EvilIcons
              name="search"
              size={32}
              color={AppColors.bluePrimary}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
      )}

      {isSearchActive && (
        <Animated.View style={[styles.searchRow, { opacity: fadeAnim }]}>
          <View style={styles.searchInputWrapper}>
            <EvilIcons
              name="search"
              size={30}
              color={AppColors.grayPlaceholder}
            />
            <TextInput
              style={[globalStyles.textRegular, styles.searchInput]}
              placeholder="Search"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
            {searchText !== "" && (
              <TouchableOpacity onPress={handleOnCancel}>
                <AntDesign
                  name="closecircle"
                  size={17}
                  color={PlatformColor("systemGray")}
                  style={styles.clearIcon}
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={hideSearchBar}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: HEADER_HEIGHT,
    marginTop: MARGING_TOP,
  },
  title: {
    fontSize: 17,
    fontWeight: 600,
    fontFamily: defaultNavigationFont,
  },
  searchIcon: {
    marginLeft: -5,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: 'center',
    backgroundColor: AppColors.grayBackdrop,
    borderRadius: 8,
    flex: 1,
    paddingLeft: 5,
    paddingEnd: 8,
    marginRight: 12,
    marginTop: MARGING_TOP,
  },
  searchInput: {
    flex: 1,
    height: HEADER_HEIGHT,
    fontSize: 18,
    paddingVertical: 6,
  },
  clearIcon: {
    marginLeft: 8,
  },
  cancelText: {
    color: AppColors.bluePrimary,
    fontSize: 16,
  },
});

export default AppBarHeader;
