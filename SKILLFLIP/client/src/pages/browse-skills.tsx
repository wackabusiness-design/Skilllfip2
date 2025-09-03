import { useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Search, MapPin, Filter, Star, Video, MapPin as LocationIcon } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import SkillCard from "@/components/skill-card";
import SearchFilters from "@/components/search-filters";
import { useQuery } from "@tanstack/react-query";

export default function BrowseSkills() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [location, setLocation] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const skillsQuery = useQuery({
    queryKey: [
      "/api/skills",
      {
        search: searchQuery,
        category: selectedCategory,
        location,
        sessionType,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      },
    ],
    queryFn: ({ queryKey }) => {
      const [url, filters] = queryKey;
      const params = new URLSearchParams();
      
      Object.entries(filters as Record<string, any>).forEach(([key, value]) => {
        if (value && value !== "" && value !== 0) {
          params.append(key, value.toString());
        }
      });

      return fetch(`${url}?${params.toString()}`, {
        credentials: "include",
      }).then(res => res.json());
    },
  });

  const { data: skills = [], isLoading } = skillsQuery;

  const handleSearch = () => {
    skillsQuery.refetch();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setLocation("");
    setSessionType("");
    setPriceRange([0, 200]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Skills</h1>
          
          {/* Main Search Bar */}
          <Card className="p-4 mb-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Input
                  placeholder="What do you want to learn?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
              
              <div className="relative">
                <Input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              
              <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
                Search Skills
              </Button>
            </div>
          </Card>

          {/* Advanced Filters */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            
            {(searchQuery || selectedCategory || location || sessionType || priceRange[0] > 0 || priceRange[1] < 200) && (
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                Clear All Filters
              </Button>
            )}
          </div>

          {showFilters && (
            <Card className="p-6 mb-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Session Type
                  </label>
                  <Select value={sessionType} onValueChange={setSessionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="virtual">Virtual Only</SelectItem>
                      <SelectItem value="in-person">In-Person Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}/hr
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {isLoading ? "Searching..." : `Found ${skills.length} skills`}
          </p>
          
          <Select defaultValue="featured">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Skills Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : skills.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or browse our popular categories.
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill: any) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}

        {/* Load More */}
        {skills.length > 0 && skills.length % 12 === 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Skills
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
