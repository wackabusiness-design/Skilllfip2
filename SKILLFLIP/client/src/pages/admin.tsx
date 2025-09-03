import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Star,
  Search,
  Filter,
  Eye,
  Edit
} from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Admin() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      toast({
        title: "Unauthorized",
        description: "You don't have admin access.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && user.role === "admin",
  });

  const { data: pendingSkills = [] } = useQuery({
    queryKey: ["/api/admin/skills/pending"],
    enabled: !!user && user.role === "admin",
  });

  const { data: allSkills = [] } = useQuery({
    queryKey: ["/api/skills"],
    enabled: !!user && user.role === "admin",
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: !!user && user.role === "admin",
  });

  const approveSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      return await apiRequest("PATCH", `/api/admin/skills/${skillId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Skill approved",
        description: "The skill has been approved and is now live.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
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
        description: "Failed to approve skill.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleApproveSkill = (skillId: number) => {
    approveSkillMutation.mutate(skillId);
  };

  const filteredPendingSkills = pendingSkills.filter((skill: any) =>
    skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.creator?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.creator?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage platform operations, review content, and monitor performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-secondary mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Skills</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalSkills || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-accent mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalBookings || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${parseFloat(stats?.totalRevenue || "0").toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="pending-skills">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending-skills">
              Pending Skills ({pendingSkills.length})
            </TabsTrigger>
            <TabsTrigger value="all-skills">All Skills</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Pending Skills */}
          <TabsContent value="pending-skills" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Skills Awaiting Approval</span>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Input
                        placeholder="Search skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPendingSkills.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No skills are currently waiting for approval.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPendingSkills.map((skill: any) => (
                      <div key={skill.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {skill.title}
                              </h3>
                              <Badge variant="secondary">{skill.category?.name}</Badge>
                              <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                            </div>
                            
                            <p className="text-gray-600 mb-3">{skill.shortDescription}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              <span>By {skill.creator?.firstName} {skill.creator?.lastName}</span>
                              <span>${skill.price}/hr</span>
                              <span>{skill.duration} minutes</span>
                              <span>{skill.sessionType}</span>
                            </div>
                            
                            <p className="text-gray-700 text-sm">
                              {skill.description}
                            </p>
                            
                            {skill.tags && skill.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {skill.tags.map((tag: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-6">
                            <Button
                              size="sm"
                              onClick={() => handleApproveSkill(skill.id)}
                              disabled={approveSkillMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <strong>Submitted:</strong> {new Date(skill.createdAt).toLocaleDateString()} at{" "}
                          {new Date(skill.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Skills */}
          <TabsContent value="all-skills" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Skills Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allSkills.slice(0, 12).map((skill: any) => (
                    <Card key={skill.id} className="overflow-hidden">
                      <div className="aspect-video bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Skill Image</span>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{skill.category?.name}</Badge>
                          <div className="flex items-center gap-1">
                            {skill.isApproved ? (
                              <Badge className="bg-green-100 text-green-800">Live</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                            )}
                            {skill.isFeatured && (
                              <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
                            )}
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-1">{skill.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">
                          by {skill.creator?.firstName} {skill.creator?.lastName}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-primary">
                            ${skill.price}/hr
                          </span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings */}
          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allBookings.slice(0, 10).map((booking: any) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {booking.skill?.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {booking.learner?.firstName} {booking.learner?.lastName} → {booking.creator?.firstName} {booking.creator?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.sessionDate).toLocaleDateString()} at{" "}
                            {new Date(booking.sessionDate).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            booking.status === "completed" ? "bg-green-100 text-green-800" :
                            booking.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                            booking.status === "cancelled" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }>
                            {booking.status}
                          </Badge>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            ${booking.totalAmount}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                  <p className="text-gray-600">
                    Advanced user management features coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
