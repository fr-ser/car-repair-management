import { use } from 'react';

import { ConfirmationContext, ConfirmationContextType } from './types';

const useConfirmation = (): ConfirmationContextType => {
  const context = use(ConfirmationContext);
  if (!context) {
    throw new Error(
      'useConfirmation must be used within a ConfirmationProvider',
    );
  }
  return context;
};

export default useConfirmation;
