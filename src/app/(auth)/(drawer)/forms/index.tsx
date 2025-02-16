import { Alert, FlatList, Text, View } from "react-native";
import React, { useEffect } from "react";
import { useNavigation } from "expo-router";
import { makeStyles } from "@rneui/themed";
import { useSelector } from "react-redux";
import { Divider } from "@rneui/base";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useDispatch } from "react-redux";
import { selectSystemTypes } from "../../../../redux/selectors/sessionDataSelectors";
import useToggleModal from "../../../../hooks/useToggleModal";
import ButtonText from "../../../../components/ButtonText";
import { removeSystemType } from "../../../../redux/actions/sessionDataActions";
import { globalStyles } from "../../../../constants/GlobalStyles";
import { SystemType } from "../../../../types/SystemType";
import RightAction from "../../../../components/forms/RightAction";
import ItemTile from "../../../../components/clients/ItemTile";
import EmptyList from "../../../../components/EmptyList";
import SystemTypesModal from "../../../../components/forms/SystemTypesModal";

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
    <>
      <FlatList
        // contentContainerStyle={styles.container}
        data={systemTypes}
        contentInsetAdjustmentBehavior={"automatic"}
        ListHeaderComponent={
          <View style={styles.containerPadding}>
            <Text style={globalStyles.textTitle}>Forms Workshop</Text>
            <Text style={[globalStyles.textRegular, styles.headerSubtitle]}>
              System type will be attached to its unique form
            </Text>

            <Divider style={{ marginVertical: 12 }} />
          </View>
        }
        keyExtractor={(systemType: SystemType) => `${systemType.id}`}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({ item: systemType }) => (
          <Swipeable
            containerStyle={styles.swipableBackground}
            friction={3}
            rightThreshold={50}
            renderRightActions={(_, drag) => (
              <RightAction
                drag={drag}
                onPress={() => handleDelete(systemType.id!)}
              />
            )}
          >
            <ItemTile
              containerStyle={{ paddingHorizontal: 20 }}
              title={systemType.systemType!}
              onPress={() => {}}
            />
          </Swipeable>
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
    </>
  );
};

export default FormsWorkshop;

const useStyles = makeStyles((theme) => {
  return {
    containerPadding: {
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
