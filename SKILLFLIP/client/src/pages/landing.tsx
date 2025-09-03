import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Search, MapPin, Video, Shield, Calendar, Palette, Dumbbell, Utensils, Code, Music, Plus } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import { useQuery } from "@tanstack/react-query";

export default function Landing() {
  const [, setLocation] = useLocation();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: featuredSkills = [] } = useQuery({
    queryKey: ["/api/skills?featured=true"],
  });

  const categoryIcons = {
    "Arts & Crafts": Palette,
    "Fitness": Dumbbell,
    "Cooking": Utensils,
    "Technology": Code,
    "Music": Music,
  };

  const handleSearch = () => {
    setLocation("/browse");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative hero-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Learn From 
              <span className="text-primary"> Local Experts</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Master new skills through personalized sessions with talented creators in your community. From cooking to coding, art to fitness - discover your next passion.
            </p>
            
            {/* Main Action Tabs */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Book a Skill Tab */}
                <Card className="p-4 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                  <CardContent className="p-0">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Book a Skill</h3>
                      <p className="text-gray-600">Learn from local experts</p>
                    </div>
                    <div className="space-y-3">
                      <div className="relative">
                        <Input 
                          placeholder="What do you want to learn?" 
                          className="border-0 bg-gray-50 focus:ring-2 focus:ring-primary/20"
                        />
                        <Search className="absolute right-4 top-3 h-4 w-4 text-gray-400" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Select>
                          <SelectTrigger className="border-0 bg-gray-50 focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category: any) => (
                              <SelectItem key={category.id} value={category.slug}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="relative">
                          <Input 
                            placeholder="Location" 
                            className="border-0 bg-gray-50 focus:ring-2 focus:ring-primary/20"
                          />
                          <MapPin className="absolute right-4 top-3 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <Button onClick={handleSearch} className="w-full bg-primary hover:bg-primary/90">
                        Find Skills
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Share Your Skills Tab */}
                <Card className="p-4 border-accent/20 hover:border-accent/40 transition-colors cursor-pointer">
                  <CardContent className="p-0">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Share Your Skills & Earn Money</h3>
                      <p className="text-gray-600">Turn your expertise into income</p>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-lg font-bold text-accent">75%</div>
                          <div className="text-xs text-gray-600">You keep</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-lg font-bold text-accent">$40+</div>
                          <div className="text-xs text-gray-600">Avg/hour</div>
                        </div>
                      </div>
                      <div className="text-center text-sm text-gray-600 mb-3">
                        Set your rates • Flexible schedule • Build community
                      </div>
                      <Button 
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() => window.location.href = "/api/login"}
                      >
                        Start Teaching
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="secondary" className="bg-white border-gray-200">
                <Video className="h-4 w-4 text-primary mr-2" />
                Virtual Sessions Available
              </Badge>
              <Badge variant="secondary" className="bg-white border-gray-200">
                <Shield className="h-4 w-4 text-secondary mr-2" />
                Secure Payments
              </Badge>
              <Badge variant="secondary" className="bg-white border-gray-200">
                <Star className="h-4 w-4 text-accent mr-2" />
                Rated Instructors
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our most popular skill categories and find your perfect learning experience
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 5).map((category: any) => {
              const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || Palette;
              return (
                <Link key={category.id} href={`/browse?category=${category.id}`}>
                  <div className="category-card cursor-pointer" style={{ background: `linear-gradient(135deg, ${category.color || '#6366F1'} 0%, ${category.color || '#6366F1'}CC 100%)` }}>
                    <IconComponent className="h-8 w-8 text-white mb-3 mx-auto" />
                    <h3 className="font-semibold text-white mb-1">{category.name}</h3>
                    <p className="text-white/80 text-sm">View skills</p>
                  </div>
                </Link>
              );
            })}
            
            <Link href="/browse">
              <div className="category-card cursor-pointer bg-gradient-to-br from-gray-600 to-gray-800">
                <Plus className="h-8 w-8 text-white mb-3 mx-auto" />
                <h3 className="font-semibold text-white mb-1">View All</h3>
                <p className="text-gray-200 text-sm">50+ categories</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Creators */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Creators</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Learn from our top-rated instructors who are passionate about sharing their expertise
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredSkills.slice(0, 3).map((skill: any) => (
              <Card key={skill.id} className="creator-card cursor-pointer">
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Skill Image</span>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">
                        {skill.creator?.firstName?.[0]}{skill.creator?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {skill.creator?.firstName} {skill.creator?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{skill.category?.name}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{skill.shortDescription}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">5.0 (reviews)</span>
                    </div>
                    <span className="text-lg font-semibold text-primary">
                      From ${skill.price}/hr
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skill.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild>
              <Link href="/browse">View All Creators</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How SkillFlip Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps and begin your learning journey today
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Discover Skills</h3>
              <p className="text-gray-600">
                Browse through hundreds of skills taught by verified local experts. Use filters to find exactly what you're looking for.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Book & Pay</h3>
              <p className="text-gray-600">
                Select your preferred time slot and pay securely through our platform. Choose between virtual or in-person sessions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Learn & Grow</h3>
              <p className="text-gray-600">
                Attend your personalized session and learn at your own pace. Rate your experience and book follow-up sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator CTA */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Share Your Skills & Earn Money</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
              Join thousands of creators who are turning their expertise into income. Set your own rates, schedule, and teaching style.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">$2.5k</div>
                <p className="text-gray-300">Average monthly earnings</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">4.9★</div>
                <p className="text-gray-300">Average creator rating</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => window.location.href = "/api/login"}
              >
                Start Teaching Today
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                asChild
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
