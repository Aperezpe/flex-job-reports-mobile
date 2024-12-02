import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { RegisterTabs } from '../types/Auth/RegisterTabs';
import { AuthForm } from '../types/Auth/AuthForm';

type AuthContextProps = {
  formState: FormState<AuthForm>;
  formDispatch: React.Dispatch<FormAction<AuthForm>>;
  selectedTab: RegisterTabs;
  setSelectedTab: React.Dispatch<React.SetStateAction<RegisterTabs>>;
  showLogin: boolean;
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
  formSubmitted: boolean;
  setFormSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
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
  const initialFormState: FormState<AuthForm> = {
    values: {},
    errors: {},
  };

  const [formState, formDispatch] = useReducer(
    formReducer<AuthForm>,
    initialFormState
  );

  const [formSubmitted, setFormSubmitted] = useState(false);

  const [selectedTab, setSelectedTab] = useState<RegisterTabs>(
    RegisterTabs.TECHNICIAN
  );

  const [showLogin, setShowLogin] = useState<boolean>(true);

  useEffect(() => formDispatch({ type: 'RESET_FORM' }), [selectedTab]);

  const inTechnicianTab = selectedTab === RegisterTabs.TECHNICIAN;

  useEffect(() => {
    if (!formSubmitted) return;
    validateEmail();
    validatePassword();

    if (showLogin) return;
    validateCompanyId();
    validateFullName();
    validateRetypePassword();

    if (inTechnicianTab) return;
    validateCompanyName();
  }, [
    formState.values.email,
    formState.values.password,
    formState.values.retypePassword,
    formState.values.companyId,
    formState.values.companyName,
    formState.values.fullName,
    formSubmitted,
  ]);

  useEffect(() => {
    setFormSubmitted(false);
    formDispatch({ type: 'RESET_FORM' });
  }, [showLogin, selectedTab]);

  const validateEmail = () => {
    const email = formState.values.email ?? '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    validateField({
      field: 'email',
      error: 'Invalid Email',
      condition: !email || !isEmailValid,
    });
  };

  // TODO: Improve password validations
  const validatePassword = () => {
    const password = formState.values.password ?? '';
    validateField({
      field: 'password',
      error: 'Invalid Password',
      condition: !password || password.length < 8,
    });
  };

  const validateRetypePassword = () => {
    const passwordError = formState.errors.password;
    const condition =
      !passwordError &&
      formState.values.password !== formState.values.retypePassword;

    validateField({
      field: 'retypePassword',
      error: "Passwords don't match",
      condition,
    });
  };

  const validateCompanyId = () => {
    const companyId = formState.values.companyId ?? '';
    validateField({
      field: 'companyId',
      error: 'Company ID needs to be 6 characters or more',
      condition: !companyId || companyId.length < 6,
    });
  };

  const validateFullName = () => {
    validateField({
      field: 'fullName',
      error: "Name can't be empty",
      condition: !(formState.values.fullName ?? ''),
    });
  };

  const validateCompanyName = () => {
    validateField({
      field: 'companyName',
      error: "Company name can't be empty",
      condition: !(formState.values.companyName ?? ''),
    });
  };

  const validateField = ({
    field,
    error,
    condition,
  }: {
    field: keyof AuthForm;
    error: string;
    condition: boolean;
  }) => {
    if (condition) {
      formDispatch({
        type: 'SET_ERROR',
        field,
        error,
      });
    } else formDispatch({ type: 'SET_ERROR', field, error: '' });
  };

  return (
    <AuthContext.Provider
      value={{
        formState,
        formDispatch,
        selectedTab,
        setSelectedTab,
        showLogin,
        setShowLogin,
        formSubmitted,
        setFormSubmitted,
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
