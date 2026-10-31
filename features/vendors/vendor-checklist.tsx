'use client';

import { useState } from 'react';
import type { EventPlan, VendorItem, VendorStatusEnum } from '@/lib/schemas/event-plan';
import type { OsmPlace } from '@/lib/api-clients/osm';
import { OsmVendorSearch } from './osm-vendor-search';
import { VendorQuoteAnalyzer } from './vendor-quote-analyzer';
import { QuoteComparison } from './quote-comparison';

interface VendorChecklistProps {
  readonly plan: EventPlan;
  readonly onPlanUpdate: (updatedPlan: EventPlan) => void;
}

export function VendorChecklist({ plan, onPlanUpdate }: VendorChecklistProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categories = Array.from(new Set(plan.vendorItems.map((v) => v.category)));

  const handleStatusChange = (vendorId: string, newStatus: VendorStatusEnum) => {
    const updated = plan.vendorItems.map((v) => {
      if (v.id === vendorId) {
        return { ...v, status: newStatus };
      }
      return v;
    });
    onPlanUpdate({
      ...plan,
      vendorItems: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddOsmVendor = (place: OsmPlace) => {
    const targetCat = categories[0] || 'Venue';
    const newVendor: VendorItem = {
      id: `vendor-osm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: targetCat,
      name: place.name,
      status: 'to_contact',
      contactInfo: place.displayName,
      notes: `Discovered via OpenStreetMap (OSM ID: ${place.osmId})`,
      isEstimate: false,
      osmId: place.osmId,
    };

    onPlanUpdate({
      ...plan,
      vendorItems: [newVendor, ...plan.vendorItems],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveQuoteVendor = (vendor: VendorItem) => {
    onPlanUpdate({
      ...plan,
      vendorItems: [vendor, ...plan.vendorItems],
      updatedAt: new Date().toISOString(),
    });
  };

  const filteredVendors = plan.vendorItems.filter((v) => {
    if (selectedCategory === 'all') return true;
    return v.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      <OsmVendorSearch location={plan.location} onAddPlaceAsVendor={handleAddOsmVendor} />

      <VendorQuoteAnalyzer plan={plan} onSaveQuoteVendor={handleSaveQuoteVendor} />

      <QuoteComparison
        vendors={plan.vendorItems}
        currency={plan.currency}
        onAcceptQuote={(id) => handleStatusChange(id, 'booked')}
      />

      {/* Filter and Vendor List */}
      <div className="border-border bg-surface rounded-xl border p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div>
            <h3 className="text-foreground text-base font-bold">Categorized Checklist</h3>
            <p className="text-muted text-xs">
              Manage booking status and verified contacts across categories.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <label htmlFor="vendor-cat-filter" className="text-foreground font-medium">
              Category:
            </label>
            <select
              id="vendor-cat-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border-border bg-surface text-foreground rounded-lg border px-2.5 py-1 text-xs"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="border-border bg-surface-elevated/40 flex flex-col justify-between rounded-lg border p-4 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-surface text-muted border-border rounded border px-2 py-0.5 text-xs font-semibold">
                    {vendor.category}
                  </span>
                  <strong className="text-foreground text-sm">{vendor.name}</strong>
                  {vendor.isEstimate && (
                    <span className="bg-warning/10 text-warning rounded-full px-2 py-0.5 text-[11px] font-medium">
                      AI estimate
                    </span>
                  )}
                </div>
                {vendor.contactInfo && <p className="text-muted text-xs">{vendor.contactInfo}</p>}
                {vendor.notes && <p className="text-muted text-xs italic">{vendor.notes}</p>}
              </div>

              <div className="mt-3 flex items-center space-x-2 sm:mt-0">
                <label htmlFor={`status-${vendor.id}`} className="sr-only">
                  Status for {vendor.name}
                </label>
                <select
                  id={`status-${vendor.id}`}
                  value={vendor.status}
                  onChange={(e) =>
                    handleStatusChange(vendor.id, e.target.value as VendorStatusEnum)
                  }
                  className="border-border bg-surface text-foreground rounded-lg border px-2.5 py-1 text-xs font-medium"
                >
                  <option value="to_contact">To Contact</option>
                  <option value="quoted">Quoted</option>
                  <option value="booked">Booked</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
