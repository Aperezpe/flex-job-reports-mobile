import { Alert, FlatList, Text, TouchableHighlight, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Button, ListItem, makeStyles } from "@rneui/themed";
import { useSelector } from "react-redux";
import { Divider } from "@rneui/base";
import { useDispatch } from "react-redux";
import { selectVisibleSystemTypes } from "../../../../redux/selectors/sessionDataSelectors";
import useToggleModal from "../../../../hooks/useToggleModal";
import ButtonText from "../../../../components/ButtonText";
import { hideSystemType } from "../../../../redux/actions/sessionDataActions";
import { globalStyles } from "../../../../constants/GlobalStyles";
import { SystemType } from "../../../../types/SystemType";
import EmptyList from "../../../../components/EmptyList";
import SystemTypesModal from "../../../../components/forms/SystemTypesModal";
import { AppColors } from "../../../../constants/AppColors";

const FormsWorkshop = () => {
  const dispatch = useDispatch();
  const systemTypes = useSelector(selectVisibleSystemTypes);
  const router = useRouter();
  const navigation = useNavigation();
  const { visible, toggleModal } = useToggleModal();
  const [systemTypeId, setSystemTypeId] = useState<number | null>(null);
  const styles = useStyles();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <ButtonText onPress={toggleModal}>Add</ButtonText>,
    });
  }, []);

  const handleDelete = (systemTypeId: number, reset: () => void) => {
    Alert.alert("Are you sure?", "This system type will be hidden forever", [
      {
        text: "Cancel",
        style: "cancel",
        isPreferred: true,
      },
      {
        text: "Confirm",
        onPress: () => {
          dispatch(hideSystemType(systemTypeId));
          reset();
        },
        style: "destructive",
      },
    ]);
  };

  const handleEdit = (systemTypeId: number, reset: () => void) => {
    setSystemTypeId(systemTypeId);
    toggleModal();
    reset();
  };

  const handleCloseModal = () => {
    setSystemTypeId(null);
    toggleModal();
  };

  return (
    <>
      <FlatList
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
          <ListItem.Swipeable
            containerStyle={{ padding: 0 }}
            leftContent={(reset) => (
              <Button
                title="Edit"
                onPress={() => handleEdit(systemType.id ?? -1, reset)}
                icon={{ name: "edit", color: "white" }}
                buttonStyle={styles.swipableButton}
              />
            )}
            rightContent={(reset) => (
              <Button
                title="Delete"
                onPress={() => handleDelete(systemType.id ?? -1, reset)}
                icon={{ name: "delete", color: "white" }}
                buttonStyle={[
                  styles.swipableButton,
                  styles.swipableButtonDelete,
                ]}
              />
            )}
          >
            <TouchableHighlight
              onPress={() => router.push(`forms/${systemType.id}?edit=true`)}
              style={{
                flex: 1,
                padding: 20,
              }}
              underlayColor={AppColors.grayBackdrop}
            >
              <ListItem.Content style={[globalStyles.row]}>
                <ListItem.Title style={globalStyles.textBold}>
                  {systemType.systemType}
                </ListItem.Title>
                <ListItem.Chevron />
              </ListItem.Content>
            </TouchableHighlight>
          </ListItem.Swipeable>
        )}
        ListEmptyComponent={
          <View style={styles.containerPadding}>
            <EmptyList
              title="No Systems Found"
              buttonText="Create System Type"
              onActionPress={toggleModal}
            />
          </View>
        }
      />

      <SystemTypesModal
        systemTypeId={systemTypeId}
        visible={visible}
        onNegative={handleCloseModal}
        onPositive={handleCloseModal}
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
    swipableButton: {
      minHeight: "100%",
    },
    swipableButtonDelete: {
      backgroundColor: "rgb(229, 74, 74)",
    },
  };
});
