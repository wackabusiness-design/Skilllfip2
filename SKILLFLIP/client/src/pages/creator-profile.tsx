import { useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Calendar, Clock, Video, Users, Award, CheckCircle } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import SkillCard from "@/components/skill-card";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function CreatorProfile() {
  const [match, params] = useRoute("/creator/:id");
  const [location] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const creatorId = params?.id;
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const highlightedSkillId = urlParams.get('skill');

  const { data: creator } = useQuery({
    queryKey: ["/api/auth/user", creatorId],
    queryFn: () => fetch(`/api/auth/user`, { credentials: "include" }).then(res => res.json()),
    enabled: !!creatorId,
  });

  const { data: creatorSkills = [] } = useQuery({
    queryKey: ["/api/creators", creatorId, "skills"],
    enabled: !!creatorId,
  });

  const { data: creatorReviews = [] } = useQuery({
    queryKey: ["/api/creators", creatorId, "reviews"],
    enabled: !!creatorId,
  });

  if (!match || !creatorId) {
    return <div>Creator not found</div>;
  }

  const averageRating = creatorReviews.length > 0 
    ? creatorReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / creatorReviews.length 
    : 0;

  const totalEarnings = creatorSkills.reduce((sum: number, skill: any) => sum + parseFloat(skill.price || "0"), 0);

  const handleBookSkill = (skillId: number) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to book a skill.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }
    window.location.href = `/booking/${skillId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Creator Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src={creator?.profileImageUrl} />
                <AvatarFallback className="text-2xl">
                  {creator?.firstName?.[0]}{creator?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {creator?.firstName} {creator?.lastName}
                    </h1>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>San Francisco, CA</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{creatorSkills.length}</div>
                      <div className="text-sm text-gray-600">Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">{creatorReviews.length}</div>
                      <div className="text-sm text-gray-600">Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center text-2xl font-bold text-accent">
                        <Star className="h-6 w-6 mr-1 fill-current" />
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 text-lg mb-6">
                  Passionate instructor with expertise in multiple domains. I love sharing knowledge and helping others discover new skills that can transform their lives.
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Creator
                  </Badge>
                  <Badge variant="secondary">Expert Level</Badge>
                  <Badge variant="outline">Professional Background</Badge>
                </div>
                
                <div className="flex gap-4">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Availability
                  </Button>
                  <Button size="lg" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Message Creator
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Creator Content */}
        <Tabs defaultValue="skills" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skills">Skills ({creatorSkills.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({creatorReviews.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>
          
          <TabsContent value="skills" className="mt-6">
            {creatorSkills.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No skills listed yet</h3>
                  <p className="text-gray-600">This creator hasn't added any skills to their profile.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creatorSkills.map((skill: any) => (
                  <Card 
                    key={skill.id} 
                    className={`skill-card ${highlightedSkillId === skill.id.toString() ? 'ring-2 ring-primary' : ''}`}
                  >
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Skill Image</span>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{skill.category?.name}</Badge>
                        {skill.isFeatured && (
                          <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{skill.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{skill.shortDescription}</p>
                      
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{skill.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {skill.sessionType === "virtual" ? (
                            <Video className="h-4 w-4" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                          <span>{skill.sessionType}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">5.0</span>
                        </div>
                        <span className="text-lg font-semibold text-primary">${skill.price}/hr</span>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={() => handleBookSkill(skill.id)}
                      >
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            {creatorReviews.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600">This creator hasn't received any reviews.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {creatorReviews.map((review: any) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.learner?.profileImageUrl} />
                          <AvatarFallback>
                            {review.learner?.firstName?.[0]}{review.learner?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {review.learner?.firstName} {review.learner?.lastName}
                            </h4>
                            <div className="flex items-center">
                              <div className="flex text-yellow-400 mr-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                          <Badge variant="outline" className="text-xs">
                            {review.skill?.title}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About {creator?.firstName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Background</h3>
                    <p className="text-gray-700">
                      With over 10 years of experience in various creative and technical fields, I'm passionate about 
                      sharing knowledge and helping others develop new skills. My teaching philosophy focuses on 
                      hands-on learning and personalized instruction.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Teaching Style</h3>
                    <p className="text-gray-700">
                      I believe in learning by doing. My sessions are interactive, practical, and tailored to each 
                      student's learning pace and goals. I provide detailed feedback and ongoing support to ensure 
                      you master the skills effectively.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Achievements</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Certified Professional Instructor
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        500+ Students Taught
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Top Rated Creator on SkillFlip
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="availability" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-4">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                    <div key={day} className="text-center">
                      <h4 className="font-medium text-gray-900 mb-2">{day}</h4>
                      <div className="space-y-1">
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          9:00 AM - 12:00 PM
                        </div>
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          2:00 PM - 6:00 PM
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <p className="text-sm text-gray-600">
                    * Availability shown in your local timezone. Book in advance to secure your preferred slot.
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
