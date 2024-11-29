import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { RegisterForm } from '../components/Auth/types/RegisterForm';
import { RegisterTabs } from '../types/Auth/RegisterTabs';
import { LoginForm } from '../components/Auth/types/LoginForm';

type AuthContextProps = {
  loginFormState: FormState<LoginForm>;
  loginFormDispatch: React.Dispatch<FormAction<LoginForm>>;
  registerFormState: FormState<RegisterForm>;
  registerFormDispatch: React.Dispatch<FormAction<RegisterForm>>;
  inTechnicianTab: boolean;
  setSelectedTab: React.Dispatch<React.SetStateAction<RegisterTabs>>;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
} & PropsWithChildren;

interface FormState<TFields> {
  values: Partial<TFields>;
  errors: Partial<Record<keyof TFields, string>>;
}

type FormAction<TFields extends Record<string, any>> =
  | { type: 'UPDATE_FIELD'; field: keyof TFields; value: TFields[keyof TFields] }
  | { type: 'SET_ERROR'; field: keyof TFields; error: string }
  | { type: 'RESET_FORM' };

function formReducer<TFields extends Record<string, any>>(
  state: FormState<TFields>,
  action: FormAction<TFields>
): FormState<TFields> {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };
    case 'RESET_FORM':
      return { values: {}, errors: {} };
    default:
      throw new Error('Unsupported action type');
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const initialRegisterFormState: FormState<RegisterForm> = {
    values: {},
    errors: {},
  };

  const initialLoginFormState: FormState<LoginForm> = {
    values: {},
    errors: {},
  };

  const [loginFormState, loginFormDispatch] = useReducer(
    formReducer<LoginForm>,
    initialLoginFormState
  );

  const [registerFormState, registerFormDispatch] = useReducer(
    formReducer<RegisterForm>,
    initialRegisterFormState
  );

  const [selectedTab, setSelectedTab] = useState<RegisterTabs>(
    RegisterTabs.TECHNICIAN
  );

  useEffect(() => registerFormDispatch({ type: 'RESET_FORM' }), [selectedTab]);

  useEffect(() => {
    if (loginFormState.values.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const isEmailValid = emailRegex.test(loginFormState.values.email);
      if (!isEmailValid) loginFormDispatch({type: 'SET_ERROR', field: 'email', error: 'Invalid Email'})
    }

  }, [loginFormState.values.email])

  const inTechnicianTab = selectedTab === RegisterTabs.TECHNICIAN;
  return (
    <AuthContext.Provider
      value={{
        loginFormState,
        loginFormDispatch,
        registerFormState,
        registerFormDispatch,
        inTechnicianTab,
        setSelectedTab,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use RegisterFormContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useRegisterForm must be used within a RegisterFormProvider');
  return context;
};
