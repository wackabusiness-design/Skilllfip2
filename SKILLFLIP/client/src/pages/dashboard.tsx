import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Calendar, 
  DollarSign, 
  Star, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Eye
} from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import ReviewForm from "@/components/review-form";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);

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

  const { data: creatorSkills = [] } = useQuery({
    queryKey: ["/api/creators", user?.id, "skills"],
    enabled: !!user && user.role === "creator",
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      return await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Booking updated",
        description: "Booking status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleStatusUpdate = (bookingId: number, status: string) => {
    updateBookingStatusMutation.mutate({ bookingId, status });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate stats
  const totalLearnerBookings = learnerBookings.length;
  const completedLearnerBookings = learnerBookings.filter((b: any) => b.status === "completed").length;
  const totalCreatorBookings = creatorBookings.length;
  const totalEarnings = creatorBookings
    .filter((b: any) => b.paymentStatus === "paid")
    .reduce((sum: number, b: any) => sum + parseFloat(b.creatorEarnings || "0"), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            {user.role === "creator" 
              ? "Manage your skills and track your teaching progress" 
              : "Track your learning journey and manage bookings"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {user.role === "creator" ? "Total Bookings" : "Skills Learned"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.role === "creator" ? totalCreatorBookings : completedLearnerBookings}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-secondary mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.role === "creator" 
                      ? creatorBookings.filter((b: any) => b.status === "confirmed").length
                      : learnerBookings.filter((b: any) => b.status === "confirmed").length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {user.role === "creator" && (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-accent mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Listed Skills</p>
                      <p className="text-2xl font-bold text-gray-900">{creatorSkills.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {user.role === "learner" && (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-accent mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Rating Given</p>
                      <p className="text-2xl font-bold text-gray-900">4.8</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-secondary mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Learning Streak</p>
                      <p className="text-2xl font-bold text-gray-900">12 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue={user.role === "creator" ? "creator-bookings" : "learner-bookings"}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="learner-bookings">My Bookings</TabsTrigger>
            {user.role === "creator" && (
              <>
                <TabsTrigger value="creator-bookings">Student Bookings</TabsTrigger>
                <TabsTrigger value="skills">My Skills</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Learner Bookings */}
          <TabsContent value="learner-bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>My Learning Sessions</span>
                  <Button asChild>
                    <Link href="/browse">Book New Skill</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {learnerBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-4">Start your learning journey by booking your first skill!</p>
                    <Button asChild>
                      <Link href="/browse">Browse Skills</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {learnerBookings.map((booking: any) => (
                      <div key={booking.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {booking.skill?.title}
                            </h3>
                            <p className="text-gray-600 mb-2">
                              with {booking.creator?.firstName} {booking.creator?.lastName}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{new Date(booking.sessionDate).toLocaleDateString()}</span>
                              <span>{new Date(booking.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span>{booking.duration} minutes</span>
                              <Badge variant="outline">{booking.sessionType}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1">{booking.status}</span>
                            </Badge>
                            <span className="text-lg font-semibold text-gray-900">
                              ${booking.totalAmount}
                            </span>
                          </div>
                        </div>
                        
                        {booking.notes && (
                          <p className="text-gray-700 bg-gray-50 p-3 rounded mb-4">
                            <strong>Notes:</strong> {booking.notes}
                          </p>
                        )}
                        
                        <div className="flex gap-2">
                          {booking.status === "completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedBookingForReview(booking)}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Leave Review
                            </Button>
                          )}
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/creator/${booking.creator?.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Creator
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Creator Bookings */}
          {user.role === "creator" && (
            <TabsContent value="creator-bookings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {creatorBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                      <p className="text-gray-600 mb-4">Students will appear here when they book your skills.</p>
                      <Button asChild>
                        <Link href="/list-skill">List a New Skill</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {creatorBookings.map((booking: any) => (
                        <div key={booking.id} className="border rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {booking.skill?.title}
                              </h3>
                              <p className="text-gray-600 mb-2">
                                with {booking.learner?.firstName} {booking.learner?.lastName}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{new Date(booking.sessionDate).toLocaleDateString()}</span>
                                <span>{new Date(booking.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span>{booking.duration} minutes</span>
                                <Badge variant="outline">{booking.sessionType}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(booking.status)}>
                                {getStatusIcon(booking.status)}
                                <span className="ml-1">{booking.status}</span>
                              </Badge>
                              <span className="text-lg font-semibold text-gray-900">
                                ${booking.creatorEarnings}
                              </span>
                            </div>
                          </div>
                          
                          {booking.notes && (
                            <p className="text-gray-700 bg-gray-50 p-3 rounded mb-4">
                              <strong>Student Notes:</strong> {booking.notes}
                            </p>
                          )}
                          
                          <div className="flex gap-2">
                            {booking.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                                  disabled={updateBookingStatusMutation.isPending}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                                  disabled={updateBookingStatusMutation.isPending}
                                >
                                  Decline
                                </Button>
                              </>
                            )}
                            {booking.status === "confirmed" && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(booking.id, "completed")}
                                disabled={updateBookingStatusMutation.isPending}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Creator Skills */}
          {user.role === "creator" && (
            <TabsContent value="skills" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>My Skills</span>
                    <Button asChild>
                      <Link href="/list-skill">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Skill
                      </Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {creatorSkills.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No skills listed yet</h3>
                      <p className="text-gray-600 mb-4">Create your first skill listing to start earning!</p>
                      <Button asChild>
                        <Link href="/list-skill">List Your First Skill</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {creatorSkills.map((skill: any) => (
                        <Card key={skill.id} className="overflow-hidden">
                          <div className="aspect-video bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">Skill Image</span>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="secondary">{skill.category?.name}</Badge>
                              <div className="flex items-center gap-1">
                                {skill.isApproved ? (
                                  <Badge className="bg-green-100 text-green-800">Approved</Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                )}
                                {skill.isFeatured && (
                                  <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
                                )}
                              </div>
                            </div>
                            
                            <h3 className="font-semibold text-gray-900 mb-2">{skill.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {skill.shortDescription}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold text-primary">
                                ${skill.price}/hr
                              </span>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/creator/${user.id}?skill=${skill.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Review Modal */}
      {selectedBookingForReview && (
        <ReviewForm
          booking={selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          onSuccess={() => {
            setSelectedBookingForReview(null);
            queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
          }}
        />
      )}

      <Footer />
    </div>
  );
}
