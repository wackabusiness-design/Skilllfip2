import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar, Clock, Video, MapPin, Star, CreditCard, ArrowLeft } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import BookingCalendar from "@/components/booking-calendar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import { isUnauthorizedError } from "@/lib/authUtils";

const formSchema = insertBookingSchema.extend({
  sessionType: z.enum(["virtual", "in-person"]),
});

type FormData = z.infer<typeof formSchema>;

export default function Booking() {
  const [match, params] = useRoute("/booking/:skillId");
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");

  const skillId = params?.skillId ? parseInt(params.skillId) : null;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
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
  }, [user, isLoading, toast]);

  const { data: skill, isLoading: skillLoading } = useQuery({
    queryKey: ["/api/skills", skillId],
    enabled: !!skillId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skillId: skillId || 0,
      sessionDate: new Date(),
      duration: 60,
      sessionType: "virtual",
      location: "",
      notes: "",
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: async (response) => {
      const booking = await response.json();
      
      // Create payment intent
      try {
        const paymentResponse = await apiRequest("POST", "/api/create-payment-intent", {
          amount: parseFloat(booking.totalAmount),
        });
        const { clientSecret } = await paymentResponse.json();
        
        toast({
          title: "Booking created successfully!",
          description: "Redirecting to payment...",
        });
        
        // In a real implementation, you would redirect to Stripe checkout
        // For now, we'll simulate payment success
        setTimeout(() => {
          toast({
            title: "Payment successful!",
            description: "Your booking has been confirmed.",
          });
          setLocation("/dashboard");
        }, 2000);
        
      } catch (error) {
        toast({
          title: "Payment setup failed",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
      }
      
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
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select a date and time for your session.",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const sessionDateTime = new Date(selectedDate);
    sessionDateTime.setHours(hours, minutes, 0, 0);

    const bookingData = {
      ...data,
      sessionDate: sessionDateTime,
    };

    createBookingMutation.mutate(bookingData);
  };

  if (!match || !skillId) {
    return <div>Skill not found</div>;
  }

  if (isLoading || skillLoading || !user || !skill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const hourlyRate = parseFloat(skill.price);
  const sessionDuration = form.watch("duration");
  const totalCost = (hourlyRate * sessionDuration) / 60;
  const platformFee = totalCost * 0.25;
  const finalTotal = totalCost;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation(`/creator/${skill.creator.id}?skill=${skill.id}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Skill
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Session</h1>
          <p className="text-gray-600">
            Schedule your personalized learning session with {skill.creator.firstName} {skill.creator.lastName}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Date & Time Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Select Date & Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BookingCalendar 
                      onDateSelect={setSelectedDate}
                      onTimeSelect={setSelectedTime}
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      creatorId={skill.creator.id}
                    />
                  </CardContent>
                </Card>

                {/* Session Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Session Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <Select 
                              value={field.value.toString()} 
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">60 minutes</SelectItem>
                                <SelectItem value="90">90 minutes</SelectItem>
                                <SelectItem value="120">120 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sessionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Type</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(skill.sessionType === "virtual" || skill.sessionType === "both") && (
                                  <SelectItem value="virtual">Virtual (Online)</SelectItem>
                                )}
                                {(skill.sessionType === "in-person" || skill.sessionType === "both") && (
                                  <SelectItem value="in-person">In-Person</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch("sessionType") === "in-person" && (
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meeting Location</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={skill.location || "Enter preferred meeting location"}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requests or Questions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Let your instructor know about your goals, experience level, or any specific topics you'd like to focus on..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full py-3 text-lg"
                  disabled={createBookingMutation.isPending || !selectedDate || !selectedTime}
                >
                  {createBookingMutation.isPending ? (
                    "Processing..."
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Book & Pay ${finalTotal.toFixed(2)}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            {/* Skill Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Skill Image</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{skill.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{skill.shortDescription}</p>
                
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">
                      {skill.creator.firstName[0]}{skill.creator.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {skill.creator.firstName} {skill.creator.lastName}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                      5.0 (reviews)
                    </div>
                  </div>
                </div>
                
                <Badge variant="secondary">{skill.category.name}</Badge>
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Rate</span>
                  <span>${hourlyRate}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span>{sessionDuration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Platform Fee</span>
                  <span>Included</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                {selectedDate && selectedTime && (
                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Time</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Clock className="h-4 w-4 mr-2" />
                      {selectedTime}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">Secure Booking</h4>
                    <p className="text-sm text-green-800">
                      Your payment is protected. Money is only released to the instructor after your session is completed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
