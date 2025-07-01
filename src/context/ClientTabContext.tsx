import React, { createContext, useContext, useState } from "react";

export enum ButtonState {
  DEFAULT = "default",
  CANCEL = "cancel",
  START = "start",
}

type ClientTabContextType = {
  buttonState: ButtonState;
  setButtonState: React.Dispatch<React.SetStateAction<ButtonState>>;
  handleSelectSystem: ({
    systemId,
    addressId,
  }: {
    systemId?: number;
    addressId?: number;
  }) => void;
  onDefaultPress: () => void;
  onCancelPress: () => void;
  onStartPress: () => void;
  selectedSystems: Record<number, number[]>;
};

const ClientTabContext = createContext<ClientTabContextType | undefined>(
  undefined
);

export const ClientTabProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [buttonState, setButtonState] = useState<ButtonState>(
    ButtonState.DEFAULT
  );
  const [selectedSystems, setSelectedSystems] = useState<
    Record<number, number[]>
  >({});

  const handleSelectSystem = ({
    systemId,
    addressId,
  }: {
    systemId?: number;
    addressId?: number;
  }) => {
    if (!systemId || !addressId) return;
    if (!selectedSystems[addressId]) {
      setSelectedSystems({ [addressId]: [systemId] });
      setButtonState(ButtonState.START);
    } else {
      const isSystemSelected = selectedSystems[addressId].find(
        (id) => id === systemId
      );

      setSelectedSystems((prevSelectedSystems) => {
        if (isSystemSelected) {
          if (prevSelectedSystems[addressId].length === 1) {
            setButtonState(ButtonState.CANCEL);
            return {};
          }
          return {
            [addressId]: prevSelectedSystems[addressId].filter(
              (id) => id !== systemId
            ),
          };
        }
        return {
          [addressId]: [...(prevSelectedSystems[addressId] || []), systemId],
        };
      });
    }
  };

  const onDefaultPress = () => {
    setButtonState(ButtonState.CANCEL);
  };
  const onCancelPress = () => {
    setButtonState(ButtonState.DEFAULT);
    setSelectedSystems({});
  };
  const onStartPress = () => {};

  return (
    <ClientTabContext.Provider
      value={{
        buttonState,
        setButtonState,
        onDefaultPress,
        onCancelPress,
        onStartPress,
        handleSelectSystem,
        selectedSystems,
      }}
    >
      {children}
    </ClientTabContext.Provider>
  );
};

export const useClientTabContext = () => {
  const context = useContext(ClientTabContext);
  if (!context)
    throw new Error(
      "useClientTabContext must be used within a ClientTabProvider"
    );
  return context;
};
