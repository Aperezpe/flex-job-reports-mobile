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

type AuthScreenContextProps = {
  formState: FormState<AuthForm>;
  updateField: (field: keyof AuthForm, value: string) => void;
  resetForm: () => void;
  selectedTab: RegisterTabs;
  setSelectedTab: React.Dispatch<React.SetStateAction<RegisterTabs>>;
  showLogin: boolean;
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
  setFormSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (submit: () => void) => void;
};

const AuthScreenContext = createContext<AuthScreenContextProps | undefined>(undefined);

type AuthScreenProviderProps = {
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

export const AuthScreenProvider: React.FC<AuthScreenProviderProps> = ({ children }) => {
  const initialFormState: FormState<AuthForm> = {
    values: {},
    errors: {},
  };

  const [formState, formDispatch] = useReducer(
    formReducer<AuthForm>,
    initialFormState
  );

  const updateField = (field: keyof AuthForm, value: string) =>
    formDispatch({ type: 'UPDATE_FIELD', field, value });
  const resetForm = () => formDispatch({ type: 'RESET_FORM' });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const [selectedTab, setSelectedTab] = useState<RegisterTabs>(
    RegisterTabs.TECHNICIAN
  );

  const [showLogin, setShowLogin] = useState<boolean>(true);

  const errors: Partial<Record<keyof AuthForm, string>> = {};

  const updateFormErrors = () => {
    updateEmailError();
    updatePasswordError();

    if (showLogin) return;
    updateCompanyIdError();
    updateFullNameError();
    updateRetypePasswordError();

    if (selectedTab === RegisterTabs.TECHNICIAN) return;
    updateCompanyNameError();
  };

  useEffect(() => {
    // Starts validating each field when text changes after form is submitted.
    if (!formSubmitted) return;
    updateFormErrors();
  }, [
    formState.values.email,
    formState.values.password,
    formState.values.retypePassword,
    formState.values.companyId,
    formState.values.companyName,
    formState.values.fullName,
    formSubmitted,
  ]);

  const onSubmit = (submit: () => void) => {
    setFormSubmitted(true);
    updateFormErrors();
    if (Object.keys(errors).length !== 0) return;
    submit();
  };

  const updateEmailError = () => {
    const email = formState.values.email ?? '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    updateFieldError({
      field: 'email',
      error: 'Invalid Email',
      invalidCondition: !email || !isEmailValid,
    });
  };

  // TODO: Improve password validations
  const updatePasswordError = () => {
    const password = formState.values.password ?? '';
    updateFieldError({
      field: 'password',
      error: 'Invalid Password',
      invalidCondition: !password || password.length < 8,
    });
  };

  const updateRetypePasswordError = () => {
    const passwordError = formState.errors.password;
    const emptyRetypePassword = !(formState.values.retypePassword ?? '');
    const passwordMismatch =
      !passwordError &&
      formState.values.password !== formState.values.retypePassword;

    updateFieldError({
      field: 'retypePassword',
      error: emptyRetypePassword ? 'Invalid Password' : "Passwords don't match",
      invalidCondition: emptyRetypePassword ? emptyRetypePassword : passwordMismatch,
    });
  };

  const updateCompanyIdError = () => {
    const companyId = formState.values.companyId ?? '';
    updateFieldError({
      field: 'companyId',
      error: 'Company ID needs to be 6 characters or more',
      invalidCondition: !companyId || companyId.length < 6,
    });
  };

  const updateFullNameError = () => {
    updateFieldError({
      field: 'fullName',
      error: "Name can't be empty",
      invalidCondition: !(formState.values.fullName ?? ''),
    });
  };

  const updateCompanyNameError = () => {
    updateFieldError({
      field: 'companyName',
      error: "Company name can't be empty",
      invalidCondition: !(formState.values.companyName ?? ''),
    });
  };

  const updateFieldError = ({
    field,
    error,
    invalidCondition,
  }: {
    field: keyof AuthForm;
    error: string;
    invalidCondition: boolean;
  }) => {
    if (invalidCondition) {
      formDispatch({
        type: 'SET_ERROR',
        field,
        error,
      });
      errors[field] = error;
    } else {
      formDispatch({ type: 'SET_ERROR', field, error: '' });
      errors?.[field] && delete errors[field];
    }
  };

  return (
    <AuthScreenContext.Provider
      value={{
        formState,
        updateField,
        selectedTab,
        setSelectedTab,
        showLogin,
        setShowLogin,
        setFormSubmitted,
        resetForm,
        onSubmit,
      }}
    >
      {children}
    </AuthScreenContext.Provider>
  );
};

// Custom hook to use RegisterFormContext
export const useAuthScreenContext = () => {
  const context = useContext(AuthScreenContext);
  if (!context)
    throw new Error('useRegisterForm must be used within a RegisterFormProvider');
  return context;
};
