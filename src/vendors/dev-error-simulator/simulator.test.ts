import { getErrorSimulationMode, nextSimulatedFailure, setErrorSimulationMode } from './simulator';

describe('Dev tool: error simulator', () => {
  afterEach(() => {
    setErrorSimulationMode('off');
  });

  test('should start in the off mode and not fail requests', () => {
    // Assert
    expect(getErrorSimulationMode()).toBe('off');
    expect(nextSimulatedFailure()).toBeNull();
  });

  test('should fail every request as a network error in the network mode', () => {
    // Act
    setErrorSimulationMode('network');

    // Assert
    expect(nextSimulatedFailure()).toEqual({ statusCode: undefined });
    expect(nextSimulatedFailure()).toEqual({ statusCode: undefined });
  });

  test('should fail every request with HTTP 500 in the server mode', () => {
    // Act
    setErrorSimulationMode('server');

    // Assert
    expect(nextSimulatedFailure()).toEqual({ statusCode: 500 });
  });

  test('should fail every request with HTTP 401 in the unauthorized mode', () => {
    // Act
    setErrorSimulationMode('unauthorized');

    // Assert
    expect(nextSimulatedFailure()).toEqual({ statusCode: 401 });
  });

  test('should fail exactly three requests and then recover in the fail-three mode', () => {
    // Act
    setErrorSimulationMode('fail-three');

    // Assert
    expect(nextSimulatedFailure()).toEqual({ statusCode: undefined });
    expect(nextSimulatedFailure()).toEqual({ statusCode: undefined });
    expect(nextSimulatedFailure()).toEqual({ statusCode: undefined });
    expect(nextSimulatedFailure()).toBeNull();
    expect(nextSimulatedFailure()).toBeNull();
  });

  test('should reset the fail-three counter when the mode is selected again', () => {
    // Arrange
    setErrorSimulationMode('fail-three');
    nextSimulatedFailure();

    // Act
    setErrorSimulationMode('fail-three');

    // Assert
    expect(nextSimulatedFailure()).toEqual({ statusCode: undefined });
    expect(nextSimulatedFailure()).toEqual({ statusCode: undefined });
    expect(nextSimulatedFailure()).toEqual({ statusCode: undefined });
    expect(nextSimulatedFailure()).toBeNull();
  });

  test('should stop failing requests when switched back to normal', () => {
    // Arrange
    setErrorSimulationMode('server');

    // Act
    setErrorSimulationMode('off');

    // Assert
    expect(nextSimulatedFailure()).toBeNull();
  });
});
