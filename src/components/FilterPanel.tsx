import { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export interface Filters {
  types: string[];
  fuels: string[];
  transmissions: string[];
  seats: number[];
  priceRange: [number, number];
  locations: string[];
  search: string;
}

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterPanel = ({ filters, onFilterChange, isOpen, onClose }: FilterPanelProps) => {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const carTypes = ["Budget", "Compact", "Standard Sedan", "Mid Size Sedan", "Full Size Sedan", "Standard SUV", "Mid Size SUV", "Full Size SUV", "Luxury SUV", "Luxury Pickup", "Mini Van", "Commuter Van"];
  const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid"];
  const transmissionTypes = ["Automatic", "Manual"];
  const seatOptions = [4, 5, 7, 8, 10, 24];
  const locationOptions = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Hyderabad", "Gwadar"];

  const handleCheckboxChange = (category: keyof Filters, value: string | number) => {
    const currentValues = localFilters[category] as (string | number)[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    const updated = { ...localFilters, [category]: newValues };
    setLocalFilters(updated);
  };

  const handlePriceChange = (value: number[]) => {
    const updated = { ...localFilters, priceRange: [value[0], value[1]] as [number, number] };
    setLocalFilters(updated);
    // Apply price filter in real-time
    onFilterChange(updated);
  };

  const handleSearchChange = (value: string) => {
    const updated = { ...localFilters, search: value };
    setLocalFilters(updated);
    // Apply search filter in real-time
    onFilterChange(updated);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const resetFilters = () => {
    const reset: Filters = {
      types: [],
      fuels: [],
      transmissions: [],
      seats: [],
      priceRange: [0, 30000],
      locations: [],
      search: "",
    };
    setLocalFilters(reset);
    onFilterChange(reset);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />

          {/* Filter Panel */}
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed lg:sticky top-20 left-0 h-[calc(100vh-5rem)] lg:h-auto w-80 bg-card border-r border-border p-6 overflow-y-auto z-50 lg:z-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Filters</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  placeholder="Search by name or brand..."
                  value={localFilters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              {/* Car Type */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Car Type</Label>
                <div className="space-y-2">
                  {carTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={localFilters.types.includes(type)}
                        onCheckedChange={() => handleCheckboxChange("types", type)}
                      />
                      <label
                        htmlFor={`type-${type}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fuel Type */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Fuel Type</Label>
                <div className="space-y-2">
                  {fuelTypes.map((fuel) => (
                    <div key={fuel} className="flex items-center space-x-2">
                      <Checkbox
                        id={`fuel-${fuel}`}
                        checked={localFilters.fuels.includes(fuel)}
                        onCheckedChange={() => handleCheckboxChange("fuels", fuel)}
                      />
                      <label
                        htmlFor={`fuel-${fuel}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {fuel}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transmission */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Transmission</Label>
                <div className="space-y-2">
                  {transmissionTypes.map((trans) => (
                    <div key={trans} className="flex items-center space-x-2">
                      <Checkbox
                        id={`trans-${trans}`}
                        checked={localFilters.transmissions.includes(trans)}
                        onCheckedChange={() => handleCheckboxChange("transmissions", trans)}
                      />
                      <label
                        htmlFor={`trans-${trans}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {trans}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seats */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Seats</Label>
                <div className="space-y-2">
                  {seatOptions.map((seats) => (
                    <div key={seats} className="flex items-center space-x-2">
                      <Checkbox
                        id={`seats-${seats}`}
                        checked={localFilters.seats.includes(seats)}
                        onCheckedChange={() => handleCheckboxChange("seats", seats)}
                      />
                      <label
                        htmlFor={`seats-${seats}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {seats} Seats
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Location</Label>
                <div className="space-y-2">
                  {locationOptions.map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${location}`}
                        checked={localFilters.locations.includes(location)}
                        onCheckedChange={() => handleCheckboxChange("locations", location)}
                      />
                      <label
                        htmlFor={`location-${location}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {location}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Price Range: Rs {localFilters.priceRange[0]} - Rs {localFilters.priceRange[1]}
                </Label>
                <Slider
                  value={localFilters.priceRange}
                  onValueChange={handlePriceChange}
                  max={30000}
                  step={500}
                  className="mt-2"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-border">
                <Button onClick={applyFilters} className="w-full shadow-red">
                  Apply Filters
                </Button>
                <Button onClick={resetFilters} variant="outline" className="w-full">
                  Reset All
                </Button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterPanel;
