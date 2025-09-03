import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Video, MapPin, Clock } from "lucide-react";

interface SkillCardProps {
  skill: {
    id: number;
    title: string;
    shortDescription: string;
    price: string;
    duration: number;
    sessionType: string;
    location?: string;
    mediaUrls: string[];
    tags: string[];
    isFeatured: boolean;
    creator: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
    category: {
      name: string;
    };
  };
}

export default function SkillCard({ skill }: SkillCardProps) {
  const creatorName = `${skill.creator.firstName} ${skill.creator.lastName}`;
  const sessionTypeIcon = skill.sessionType === "virtual" ? Video : MapPin;

  return (
    <Card className="skill-card">
      <Link href={`/creator/${skill.creator.id}?skill=${skill.id}`}>
        <div className="cursor-pointer">
          {/* Skill Image */}
          <div className="aspect-video bg-gray-200 flex items-center justify-center relative">
            {skill.isFeatured && (
              <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                Featured
              </Badge>
            )}
            {skill.mediaUrls.length > 0 ? (
              <img 
                src={skill.mediaUrls[0]} 
                alt={skill.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500">Skill Image</span>
            )}
          </div>

          <CardContent className="p-6">
            {/* Creator Info */}
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center overflow-hidden">
                {skill.creator.profileImageUrl ? (
                  <img 
                    src={skill.creator.profileImageUrl} 
                    alt={creatorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">
                    {skill.creator.firstName[0]}{skill.creator.lastName[0]}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{creatorName}</h4>
                <p className="text-xs text-gray-600">{skill.category.name}</p>
              </div>
            </div>

            {/* Skill Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {skill.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {skill.shortDescription}
            </p>

            {/* Session Info */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{skill.duration} min</span>
              </div>
              <div className="flex items-center gap-1">
                {sessionTypeIcon === Video ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                <span>{skill.sessionType === "both" ? "Virtual/In-person" : skill.sessionType}</span>
              </div>
            </div>

            {/* Rating and Price */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">5.0</span>
              </div>
              <span className="text-lg font-semibold text-primary">
                ${skill.price}/hr
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {skill.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {skill.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{skill.tags.length - 3} more
                </Badge>
              )}
            </div>

            {/* Book Button */}
            <Button className="w-full" size="sm">
              Book Now
            </Button>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}
