import { FlatList, Text, View } from "react-native";
import React, { useEffect } from "react";
import { useNavigation } from "expo-router";
import ButtonText from "../../../components/ButtonText";
import SystemTypesModal from "../../../components/forms/SystemTypesModal";
import { globalStyles } from "../../../constants/GlobalStyles";
import { makeStyles } from "@rneui/themed";
import { useSelector } from "react-redux";
import {
  selectLoadingSystemTypes,
  selectSystemTypes,
} from "../../../redux/selectors/sessionDataSelectors";
import EmptyList from "../../../components/EmptyList";
import useToggleModal from "../../../hooks/useToggleModal";
import ItemTile from "../../../components/clients/ItemTile";
import { Divider } from "@rneui/base";
import LoadingComponent from "../../../components/LoadingComponent";

const FormsWorkshop = () => {
  const systemTypes = useSelector(selectSystemTypes);
  const systemTypesLoading = useSelector(selectLoadingSystemTypes);
  const styles = useStyles();
  const navigation = useNavigation();
  const { visible, toggleModal } = useToggleModal();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <ButtonText onPress={toggleModal}>Add</ButtonText>,
    });
  }, []);

  if (systemTypesLoading) return <LoadingComponent />;

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
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({ item: systemType }) => (
          <ItemTile title={systemType.systemType!} />
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

const useStyles = makeStyles((theme) => ({
  container: {
    padding: 18,
  },
  headerSubtitle: {
    color: theme.colors.grey2,
  },
  content: {
    flexGrow: 1,
    backgroundColor: "red",
    justifyContent: "center",
    alignContent: "center",
  },
}));
