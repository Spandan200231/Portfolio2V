import Navigation from "@/components/Navigation";
import ThreeBackground from "@/components/ThreeBackground";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ThreeBackground />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Creative <span className="text-primary">Developer</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Crafting innovative digital experiences with modern technologies and creative design solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => scrollToSection("portfolio")}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-medium"
              >
                View My Work
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => scrollToSection("contact")}
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-full font-medium"
              >
                Get In Touch
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 floating-animation">
          <div className="w-16 h-16 bg-yellow-400/20 rounded-full"></div>
        </div>
        <div className="absolute bottom-32 right-20 floating-animation" style={{ animationDelay: "-2s" }}>
          <div className="w-12 h-12 bg-primary/20 rounded-full"></div>
        </div>
      </section>

      {/* Rest of the landing page sections would go here */}
      {/* For brevity, showing just the admin login prompt */}
      
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Portfolio Owner?
          </h2>
          <p className="text-gray-600 mb-8">
            Access the admin panel to manage your portfolio content.
          </p>
          <Button asChild>
            <a href="/login" className="bg-primary hover:bg-primary/90 text-white">
              Admin Login
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
