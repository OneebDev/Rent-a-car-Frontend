import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, X, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";

interface CitySuggestion {
  name: string;
  stateCode: string;
  stateName: string;
}

interface SearchFormProps {
  onSearch?: (params: SearchParams) => void;
}

export interface SearchParams {
  pickupLocation: string;
  dropLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  differentDropoff: boolean;
  driverAge: boolean;
}

const SearchForm = ({ onSearch }: SearchFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SearchParams>({
    pickupLocation: "",
    dropLocation: "",
    pickupDate: "",
    pickupTime: "10:00",
    returnDate: "",
    returnTime: "10:00",
    differentDropoff: false,
    driverAge: false,
  });

  // Country State City API Key
  const CSC_API_KEY = "UDFSN0FjOTBseE9QWFgzWFdWbmxxYmd6UTVEUnhjRkJac3ZaVER5Qg==";
  
  const [pickupSearch, setPickupSearch] = useState("");
  const [dropoffSearch, setDropoffSearch] = useState("");
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<CitySuggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<CitySuggestion[]>([]);
  const [allCities, setAllCities] = useState<CitySuggestion[]>([]);
  const [isLoadingPickup, setIsLoadingPickup] = useState(false);
  const [isLoadingDropoff, setIsLoadingDropoff] = useState(false);
  const pickupRef = useRef<HTMLDivElement>(null);
  const dropoffRef = useRef<HTMLDivElement>(null);
  const debounceTimerPickup = useRef<NodeJS.Timeout>();
  const debounceTimerDropoff = useRef<NodeJS.Timeout>();

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  // Fetch cities from Pakistan on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(
          'https://api.countrystatecity.in/v1/countries/PK/cities',
          {
            headers: {
              'X-CSCAPI-KEY': CSC_API_KEY
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }

        const cities = await response.json();
        setAllCities(cities);
      } catch (error) {
        console.error('Error fetching cities:', error);
        toast.error("Failed to load cities");
      }
    };

    fetchCities();
  }, []);

  // Filter cities based on search query
  const filterCities = useCallback((query: string, type: 'pickup' | 'dropoff') => {
    if (!query.trim() || query.length < 2) {
      if (type === 'pickup') setPickupSuggestions([]);
      else setDropoffSuggestions([]);
      return;
    }

    const setLoading = type === 'pickup' ? setIsLoadingPickup : setIsLoadingDropoff;
    const setSuggestions = type === 'pickup' ? setPickupSuggestions : setDropoffSuggestions;

    setLoading(true);

    // Filter cities that match the query
    const filtered = allCities.filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);

    setSuggestions(filtered);
    setLoading(false);
  }, [allCities]);

  // Debounced search for pickup location
  const handlePickupSearchChange = (value: string) => {
    setPickupSearch(value);
    setShowPickupDropdown(true);

    if (debounceTimerPickup.current) {
      clearTimeout(debounceTimerPickup.current);
    }

    debounceTimerPickup.current = setTimeout(() => {
      filterCities(value, 'pickup');
    }, 300);
  };

  // Debounced search for dropoff location
  const handleDropoffSearchChange = (value: string) => {
    setDropoffSearch(value);
    setShowDropoffDropdown(true);

    if (debounceTimerDropoff.current) {
      clearTimeout(debounceTimerDropoff.current);
    }

    debounceTimerDropoff.current = setTimeout(() => {
      filterCities(value, 'dropoff');
    }, 300);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickupRef.current && !pickupRef.current.contains(event.target as Node)) {
        setShowPickupDropdown(false);
      }
      if (dropoffRef.current && !dropoffRef.current.contains(event.target as Node)) {
        setShowDropoffDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.pickupLocation || !formData.pickupDate || !formData.returnDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(formData.returnDate) <= new Date(formData.pickupDate)) {
      toast.error("Return date must be after pickup date");
      return;
    }

    // Create URL query params
    const params = new URLSearchParams();
    if (formData.pickupLocation) params.set("pickup", formData.pickupLocation);
    if (formData.dropLocation) params.set("drop", formData.dropLocation);
    if (formData.pickupDate) params.set("pickupDate", formData.pickupDate);
    if (formData.returnDate) params.set("returnDate", formData.returnDate);

    toast.success("Searching for available cars...");
    
    if (onSearch) {
      onSearch(formData);
    }
    
    navigate(`/cars?${params.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];

  const selectLocation = (suggestion: CitySuggestion, type: 'pickup' | 'dropoff') => {
    const locationText = `${suggestion.name}, ${suggestion.stateName}`;
    if (type === 'pickup') {
      setFormData({ ...formData, pickupLocation: locationText });
      setPickupSearch(locationText);
      setShowPickupDropdown(false);
    } else {
      setFormData({ ...formData, dropLocation: locationText });
      setDropoffSearch(locationText);
      setShowDropoffDropdown(false);
    }
  };

  const clearLocation = (type: 'pickup' | 'dropoff') => {
    if (type === 'pickup') {
      setFormData({ ...formData, pickupLocation: "" });
      setPickupSearch("");
    } else {
      setFormData({ ...formData, dropLocation: "" });
      setDropoffSearch("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-7xl mx-auto">
      <div className="bg-white backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-custom-lg border-2 border-gray-300">
        {/* Main Search Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3">
          {/* Pickup Location */}
          <div className="space-y-1 relative" ref={pickupRef}>
            <Label htmlFor="pickup-location" className="text-xs font-semibold text-foreground">
              Pick-up location
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                id="pickup-location"
                type="text"
                placeholder="Airport, city or station"
                value={pickupSearch}
                onChange={(e) => handlePickupSearchChange(e.target.value)}
                onFocus={() => setShowPickupDropdown(true)}
                className="pl-10 pr-8 border-2 border-gray-400/70 focus:border-gray-500 bg-white h-11"
              />
              {pickupSearch && (
                <button
                  type="button"
                  onClick={() => clearLocation('pickup')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Pickup Dropdown */}
            {showPickupDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border-2 border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {isLoadingPickup ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                  </div>
                ) : pickupSuggestions.length > 0 ? (
                  pickupSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectLocation(suggestion, 'pickup')}
                      className="w-full flex items-start gap-3 p-3 hover:bg-muted transition-colors text-left border-b last:border-b-0"
                    >
                      <div className="mt-1">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{suggestion.name}</div>
                        <div className="text-xs text-muted-foreground">{suggestion.stateName}, Pakistan</div>
                      </div>
                    </button>
                  ))
                ) : pickupSearch.length >= 2 && !isLoadingPickup ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No cities found. Try a different search.
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Drop-off Location */}
          <div className="space-y-1 relative" ref={dropoffRef}>
            <Label htmlFor="drop-location" className="text-xs font-semibold text-foreground">
              Drop-off location
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                id="drop-location"
                type="text"
                placeholder="Airport, city or station"
                value={dropoffSearch}
                onChange={(e) => handleDropoffSearchChange(e.target.value)}
                onFocus={() => setShowDropoffDropdown(true)}
                className="pl-10 pr-8 border-2 border-gray-400/70 focus:border-gray-500 bg-white h-11"
                disabled={!formData.differentDropoff}
              />
              {dropoffSearch && (
                <button
                  type="button"
                  onClick={() => clearLocation('dropoff')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Dropoff Dropdown */}
            {showDropoffDropdown && formData.differentDropoff && (
              <div className="absolute z-50 w-full mt-1 bg-white border-2 border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {isLoadingDropoff ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                  </div>
                ) : dropoffSuggestions.length > 0 ? (
                  dropoffSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectLocation(suggestion, 'dropoff')}
                      className="w-full flex items-start gap-3 p-3 hover:bg-muted transition-colors text-left border-b last:border-b-0"
                    >
                      <div className="mt-1">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{suggestion.name}</div>
                        <div className="text-xs text-muted-foreground">{suggestion.stateName}, Pakistan</div>
                      </div>
                    </button>
                  ))
                ) : dropoffSearch.length >= 2 && !isLoadingDropoff ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No cities found. Try a different search.
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Pickup Date */}
          <div className="space-y-1">
            <Label htmlFor="pickup-date" className="text-xs font-semibold text-foreground">
              Pick-up date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                id="pickup-date"
                type="date"
                min={today}
                value={formData.pickupDate}
                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                className="pl-10 border-2 border-gray-400/70 focus:border-gray-500 bg-white h-11"
              />
            </div>
          </div>

          {/* Pickup Time */}
          <div className="space-y-1">
            <Label htmlFor="pickup-time" className="text-xs font-semibold text-foreground">
              Time
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <select
                id="pickup-time"
                value={formData.pickupTime}
                onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-400/70 rounded-md focus:border-gray-500 bg-white h-11 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400/20"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Return Date */}
          <div className="space-y-1">
            <Label htmlFor="return-date" className="text-xs font-semibold text-foreground">
              Drop-off date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                id="return-date"
                type="date"
                min={formData.pickupDate || today}
                value={formData.returnDate}
                onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                className="pl-10 border-2 border-gray-400/70 focus:border-gray-500 bg-white h-11"
              />
            </div>
          </div>

          {/* Return Time */}
          <div className="space-y-1">
            <Label htmlFor="return-time" className="text-xs font-semibold text-foreground">
              Time
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <select
                id="return-time"
                value={formData.returnTime}
                onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-400/70 rounded-md focus:border-gray-500 bg-white h-11 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400/20"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Additional Options and Search Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-border/30">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            {/* Checkbox 1 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="different-location"
                checked={formData.differentDropoff}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, differentDropoff: checked as boolean })
                }
                className="border-2 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
              />
              <label
                htmlFor="different-location"
                className="text-sm font-medium text-foreground cursor-pointer select-none"
              >
                Drop car off at different location
              </label>
            </div>

            {/* Checkbox 2 */}
            {/* <div className="flex items-center space-x-2">
              <Checkbox
                id="driver-age"
                checked={formData.driverAge}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, driverAge: checked as boolean })
                }
                className="border-2 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
              />
              <label
                htmlFor="driver-age"
                className="text-sm font-medium text-foreground cursor-pointer select-none"
              >
                Driver aged between 30 - 65?
              </label>
            </div> */}
          </div>

          {/* Search Button */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 h-11"
          >
            Search
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;
