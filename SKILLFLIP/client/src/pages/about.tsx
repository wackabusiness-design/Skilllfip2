import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Calendar, 
  Star, 
  Shield, 
  Users, 
  DollarSign, 
  Clock, 
  Target,
  Heart,
  Lightbulb,
  CheckCircle
} from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import { Link } from "wouter";

export default function About() {
  const stats = [
    { icon: Users, value: "10,000+", label: "Active Users" },
    { icon: Star, value: "50,000+", label: "Skills Taught" },
    { icon: DollarSign, value: "$2M+", label: "Creator Earnings" },
    { icon: Target, value: "98%", label: "Satisfaction Rate" }
  ];

  const values = [
    {
      icon: Heart,
      title: "Community First",
      description: "We believe in building meaningful connections between learners and creators in local communities."
    },
    {
      icon: Lightbulb,
      title: "Learning for All",
      description: "Everyone has something to teach and something to learn. We make skill sharing accessible to everyone."
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "We prioritize the safety and security of our community with verified creators and secure payments."
    },
    {
      icon: Target,
      title: "Quality Focus",
      description: "We maintain high standards to ensure every learning experience is valuable and transformative."
    }
  ];

  const features = [
    {
      icon: Search,
      title: "Discover Skills",
      description: "Browse hundreds of skills taught by verified local experts."
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Simple scheduling with calendar integration and flexible time slots."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Protected transactions with money held in escrow until session completion."
    },
    {
      icon: Star,
      title: "Quality Assurance",
      description: "Vetted instructors with reviews and ratings from real students."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative hero-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Empowering 
              <span className="text-primary"> Local Learning</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              SkillFlip connects passionate learners with expert creators in their community, 
              making skill development personal, accessible, and transformative.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/browse">Start Learning</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.location.href = "/api/login"}
              >
                Become a Creator
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Impact by the Numbers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how SkillFlip is transforming lives and communities through skill sharing
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  SkillFlip was born from a simple observation: every community is filled with talented 
                  individuals who have valuable skills to share, but traditional learning platforms 
                  often feel impersonal and disconnected from local communities.
                </p>
                <p>
                  We founded SkillFlip to bridge this gap, creating a platform where neighbors can 
                  learn from neighbors, where expertise is shared in person, and where learning 
                  becomes a catalyst for building stronger communities.
                </p>
                <p>
                  Today, thousands of creators and learners use SkillFlip to connect, grow, and 
                  transform their lives through the power of local skill sharing.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Personal</h3>
                <p className="text-sm text-gray-600">Face-to-face learning with real people</p>
              </Card>
              <Card className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Local</h3>
                <p className="text-sm text-gray-600">Connect with experts in your community</p>
              </Card>
              <Card className="p-6 text-center">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Quality</h3>
                <p className="text-sm text-gray-600">Verified creators with proven expertise</p>
              </Card>
              <Card className="p-6 text-center">
                <Clock className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Flexible</h3>
                <p className="text-sm text-gray-600">Learn at your own pace and schedule</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at SkillFlip
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How SkillFlip Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Getting started is simple - find a skill, book a session, and start learning
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Safety & Trust</h2>
              <p className="text-gray-700 mb-6">
                We take the safety and security of our community seriously. Every creator goes through 
                a verification process, and we provide multiple safeguards to ensure positive experiences.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Identity Verification</h4>
                    <p className="text-sm text-gray-600">All creators undergo background checks and identity verification</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Secure Payments</h4>
                    <p className="text-sm text-gray-600">Payments are held in escrow until session completion</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Rating System</h4>
                    <p className="text-sm text-gray-600">Transparent reviews and ratings from verified students</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">24/7 Support</h4>
                    <p className="text-sm text-gray-600">Our support team is available whenever you need help</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="text-center">
                <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Trust Badge</h3>
                <p className="text-gray-700 mb-6">
                  SkillFlip is committed to maintaining the highest standards of safety and trust 
                  in our community.
                </p>
                <Badge className="bg-green-100 text-green-800 text-sm px-4 py-2">
                  Verified Safe Platform
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Creator Information Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">For Creators</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Turn your expertise into income while helping others grow
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <Card className="p-6">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Competitive Earnings</h3>
              <p className="text-sm text-gray-600">Keep 75% of your session fees with transparent pricing</p>
            </Card>
            <Card className="p-6">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Flexible Schedule</h3>
              <p className="text-sm text-gray-600">Set your own availability and teaching preferences</p>
            </Card>
            <Card className="p-6">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Build Community</h3>
              <p className="text-sm text-gray-600">Connect with motivated learners in your area</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Learning Journey?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of learners and creators who are transforming their communities through skill sharing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/browse">Explore Skills</Link>
            </Button>
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => window.location.href = "/api/login"}
            >
              Become a Creator
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
