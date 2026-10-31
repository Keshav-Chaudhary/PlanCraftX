import { describe, it, expect } from 'vitest';
import { POST as currenciesRoute } from '../../app/api/currencies/route';
import { POST as weatherRoute } from '../../app/api/weather/route';
import { POST as holidaysRoute } from '../../app/api/holidays/route';
import { POST as placesRoute } from '../../app/api/places/route';

describe('App Router API Route Handlers Integration Tests', () => {
  describe('/api/currencies', () => {
    it('returns 400 when request body is not valid JSON', async () => {
      const req = new Request('http://localhost:3000/api/currencies', {
        method: 'POST',
        body: 'invalid-json',
      });
      const res = await currenciesRoute(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Invalid JSON request body');
    });

    it('returns 400 when currency parameters are invalid', async () => {
      const req = new Request('http://localhost:3000/api/currencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'TOOLONG' }),
      });
      const res = await currenciesRoute(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation Error');
    });

    it('returns 200 with exchange rate on valid input', async () => {
      const req = new Request('http://localhost:3000/api/currencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'USD', to: 'USD' }),
      });
      const res = await currenciesRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.rate).toBe(1);
    });
  });

  describe('/api/weather', () => {
    it('returns 400 when body is invalid JSON', async () => {
      const req = new Request('http://localhost:3000/api/weather', {
        method: 'POST',
        body: '{broken',
      });
      const res = await weatherRoute(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 on missing required location field', async () => {
      const req = new Request('http://localhost:3000/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: '2026-06-15' }),
      });
      const res = await weatherRoute(req);
      expect(res.status).toBe(400);
    });
  });

  describe('/api/holidays', () => {
    it('returns 400 on malformed body or invalid year', async () => {
      const req = new Request('http://localhost:3000/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: 1850 }),
      });
      const res = await holidaysRoute(req);
      expect(res.status).toBe(400);
    });
  });

  describe('/api/places', () => {
    it('returns 400 on missing query parameter', async () => {
      const req = new Request('http://localhost:3000/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: 'Boston' }),
      });
      const res = await placesRoute(req);
      expect(res.status).toBe(400);
    });
  });
});
