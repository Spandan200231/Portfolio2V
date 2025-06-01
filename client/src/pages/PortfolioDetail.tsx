import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import type { PortfolioItem } from "@shared/schema";

export default function PortfolioDetail() {
  const { id } = useParams();

  const { data: item, isLoading, error } = useQuery<PortfolioItem>({
    queryKey: [`/api/portfolio/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Item Not Found</h1>
              <p className="text-gray-600 mb-6">
                The portfolio item you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="font-bold text-xl text-primary cursor-pointer">
                Spandan Majumder
              </div>
            </Link>
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="overflow-hidden shadow-lg">
          {item.imageUrl && (
            <div className="w-full h-64 md:h-96 overflow-hidden">
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900">
              {item.title}
            </CardTitle>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {item.technologies?.map((tech) => (
                <Badge key={tech} variant="secondary" className="bg-primary/10 text-primary">
                  {tech}
                </Badge>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6">
              {item.projectUrl && (
                <Button asChild>
                  <a href={item.projectUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Live Project
                  </a>
                </Button>
              )}
              {item.githubUrl && (
                <Button variant="outline" asChild>
                  <a href={item.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    View Code
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose max-w-none">
              {item.content ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: item.content }}
                  className="text-gray-700 leading-relaxed"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed text-lg">
                  {item.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
