import { StyleProp, TextStyle, View } from "react-native";
import React from "react";
import InfoSection, { InfoText } from "../InfoSection";
import { System } from "../../types/System";
import { Address } from "../../types/Address";
import { getSystemTypeName } from "../../types/SystemType";
import { useSelector } from "react-redux";
import { selectAllSystemTypes } from "../../redux/selectors/sessionDataSelectors";
import { selectClientDetails } from "../../redux/selectors/clientDetailsSelector";

type Props = {
  system?: System | null;
  address?: Address | null;
  titleStyles?: StyleProp<TextStyle>;
};

const DefaultReportInfo = (props: Props) => {
  const systemTypes = useSelector(selectAllSystemTypes);
  const client = useSelector(selectClientDetails);
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
      label: "Area",
      value: system?.area,
    },
    {
      label: "Type",
      value: getSystemTypeName(systemTypes, system?.systemTypeId),
    },
    {
      label: "Tonnage",
      value: system?.tonnage,
    },
  ];

  return (
    <>
      <InfoSection title={"Client Info"} infoList={clientInfo} titleStyles={titleStyles} />
      <View style={{ height: 18 }}/>
      <InfoSection title={"System Info"} infoList={systemInfo} />
    </>
  );
};

export default DefaultReportInfo;
