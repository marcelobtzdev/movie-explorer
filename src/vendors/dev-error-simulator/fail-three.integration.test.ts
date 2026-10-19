import { tmdbClient } from '@/src/vendors/axios/tmdb-client';
import type { AxiosAdapter } from 'axios';
import { setErrorSimulationMode } from './simulator';

describe('Dev tool: fail-three through tmdbClient', () => {
  const successAdapter: AxiosAdapter = async (config) => ({
    config,
    data: { ok: true },
    headers: {},
    status: 200,
    statusText: 'OK',
  });

  beforeEach(() => {
    tmdbClient.defaults.adapter = successAdapter;
  });

  afterEach(() => {
    setErrorSimulationMode('off');
  });

  test('should fail the first three requests and succeed afterwards', async () => {
    // Arrange
    setErrorSimulationMode('fail-three');
    const outcomes: string[] = [];

    // Act
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await tmdbClient
        .get('/movie/popular')
        .then(() => outcomes.push('ok'))
        .catch(() => outcomes.push('fail'));
    }

    // Assert
    expect(outcomes).toEqual(['fail', 'fail', 'fail', 'ok', 'ok']);
  });
});
