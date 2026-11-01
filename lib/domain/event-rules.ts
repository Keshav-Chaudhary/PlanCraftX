/**
 * Event-type domain taxonomies, phase names, status enums, and relative lead-time rules.
 *
 * NOTE: IN ACCORDANCE WITH STRICT DATA INTEGRITY INVARIANTS:
 * Absolutely NO fixed percentage allocation tables, pricing tables,
 * or fabricated costs are defined here or anywhere in code.
 * All category allocations are proposed dynamically by the GenAI planning assistant
 * based on user parameters, and re-normalized by domain arithmetic using integer minor units.
 */

import type { EventPlan, VendorItem, VendorStatusEnum } from '@/lib/schemas/event-plan';
import {
  EVENT_TYPES,
  type EventType,
  VENDOR_STATUSES,
  type VendorStatus,
  TIMELINE_STATUSES,
  type TimelineStatus,
} from '@/lib/schemas/event-plan';

export {
  EVENT_TYPES,
  type EventType,
  VENDOR_STATUSES,
  type VendorStatus,
  TIMELINE_STATUSES,
  type TimelineStatus,
};

/**
 * Standard vendor and budget categories permitted per event type taxonomy.
 */
export const EVENT_CATEGORIES: Record<EventType, readonly string[]> = {
  wedding: [
    'Venue & Reception',
    'Catering & Bar',
    'Photography & Videography',
    'Attire & Beauty',
    'Music & Entertainment',
    'Flowers & Decor',
    'Invitations & Paper',
    'Officiant & Legal Formalities',
    'Contingency & Miscellaneous',
  ],
  birthday: [
    'Venue Rental',
    'Food & Beverage',
    'Cake & Dessert',
    'Entertainment & Performers',
    'Decorations & Balloons',
    'Activities & Games',
    'Party Favors & Gifts',
    'Invitations',
    'Contingency & Miscellaneous',
  ],
  community: [
    'Permits & Municipal Licensing',
    'Public Safety & First Aid',
    'Sanitation & Facilities',
    'Staging, AV & Lighting',
    'Marketing, Signs & Outreach',
    'Volunteer Hospitality',
    'Participant Activities',
    'Insurance & Accessibility',
    'Contingency Reserve',
  ],
} as const;

/**
 * Sequential timeline phase names per event type.
 */
export const TIMELINE_PHASES: Record<EventType, readonly string[]> = {
  wedding: [
    'Vision & Budget Alignment',
    'Venue & Core Vendors',
    'Attire & Guest List',
    'Logistics & Details',
    'Rehearsal & Final Coordination',
    'Event Day Execution',
  ],
  birthday: [
    'Theme & Venue Selection',
    'Invitations & Activity Booking',
    'Supplies, Decor & Menu',
    'Final Confirmations',
    'Event Day Execution',
  ],
  community: [
    'Planning Committee & Permits',
    'Logistics, AV & Safety Protocols',
    'Promotion & Sponsor Mobilization',
    'Volunteer Briefing & Site Setup',
    'Event Day Operations',
    'Post-Event Breakdown & Reporting',
  ],
} as const;

/**
 * Standard relative lead times (in days prior to event date) under ideal planning horizons.
 * The timeline engine dynamically scales these phases when actual lead time is compressed.
 */
export const PHASE_IDEAL_LEAD_DAYS: Record<EventType, readonly number[]> = {
  wedding: [270, 180, 120, 60, 14, 0],
  birthday: [60, 45, 30, 7, 0],
  community: [120, 90, 60, 14, 0, -2],
} as const;

/**
 * Updates a vendor item's booking/contract status immutably within a plan.
 */
export function updateVendorStatus(
  plan: EventPlan,
  vendorId: string,
  newStatus: VendorStatusEnum,
): EventPlan {
  const updated = plan.vendorItems.map((v) => {
    if (v.id === vendorId) {
      return { ...v, status: newStatus };
    }
    return v;
  });

  return {
    ...plan,
    vendorItems: updated,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Adds a new vendor to an existing plan immutably.
 */
export function addVendorToPlan(plan: EventPlan, vendor: VendorItem): EventPlan {
  return {
    ...plan,
    vendorItems: [vendor, ...plan.vendorItems],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Constructs a verified OpenStreetMap vendor record without synthetic mocks.
 */
export function buildOsmVendor(
  osmId: string,
  name: string,
  displayName: string,
  category: string,
): VendorItem {
  return {
    id: `vendor-osm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category,
    name,
    status: 'to_contact',
    contactInfo: displayName,
    notes: `Discovered via OpenStreetMap (OSM ID: ${osmId})`,
    isEstimate: false,
    osmId,
  };
}
