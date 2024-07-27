import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";

interface SelectedItemContextType {
  selectedItemId: string;
  setSelectedItemId: (id: string) => void;
  isSelected: (id: string) => boolean;
}

const SelectedItemContext = createContext<SelectedItemContextType | undefined>(
  undefined,
);

interface SelectedItemProviderProps {
  children: ReactNode;
}

export const SelectedItemProvider: React.FC<SelectedItemProviderProps> = ({
  children,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>("field-title");

  const isSelected = useCallback(
    (id: string) => selectedItemId === id,
    [selectedItemId],
  );

  return (
    <SelectedItemContext.Provider
      value={{ selectedItemId, setSelectedItemId, isSelected }}
    >
      {children}
    </SelectedItemContext.Provider>
  );
};

export const useSelectedItem = (): SelectedItemContextType => {
  const context = useContext(SelectedItemContext);
  if (context === undefined) {
    throw new Error(
      "useSelectedItem must be used within a SelectedItemProvider",
    );
  }
  return context;
};
