import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Calendar } from "lucide-react";

interface CreatorCardProps {
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    email: string;
  };
  skills: Array<{
    id: number;
    title: string;
    price: string;
    category: {
      name: string;
    };
  }>;
  averageRating?: number;
  totalReviews?: number;
  location?: string;
}

export default function CreatorCard({ creator, skills, averageRating = 5.0, totalReviews = 0, location }: CreatorCardProps) {
  const creatorName = `${creator.firstName} ${creator.lastName}`;
  const minPrice = skills.length > 0 ? Math.min(...skills.map(s => parseFloat(s.price))) : 0;
  const categories = [...new Set(skills.map(s => s.category.name))];

  return (
    <Card className="creator-card">
      <Link href={`/creator/${creator.id}`}>
        <div className="cursor-pointer">
          {/* Creator Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 flex items-center justify-center overflow-hidden">
                {creator.profileImageUrl ? (
                  <img 
                    src={creator.profileImageUrl} 
                    alt={creatorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-xl">
                    {creator.firstName[0]}{creator.lastName[0]}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{creatorName}</h3>
                {location && (
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(averageRating) ? 'fill-current' : ''}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} ({totalReviews} reviews)
              </span>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.slice(0, 3).map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
              {categories.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{categories.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="pt-0 px-6 pb-6">
            {/* Skills Preview */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Featured Skills</h4>
              <div className="space-y-2">
                {skills.slice(0, 2).map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate">{skill.title}</span>
                    <span className="text-sm font-medium text-primary">${skill.price}/hr</span>
                  </div>
                ))}
                {skills.length > 2 && (
                  <p className="text-xs text-gray-500">+{skills.length - 2} more skills</p>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Starting from</span>
              <span className="text-lg font-semibold text-primary">${minPrice}/hr</span>
            </div>

            {/* View Profile Button */}
            <Button className="w-full" size="sm">
              View Profile
            </Button>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}
