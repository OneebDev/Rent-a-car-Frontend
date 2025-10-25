import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import FilterPanel, { Filters } from "@/components/FilterPanel";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { carsData } from "@/data/carsData";

const Cars = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  
  const [filters, setFilters] = useState<Filters>({
    types: searchParams.get("type") ? [searchParams.get("type")!] : [],
    fuels: [],
    transmissions: [],
    seats: [],
    priceRange: [0, 30000],
    locations: searchParams.get("pickup") ? [searchParams.get("pickup")!] : [],
    search: "",
  });

  // Apply filters and sorting
  const filteredCars = useMemo(() => {
    let result = [...carsData];

    // Apply filters
    if (filters.types.length > 0) {
      result = result.filter((car) => filters.types.includes(car.type));
    }
    if (filters.fuels.length > 0) {
      result = result.filter((car) => filters.fuels.includes(car.fuel));
    }
    if (filters.transmissions.length > 0) {
      result = result.filter((car) => filters.transmissions.includes(car.transmission));
    }
    if (filters.seats.length > 0) {
      result = result.filter((car) => filters.seats.includes(car.seats));
    }
    if (filters.locations.length > 0) {
      result = result.filter((car) => filters.locations.includes(car.location));
    }
    result = result.filter(
      (car) => car.pricePerDay >= filters.priceRange[0] && car.pricePerDay <= filters.priceRange[1]
    );
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (car) =>
          car.name.toLowerCase().includes(searchLower) ||
          car.brand.toLowerCase().includes(searchLower) ||
          car.type.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "price-high":
        result.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => b.year - a.year);
        break;
      default:
        result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [carsData, filters, sortBy]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.types.length > 0) params.set("type", newFilters.types[0]);
    if (newFilters.locations.length > 0) params.set("pickup", newFilters.locations[0]);
    setSearchParams(params);
    
    // Scroll to top smoothly after filter change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = 
    filters.types.length +
    filters.fuels.length +
    filters.transmissions.length +
    filters.seats.length +
    filters.locations.length +
    (filters.search ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="pt-20 flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse Our <span className="text-primary">Fleet</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Find the perfect vehicle for your next journey
            </p>
          </motion.div>

          <div className="flex gap-8">
            {/* Filter Panel - Desktop */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                isOpen={true}
                onClose={() => {}}
              />
            </div>

            {/* Main Content */}
            <div className="flex-grow">
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Toggle */}
                  <Button
                    variant="outline"
                    className="lg:hidden"
                    onClick={() => setIsFilterOpen(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>

                  {/* Results Count */}
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{filteredCars.length}</span> vehicles found
                  </p>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cars Grid */}
              {filteredCars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCars.map((car, index) => (
                    <motion.div
                      key={car.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <CarCard car={car} index={0} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-2xl font-semibold mb-2">No vehicles found</p>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters to see more results
                  </p>
                  <Button
                    onClick={() => {
                      const reset: Filters = {
                        types: [],
                        fuels: [],
                        transmissions: [],
                        seats: [],
                        priceRange: [0, 30000],
                        locations: [],
                        search: "",
                      };
                      setFilters(reset);
                      setSearchParams(new URLSearchParams());
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Filter Panel */}
          <div className="lg:hidden">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cars;
