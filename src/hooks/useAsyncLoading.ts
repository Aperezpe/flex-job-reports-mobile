import { useState } from "react";

const useAsyncLoading = () => {
  const [loading, setLoading] = useState(false);

  const callWithLoading = async <T>(asyncMethod: () => Promise<T>): Promise<T | undefined> => {
    try {
      setLoading(true);
      return await asyncMethod();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, callWithLoading };
};

export default useAsyncLoading;
