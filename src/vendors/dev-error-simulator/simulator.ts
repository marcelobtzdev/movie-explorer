export const ERROR_SIMULATION_MODES = ['off', 'network', 'server', 'unauthorized', 'fail-three'] as const;

export type ErrorSimulationMode = (typeof ERROR_SIMULATION_MODES)[number];

// `statusCode` undefined means a network failure (no HTTP response), as in a real connection loss.
export interface SimulatedFailure {
  readonly statusCode: number | undefined;
}

const FAILURES_IN_FAIL_THREE_MODE = 3;

let currentMode: ErrorSimulationMode = 'off';
let remainingFailures = 0;

export const getErrorSimulationMode = (): ErrorSimulationMode => currentMode;

export const setErrorSimulationMode = (mode: ErrorSimulationMode): void => {
  currentMode = mode;
  remainingFailures = mode === 'fail-three' ? FAILURES_IN_FAIL_THREE_MODE : 0;
};

// Returns the failure for the next request, or null when that request must succeed.
export const nextSimulatedFailure = (): SimulatedFailure | null => {
  switch (currentMode) {
    case 'network':
      return { statusCode: undefined };
    case 'server':
      return { statusCode: 500 };
    case 'unauthorized':
      return { statusCode: 401 };
    case 'fail-three':
      if (remainingFailures > 0) {
        remainingFailures -= 1;
        return { statusCode: undefined };
      }
      return null;
    default:
      return null;
  }
};
