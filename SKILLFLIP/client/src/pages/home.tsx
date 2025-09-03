import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen, Star, TrendingUp, Users, DollarSign } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: learnerBookings = [] } = useQuery({
    queryKey: ["/api/bookings?type=learner"],
    enabled: !!user,
  });

  const { data: creatorBookings = [] } = useQuery({
    queryKey: ["/api/bookings?type=creator"],
    enabled: !!user && user.role === "creator",
  });

  const { data: featuredSkills = [] } = useQuery({
    queryKey: ["/api/skills?featured=true"],
  });

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["/api/events"],
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const upcomingBookings = learnerBookings
    .filter((booking: any) => new Date(booking.sessionDate) > new Date())
    .slice(0, 3);

  const recentActivity = [
    ...learnerBookings.slice(0, 2).map((booking: any) => ({
      type: "booking",
      title: `Booked ${booking.skill?.title}`,
      date: booking.createdAt,
      icon: BookOpen,
    })),
    ...creatorBookings.slice(0, 2).map((booking: any) => ({
      type: "earning",
      title: `Earned $${booking.creatorEarnings}`,
      date: booking.createdAt,
      icon: DollarSign,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName || user.email}!
          </h1>
          <p className="text-gray-600">
            {user.role === "creator" 
              ? "Manage your skills and track your earnings" 
              : "Continue your learning journey"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {upcomingBookings.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-accent mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Skills Learned</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {learnerBookings.filter((b: any) => b.status === "completed").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {user.role === "creator" && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-secondary mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${creatorBookings
                            .filter((b: any) => b.paymentStatus === "paid")
                            .reduce((sum: number, b: any) => sum + parseFloat(b.creatorEarnings || "0"), 0)
                            .toFixed(2)
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingBookings.map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{booking.skill?.title}</h4>
                          <p className="text-sm text-gray-600">
                            with {booking.creator?.firstName} {booking.creator?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.sessionDate).toLocaleDateString()} at{" "}
                            {new Date(booking.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <Badge variant={booking.sessionType === "virtual" ? "secondary" : "outline"}>
                          {booking.sessionType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/dashboard">View All Bookings</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity: any, index: number) => {
                      const IconComponent = activity.icon;
                      return (
                        <div key={index} className="flex items-center">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/browse">Browse Skills</Link>
                </Button>
                {user.role === "creator" ? (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/list-skill">List New Skill</Link>
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = "/api/login"}
                  >
                    Become a Creator
                  </Button>
                )}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/flip-nights">Join Flip Nights</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Featured Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featuredSkills.slice(0, 3).map((skill: any) => (
                    <Link key={skill.id} href={`/creator/${skill.creatorId}?skill=${skill.id}`}>
                      <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <h4 className="font-medium text-gray-900 mb-1">{skill.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{skill.shortDescription}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{skill.category?.name}</Badge>
                          <span className="text-sm font-medium text-primary">${skill.price}/hr</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Flip Nights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.slice(0, 2).map((event: any) => (
                      <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(event.eventDate).toLocaleDateString()}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{event.location}</span>
                          <span className="text-sm font-medium text-primary">${event.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/flip-nights">View All Events</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
