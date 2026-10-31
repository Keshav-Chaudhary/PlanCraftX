import type { EventTypeEnum } from '../schemas/event-plan';

export interface RunsheetEntry {
  readonly time: string;
  readonly activity: string;
  readonly leadRole: string;
  readonly notes: string;
}

/**
 * Deterministically constructs an event-day schedule (run-sheet) based on occasion type.
 */
export function generateEventDayRunsheet(eventType: EventTypeEnum): RunsheetEntry[] {
  switch (eventType) {
    case 'wedding':
      return [
        {
          time: '08:00',
          activity: 'Hair, Makeup & Bridal Party Preparation',
          leadRole: 'Lead Stylist & Wedding Party',
          notes: 'Ensure steam pressing of attire and morning hydration/breakfast.',
        },
        {
          time: '10:30',
          activity: 'Vendor Load-In & Floral Installation',
          leadRole: 'Day-of Coordinator & Florist',
          notes: 'Confirm venue access, soundcheck in ceremony & reception spaces.',
        },
        {
          time: '12:30',
          activity: 'Couple First Look & Wedding Party Photos',
          leadRole: 'Lead Photographer & Videographer',
          notes: 'Pin boutonnieres and distribute bouquets before photo session.',
        },
        {
          time: '14:30',
          activity: 'Guest Arrival & Prelude Music',
          leadRole: 'Ushers & Musicians/DJ',
          notes: 'Welcome water station active, guestbook table manned.',
        },
        {
          time: '15:00',
          activity: 'Ceremony Processional & Exchange of Vows',
          leadRole: 'Officiant & Wedding Couple',
          notes: 'Microphones live; signing of legal marriage license immediately following.',
        },
        {
          time: '16:00',
          activity: 'Cocktail Hour & Passed Hors d’Oeuvres',
          leadRole: 'Catering Captain & Bar Manager',
          notes: 'Family portraits completed; escort guests to reception pavilion.',
        },
        {
          time: '17:30',
          activity: 'Grand Entrance, Welcome Dinner & Toasts',
          leadRole: 'Master of Ceremonies (MC) & Caterer',
          notes: 'Champagne poured for toasts; check dietary allergy table delivery.',
        },
        {
          time: '19:30',
          activity: 'Cake Cutting & First Dance',
          leadRole: 'DJ / Band & Couple',
          notes: 'Dim lighting for dance floor opening.',
        },
        {
          time: '22:30',
          activity: 'Sparkler / Grand Send-Off & Teardown',
          leadRole: 'Coordinator & Venue Staff',
          notes: 'Ensure gifts and personal items loaded into designated vehicle.',
        },
      ];

    case 'birthday':
      return [
        {
          time: '10:00',
          activity: 'Venue Access, Balloon Arch & Decor Setup',
          leadRole: 'Host & Decor Team',
          notes: 'Inspect table seating, goodie bag station, and photo backdrop.',
        },
        {
          time: '12:00',
          activity: 'Catering, Snacks & Cake Delivery',
          leadRole: 'Bakery & Food Delivery Staff',
          notes: 'Refrigerate cake and inspect candles/sparklers.',
        },
        {
          time: '13:00',
          activity: 'Guests Arrive & Welcome Drinks / Music',
          leadRole: 'Host & Welcomers',
          notes: 'Collect gifts at entrance; start ambient music playlist.',
        },
        {
          time: '14:00',
          activity: 'Organized Games & Entertainment Show',
          leadRole: 'Lead Entertainer / Game Host',
          notes: 'Engage all age groups; prize handouts for activities.',
        },
        {
          time: '15:30',
          activity: 'Birthday Song, Candle Blowout & Cake Cutting',
          leadRole: 'Celebrant & Family',
          notes: 'Capture celebration group photo around cake.',
        },
        {
          time: '16:15',
          activity: 'Main Meal / Buffet Service',
          leadRole: 'Catering Team',
          notes: 'Serve food, beverage refills, and coffee/tea.',
        },
        {
          time: '17:30',
          activity: 'Party Favors & Guest Farewell',
          leadRole: 'Host',
          notes: 'Distribute return gifts; pack left-over cake boxes.',
        },
      ];

    case 'community':
      return [
        {
          time: '07:00',
          activity: 'Site Marshalling, City Permit Sign-Off & Barricades',
          leadRole: 'Operations Director & Municipal Liaison',
          notes: 'Check emergency vehicle lane clearance and first aid station.',
        },
        {
          time: '08:30',
          activity: 'Stage, AV & Sound Engineering Checks',
          leadRole: 'Sound Engineer & AV Crew',
          notes: 'Test PA speakers, backup power generator, and microphones.',
        },
        {
          time: '09:30',
          activity: 'Food Truck & Artisan Stallholder Arrival',
          leadRole: 'Vendor Coordinator',
          notes: 'Verify health inspector certificates and electrical hookups.',
        },
        {
          time: '10:30',
          activity: 'Public Gates Open & Welcome Address',
          leadRole: 'Master of Ceremonies & Community Leaders',
          notes: 'Acknowledge sponsors, volunteers, and emergency exits.',
        },
        {
          time: '12:00',
          activity: 'Live Music, Cultural Performances & Workshops',
          leadRole: 'Performers & Stage Manager',
          notes: 'Maintain strict 30-minute changeover cadence between sets.',
        },
        {
          time: '16:00',
          activity: 'Civic Awards & Community Recognition Ceremony',
          leadRole: 'Organizing Committee Chair',
          notes: 'Present medals, honor volunteers, announce raffle winners.',
        },
        {
          time: '18:00',
          activity: 'Festival Conclusion & Coordinated Breakdown',
          leadRole: 'Sanitation Crew & Volunteer Team',
          notes: 'Waste sorting, recycling audit, load-out and park clean inspection.',
        },
      ];
  }
}
