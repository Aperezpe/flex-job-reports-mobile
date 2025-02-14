import { Alert, FlatList, Text, View } from "react-native";
import React, { useEffect } from "react";
import { useNavigation } from "expo-router";
import ButtonText from "../../../components/ButtonText";
import SystemTypesModal from "../../../components/forms/SystemTypesModal";
import { globalStyles } from "../../../constants/GlobalStyles";
import { makeStyles } from "@rneui/themed";
import { useSelector } from "react-redux";
import { selectSystemTypes } from "../../../redux/selectors/sessionDataSelectors";
import EmptyList from "../../../components/EmptyList";
import useToggleModal from "../../../hooks/useToggleModal";
import ItemTile from "../../../components/clients/ItemTile";
import { Divider } from "@rneui/base";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import RightAction from "../../../components/forms/RightAction";
import { useDispatch } from "react-redux";
import { removeSystemType } from "../../../redux/actions/sessionDataActions";
import { SystemType } from "../../../types/SystemType";

const FormsWorkshop = () => {
  const dispatch = useDispatch();
  const systemTypes = useSelector(selectSystemTypes);
  const navigation = useNavigation();
  const { visible, toggleModal } = useToggleModal();
  const styles = useStyles();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <ButtonText onPress={toggleModal}>Add</ButtonText>,
    });
  }, []);

  const handleDelete = (systemTypeId: number) => {
    Alert.alert("Are you sure?", "This system type will be deleted forever", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Confirm",
        onPress: () => dispatch(removeSystemType(systemTypeId)),
        style: "destructive",
        isPreferred: true,
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={systemTypes}
        ListHeaderComponent={
          <View>
            <Text style={globalStyles.textTitle}>Forms Workshop</Text>
            <Text style={[globalStyles.textRegular, styles.headerSubtitle]}>
              System type will be attached to its unique form
            </Text>

            <Divider style={{ marginVertical: 12 }} />
          </View>
        }
        keyExtractor={(systemType: SystemType, index) => `${systemType.id}`}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({ item: systemType }) => (
          <View style={styles.swipableBackground}>
            <Swipeable
              friction={3}
              rightThreshold={50}
              renderRightActions={(_, drag) => (
                <RightAction
                  drag={drag}
                  onPress={() => handleDelete(systemType.id!)}
                />
              )}
            >
              <ItemTile title={systemType.systemType!} onPress={() => {}} />
            </Swipeable>
          </View>
        )}
        ListEmptyComponent={
          <EmptyList
            title="No Systems Found"
            buttonText="Create System Type"
            onActionPress={toggleModal}
          />
        }
      />

      <SystemTypesModal
        visible={visible}
        onNegative={toggleModal}
        onPositive={toggleModal}
      />
    </View>
  );
};

export default FormsWorkshop;

const useStyles = makeStyles((theme) => {
  return {
    container: {
      padding: 18,
    },
    headerSubtitle: {
      color: theme.colors.grey2,
    },
    swipableBackground: {
      backgroundColor: "rgb(229, 74, 74)",
    },
  };
});
