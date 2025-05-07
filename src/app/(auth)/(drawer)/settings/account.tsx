import { Alert, StyleSheet } from "react-native";
import React from "react";
import { selectAppCompanyAndUser } from "../../../../redux/selectors/sessionDataSelectors";
import { useSelector } from "react-redux";
import { FlatList } from "react-native-gesture-handler";
import ItemTile from "../../../../components/clients/ItemTile";
import { Divider } from "@rneui/base";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CustomButton from "../../../../components/CustomButton";
import { AppColors } from "../../../../constants/AppColors";
import { useDispatch } from "react-redux";
import { leaveCompany } from "../../../../redux/actions/sessionDataActions";

type AccountDetail = {
  shouldShow?: boolean;
  title: string;
  subtitle: string | undefined;
  LeftIcon: React.ComponentType<{ size: number; color: string }>;
  onPress?: () => void;
};

const Account = () => {
  const dispatch = useDispatch();
  const { appUser, appCompany, isAdmin } = useSelector(selectAppCompanyAndUser);

  const shouldShowCompanyDetails = appCompany?.id !== undefined;

  const handleDeleteAccount = () => {
    Alert.prompt(
      "Are you sure? This action cannot be undone.",
      "If you want to proceed, please type your password in the input below.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: (value?: string) => {
            // TODO: handle delete account
            console.log("Account deleted", value);
          },
        },
      ]
    );
  };

  const handleLeaveCompany = () => {
    Alert.alert(
      "Are you sure?",
      "If you leave the company, you will lose access to all company data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => dispatch(leaveCompany(appUser?.id)),
        },
      ]
    );
  };

  const accountDetails: AccountDetail[] = [
    {
      shouldShow: shouldShowCompanyDetails,
      title: "Company Name",
      subtitle: appCompany?.companyName,
      LeftIcon: () => (
        <MaterialCommunityIcons
          name="office-building"
          size={24}
          color="black"
        />
      ),
    },
    {
      shouldShow: shouldShowCompanyDetails,
      title: "Company Unique ID",
      subtitle: appCompany?.companyUID,
      LeftIcon: () => (
        <MaterialCommunityIcons
          name="office-building"
          size={24}
          color="black"
        />
      ),
    },
    {
      title: "Full Name",
      subtitle: appUser?.fullName,
      LeftIcon: () => (
        <MaterialCommunityIcons name="account" size={24} color="black" />
      ),
    },
    {
      shouldShow: shouldShowCompanyDetails,
      title: "Role",
      subtitle: appUser?.status,
      LeftIcon: () => (
        <MaterialCommunityIcons name="account-cog" size={24} color="black" />
      ),
    },
  ];

  return (
    <FlatList
      data={accountDetails}
      renderItem={({ item: accountDetail }) => {
        if (accountDetail.shouldShow === false) return null;
        return (
          <ItemTile
            containerStyle={{ paddingHorizontal: 10 }}
            title={accountDetail.title}
            subtitle={accountDetail.subtitle}
            onPress={accountDetail?.onPress}
            LeftIcon={accountDetail.LeftIcon}
          />
        );
      }}
      ItemSeparatorComponent={() => <Divider />}
      contentContainerStyle={{ padding: 10 }}
      keyExtractor={(item) => item.title}
      ListFooterComponent={() => (
        <>
          {shouldShowCompanyDetails && !isAdmin && (
            <CustomButton
              onPress={handleLeaveCompany}
              primary
              buttonContainerStyle={styles.leaveCompanyButton}
            >
              Leave Company
            </CustomButton>
          )}
          <CustomButton
            onPress={handleDeleteAccount}
            buttonContainerStyle={styles.deleteAccountButton}
            buttonTextStyle={{ color: AppColors.whitePrimary }}
          >
            Delete Account
          </CustomButton>
        </>
      )}
    />
  );
};

export default Account;

const styles = StyleSheet.create({
  leaveCompanyButton: {
    padding: 5,
  },
  deleteAccountButton: {
    marginVertical: 10,
    backgroundColor: AppColors.inlineErrorColor,
    padding: 5,
  },
});
