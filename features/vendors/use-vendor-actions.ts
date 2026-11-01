'use client';

import { useState, useMemo } from 'react';
import type { EventPlan, VendorItem, VendorStatusEnum } from '@/lib/schemas/event-plan';
import type { OsmPlace } from '@/lib/schemas/api-schemas';
import { updateVendorStatus, addVendorToPlan, buildOsmVendor } from '@/lib/domain/event-rules';

export function useVendorActions(plan: EventPlan, onPlanUpdate: (updatedPlan: EventPlan) => void) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(
    () => Array.from(new Set(plan.vendorItems.map((v) => v.category))),
    [plan.vendorItems],
  );

  const handleStatusChange = (vendorId: string, newStatus: VendorStatusEnum) => {
    const updatedPlan = updateVendorStatus(plan, vendorId, newStatus);
    onPlanUpdate(updatedPlan);
  };

  const handleAddOsmVendor = (place: OsmPlace) => {
    const targetCat = categories[0] || 'Venue';
    const newVendor = buildOsmVendor(place.osmId, place.name, place.displayName, targetCat);
    const updatedPlan = addVendorToPlan(plan, newVendor);
    onPlanUpdate(updatedPlan);
  };

  const handleSaveQuoteVendor = (vendor: VendorItem) => {
    const updatedPlan = addVendorToPlan(plan, vendor);
    onPlanUpdate(updatedPlan);
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
