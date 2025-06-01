import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, User } from "lucide-react";
import type { CaseStudy } from "@shared/schema";

export default function CaseStudyDetail() {
  const { id } = useParams();

  const { data: study, isLoading, error } = useQuery<CaseStudy>({
    queryKey: [`/api/case-studies/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !study) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Case Study Not Found</h1>
              <p className="text-gray-600 mb-6">
                The case study you're looking for doesn't exist or has been removed.
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
                Back to Case Studies
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="overflow-hidden shadow-lg">
          {study.imageUrl && (
            <div className="w-full h-64 md:h-96 overflow-hidden">
              <img 
                src={study.imageUrl} 
                alt={study.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900">
              {study.title}
            </CardTitle>
            
            <p className="text-xl text-gray-600 mt-4">
              {study.excerpt}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {study.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="border-primary/20 text-primary">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              {study.clientName && (
                <div className="flex items-center text-gray-600">
                  <User className="h-5 w-5 mr-2" />
                  <div>
                    <div className="font-semibold">Client</div>
                    <div>{study.clientName}</div>
                  </div>
                </div>
              )}
              {study.projectDuration && (
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <div>
                    <div className="font-semibold">Duration</div>
                    <div>{study.projectDuration}</div>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose max-w-none">
              <div 
                dangerouslySetInnerHTML={{ __html: study.content }}
                className="text-gray-700 leading-relaxed"
              />
              
              {study.outcome && (
                <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-xl font-semibold text-green-800 mb-4">Outcome</h3>
                  <p className="text-green-700 leading-relaxed">{study.outcome}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
