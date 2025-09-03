import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users, Clock, Search, Filter, Star } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function FlipNights() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return await apiRequest("POST", `/api/events/${eventId}/register`, {});
    },
    onSuccess: () => {
      toast({
        title: "Registration successful!",
        description: "You're all set for the event. We'll send you a confirmation email.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please sign in",
          description: "You need to be logged in to register for events.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Registration failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const handleRegister = (eventId: number) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to register for events.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }
    registerMutation.mutate(eventId);
  };

  const filteredEvents = events.filter((event: any) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingEvents = filteredEvents.filter((event: any) => 
    new Date(event.eventDate) > new Date()
  );

  const featuredEvent = upcomingEvents.find((event: any) => 
    new Date(event.eventDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
  ) || upcomingEvents[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative hero-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Flip Nights
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Join our monthly community events where creators showcase new skills and learners connect with like-minded people. 
              Network, learn, and grow together!
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Event */}
        {featuredEvent && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Event</h2>
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-8 lg:p-12">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mr-4">
                      <Star className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{featuredEvent.title}</h3>
                      <p className="text-gray-600">
                        {new Date(featuredEvent.eventDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} • {new Date(featuredEvent.eventDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-6">{featuredEvent.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{featuredEvent.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {featuredEvent.currentAttendees || 0} / {featuredEvent.maxAttendees} attendees
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>${featuredEvent.price} per person</span>
                    </div>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={() => handleRegister(featuredEvent.id)}
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Registering..." : "Register Now"}
                  </Button>
                </div>
                
                <div className="relative aspect-video md:aspect-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <span className="text-gray-600">Event Image</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <span className="text-sm font-semibold text-gray-900">
                      {featuredEvent.maxAttendees - (featuredEvent.currentAttendees || 0)} spots left
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* All Events */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Events</h2>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                <p className="text-gray-600 mb-4">
                  Check back soon for new Flip Nights events in your area.
                </p>
                <Button variant="outline">Get Notified</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event: any) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center relative">
                    <span className="text-gray-500">Event Image</span>
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                      Upcoming
                    </Badge>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">
                        {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        ${event.price}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(event.eventDate).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{event.currentAttendees || 0} / {event.maxAttendees} attendees</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => handleRegister(event.id)}
                      disabled={registerMutation.isPending || (event.currentAttendees || 0) >= event.maxAttendees}
                    >
                      {(event.currentAttendees || 0) >= event.maxAttendees 
                        ? "Event Full" 
                        : registerMutation.isPending 
                        ? "Registering..." 
                        : "Register"
                      }
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">What are Flip Nights?</h3>
                <p className="text-gray-700 mb-4">
                  Flip Nights are monthly community gatherings where skill creators and learners come together 
                  for hands-on workshops, networking, and collaborative learning experiences.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    Interactive workshops and demonstrations
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-secondary rounded-full mr-3"></span>
                    Networking with fellow creators and learners
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                    Access to exclusive skill previews
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    Collaborative projects and challenges
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Next Event</h4>
                  <p className="text-sm text-gray-600">
                    Join us for "Creative Minds Unite" - a multi-skill showcase featuring 
                    art, music, and technology demonstrations.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Host an Event</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Interested in hosting your own Flip Night? We'd love to hear your ideas!
                  </p>
                  <Button variant="outline" size="sm">
                    Contact Us
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
