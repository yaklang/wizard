import { useRef } from 'react';

export interface UseModalRefType {
  open: (...args: any[]) => void;
  close?: () => void;
}

const useModal = () => {
  const modal = useRef<UseModalRefType>({
    open: () => {},
    close: () => {},
  });

  return [modal.current];
};
export default useModal;
