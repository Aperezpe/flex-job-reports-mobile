import { StyleProp, TextStyle } from "react-native";
import React from "react";
import InfoSection, { InfoText } from "../InfoSection";
import { System } from "../../types/System";
import { Address } from "../../types/Address";
import { getSystemTypeName } from "../../types/SystemType";
import { useSelector } from "react-redux";
import { selectAllSystemTypes, selectAppCompanyAndUser } from "../../redux/selectors/sessionDataSelectors";
import { selectClientDetails } from "../../redux/selectors/clientDetailsSelector";

type Props = {
  system?: System | null;
  address?: Address | null;
  titleStyles?: StyleProp<TextStyle>;
};

const DefaultReportInfo = (props: Props) => {
  const systemTypes = useSelector(selectAllSystemTypes);
  const client = useSelector(selectClientDetails);
  const { appUser } = useSelector(selectAppCompanyAndUser);
  const { address, system, titleStyles } = props;

  const clientInfo: InfoText[] = [
    {
      label: "Name",
      value: client?.clientName,
    },
    {
      label: "Address",
      value: address?.addressString,
    },
  ];

  const systemInfo: InfoText[] = [
    {
      label: "Name",
      value: system?.systemName,
    },
    {
      label: "Type",
      value: getSystemTypeName(systemTypes, system?.systemTypeId),
    },
    {
      label: "Area",
      value: system?.area,
    },
    {
      label: "Tonnage",
      value: system?.tonnage,
    },
  ];

  const technicianInfo: InfoText[] = [
    {
      label: "Name",
      value: appUser?.fullName || "N/A",
    }
  ]

  return (
    <>
      <InfoSection title={"Client Info"} infoList={clientInfo} titleStyles={titleStyles} />
      <InfoSection title={"System Info"} infoList={systemInfo} />
      <InfoSection title={"Technician"} infoList={technicianInfo} />
    </>
  );
};

export default DefaultReportInfo;
