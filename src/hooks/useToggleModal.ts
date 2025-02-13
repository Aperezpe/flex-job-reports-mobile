import { useState } from 'react'


const useToggleModal = () => {
  const [visible, setVisible] = useState(false);

  const toggleModal = () => setVisible(!visible);

  return {
    visible,
    toggleModal
  }
}

export default useToggleModal
