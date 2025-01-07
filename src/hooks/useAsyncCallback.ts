import { useState } from "react";

const useAsync = () => {
  const [loading, setLoading] = useState(false);

  const asyncWrapper = async (asyncMethod: () => Promise<void>) => {
    try {
      setLoading(true);
      await asyncMethod();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, asyncWrapper };
};

export default useAsync;
