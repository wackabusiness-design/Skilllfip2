import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Filter, X, MapPin, DollarSign, Clock, Video } from "lucide-react";

interface SearchFiltersProps {
  onFiltersChange: (filters: any) => void;
  categories: any[];
  initialFilters?: any;
}

export default function SearchFilters({ onFiltersChange, categories, initialFilters = {} }: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    category: initialFilters.category || "",
    location: initialFilters.location || "",
    sessionType: initialFilters.sessionType || "",
    priceRange: initialFilters.priceRange || [0, 200],
    virtualOnly: initialFilters.virtualOnly || false,
    inPersonOnly: initialFilters.inPersonOnly || false,
    availableToday: initialFilters.availableToday || false,
    rating: initialFilters.rating || 0,
    ...initialFilters
  });

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      category: "",
      location: "",
      sessionType: "",
      priceRange: [0, 200],
      virtualOnly: false,
      inPersonOnly: false,
      availableToday: false,
      rating: 0,
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.category ||
      filters.location ||
      filters.sessionType ||
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 200 ||
      filters.virtualOnly ||
      filters.inPersonOnly ||
      filters.availableToday ||
      filters.rating > 0
    );
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters() && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Category
          </label>
          <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Location Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Location
          </label>
          <div className="relative">
            <Input
              placeholder="City, state, or 'Virtual'"
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="pl-10"
            />
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <Separator />

        {/* Session Type */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Session Type
          </label>
          <Select value={filters.sessionType} onValueChange={(value) => updateFilter("sessionType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Type</SelectItem>
              <SelectItem value="virtual">Virtual Only</SelectItem>
              <SelectItem value="in-person">In-Person Only</SelectItem>
              <SelectItem value="both">Both Options</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}/hr
          </label>
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter("priceRange", value)}
              max={200}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0</span>
            <span>$200+</span>
          </div>
        </div>

        <Separator />

        {/* Quick Filters */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Quick Filters
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Virtual sessions only</span>
              </div>
              <Switch
                checked={filters.virtualOnly}
                onCheckedChange={(checked) => updateFilter("virtualOnly", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <span className="text-sm">In-person sessions only</span>
              </div>
              <Switch
                checked={filters.inPersonOnly}
                onCheckedChange={(checked) => updateFilter("inPersonOnly", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Available today</span>
              </div>
              <Switch
                checked={filters.availableToday}
                onCheckedChange={(checked) => updateFilter("availableToday", checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Minimum Rating */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Minimum Rating
          </label>
          <Select value={filters.rating.toString()} onValueChange={(value) => updateFilter("rating", parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Any Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any Rating</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="4.5">4.5+ Stars</SelectItem>
              <SelectItem value="5">5 Stars Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Active Filters
              </label>
              <div className="flex flex-wrap gap-2">
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {categories.find(c => c.id.toString() === filters.category)?.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter("category", "")}
                    />
                  </Badge>
                )}
                {filters.location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Location: {filters.location}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter("location", "")}
                    />
                  </Badge>
                )}
                {filters.sessionType && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {filters.sessionType}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter("sessionType", "")}
                    />
                  </Badge>
                )}
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < 200) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    ${filters.priceRange[0]}-${filters.priceRange[1]}/hr
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter("priceRange", [0, 200])}
                    />
                  </Badge>
                )}
                {filters.virtualOnly && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Virtual Only
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter("virtualOnly", false)}
                    />
                  </Badge>
                )}
                {filters.inPersonOnly && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    In-Person Only
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter("inPersonOnly", false)}
                    />
                  </Badge>
                )}
                {filters.availableToday && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Available Today
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter("availableToday", false)}
                    />
                  </Badge>
                )}
                {filters.rating > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.rating}+ Stars
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter("rating", 0)}
                    />
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
