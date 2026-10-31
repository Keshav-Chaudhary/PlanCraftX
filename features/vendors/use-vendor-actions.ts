'use client';

import { useState, useMemo } from 'react';
import type { EventPlan, VendorItem, VendorStatusEnum } from '@/lib/schemas/event-plan';
import type { OsmPlace } from '@/lib/api-clients/osm';

export function useVendorActions(plan: EventPlan, onPlanUpdate: (updatedPlan: EventPlan) => void) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(
    () => Array.from(new Set(plan.vendorItems.map((v) => v.category))),
    [plan.vendorItems],
  );

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

  const filteredVendors = useMemo(() => {
    return plan.vendorItems.filter((v) => {
      if (selectedCategory === 'all') return true;
      return v.category === selectedCategory;
    });
  }, [plan.vendorItems, selectedCategory]);

  return {
    selectedCategory,
    setSelectedCategory,
    categories,
    handleStatusChange,
    handleAddOsmVendor,
    handleSaveQuoteVendor,
    filteredVendors,
  };
}
