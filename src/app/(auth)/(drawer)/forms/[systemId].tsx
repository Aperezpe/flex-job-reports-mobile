import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  SystemFormProvider,
} from "../../../../context/SystemFormContext";
import EditFormPage from "../../../../components/forms/EditFormPage";
import { SystemType } from "../../../../types/SystemType";
import { useSelector } from "react-redux";
import { selectSystemTypes } from "../../../../redux/selectors/sessionDataSelectors";
import LoadingComponent from "../../../../components/LoadingComponent";

const FormsPage = () => {
  const params = useLocalSearchParams();
  const systemTypes: SystemType[] = useSelector(selectSystemTypes);
  const [systemType, setSystemtype] = useState<SystemType | undefined>();

  useEffect(() => {
    if (systemTypes.length && typeof params.systemId === "string") {
      const systemId = parseInt(params.systemId);
      const selectedSystemType = systemTypes.find(
        (systemType) => systemType.id === systemId
      );
      setSystemtype(selectedSystemType);
    }
  }, [systemTypes]);

  if (!systemType) {
    return <LoadingComponent />;
  }

  return (
    <SystemFormProvider systemTypeId={systemType.id!}>
      <EditFormPage systemType={systemType} /> 
    </SystemFormProvider>
  );
};

export default FormsPage;