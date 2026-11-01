import { describe, it, expect } from 'vitest';
import { POST as currenciesRoute } from '../../app/api/currencies/route';
import { POST as weatherRoute } from '../../app/api/weather/route';
import { POST as holidaysRoute } from '../../app/api/holidays/route';
import { POST as placesRoute } from '../../app/api/places/route';
import { POST as generatePlanRoute } from '../../app/api/plan/generate/route';
import { POST as chatRoute } from '../../app/api/chat/route';
import { POST as ideasRoute } from '../../app/api/ideas/route';

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

    it('returns 415 on unsupported media type', async () => {
      const req = new Request('http://localhost:3000/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data; boundary=--xyz' },
        body: 'binary data',
      });
      const res = await placesRoute(req);
      expect(res.status).toBe(415);
      const data = await res.json();
      expect(data.error).toBe('Unsupported Media Type');
    });

    it('returns 413 when payload exceeds maximum size limit', async () => {
      const req = new Request('http://localhost:3000/api/places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '200000',
        },
        body: JSON.stringify({ query: 'venues', location: 'Boston' }),
      });
      const res = await placesRoute(req);
      expect(res.status).toBe(413);
      const data = await res.json();
      expect(data.error).toBe('Payload Too Large');
    });
  });

  describe('/api/plan/generate', () => {
    it('returns 400 for malformed json body', async () => {
      const req = new Request('http://localhost:3000/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json',
      });
      const res = await generatePlanRoute(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 when missing required event fields', async () => {
      const req = new Request('http://localhost:3000/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'wedding' }),
      });
      const res = await generatePlanRoute(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation Error');
    });

    it('returns 415 on unsupported media type', async () => {
      const req = new Request('http://localhost:3000/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data; boundary=something' },
        body: 'test',
      });
      const res = await generatePlanRoute(req);
      expect(res.status).toBe(415);
    });
  });

  describe('/api/chat', () => {
    it('returns 400 for malformed json body', async () => {
      const req = new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{not_json',
      });
      const res = await chatRoute(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 when message history is empty', async () => {
      const req = new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          eventContext: {
            eventType: 'wedding',
            eventDate: '2026-06-15',
            location: 'Austin, TX',
            guestCount: 50,
            currency: 'USD',
            totalBudgetMinor: 1000000,
            isOutdoor: false,
          },
        }),
      });
      const res = await chatRoute(req);
      expect(res.status).toBe(400);
    });

    it('returns 413 when payload exceeds custom 256KB chat size limit', async () => {
      const req = new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '300000',
        },
        body: 'too large',
      });
      const res = await chatRoute(req);
      expect(res.status).toBe(413);
    });
  });

  describe('/api/ideas', () => {
    it('returns 400 for malformed json body', async () => {
      const req = new Request('http://localhost:3000/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'bad-json',
      });
      const res = await ideasRoute(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 when missing required location or eventType', async () => {
      const req = new Request('http://localhost:3000/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestCount: 10 }),
      });
      const res = await ideasRoute(req);
      expect(res.status).toBe(400);
    });

    it('returns 415 on unsupported media type', async () => {
      const req = new Request('http://localhost:3000/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'a=1',
      });
      const res = await ideasRoute(req);
      expect(res.status).toBe(415);
    });
  });
});
