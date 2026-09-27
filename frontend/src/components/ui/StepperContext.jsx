import { createContext, useContext } from 'react';

export const StepperContext = createContext(null);

export function useStepper() {
  const context = useContext(StepperContext);

  if (!context) {
    throw new Error('useStepper must be used within a Stepper');
  }

  return context;
}

export default StepperContext;
