import { describe, it, expect } from 'vitest';
import { server } from '../../src/index';

describe('Showcase WebApp Index', () => {
  it('should export server', () => {
    expect(server).toBeDefined();
    expect(typeof server).toBe('function');
  });

  it('should have server methods', () => {
    expect(server).toHaveProperty('listen');
    expect(server).toHaveProperty('use');
    expect(server).toHaveProperty('get');
    expect(server).toHaveProperty('post');
  });

  it('should be an Express application', () => {
    // Check if it has Express app properties
    expect(server).toHaveProperty('_router');
    expect(server).toHaveProperty('settings');
  });
});
