import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, TrendingUp, Zap, Target, BarChart3, MessageSquare } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-secondary/80 to-accent/70" />
        
        <div className="relative z-10 container mx-auto px-4 py-20 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="h-12 w-12 animate-pulse" />
            <h1 className="text-6xl font-bold">Lovble</h1>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
            Transform Your Business Data Into
            <br />
            <span className="text-accent">AI-Powered Marketing Success</span>
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-white/90">
            Upload your business data, get AI-driven insights, and automatically generate 
            engaging social media content for Instagram and LinkedIn
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" variant="hero" className="text-lg px-8">
              <Link to="/auth">Get Started Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary">
              <Link to="/auth">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need To <span className="text-primary">Grow Your Business</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powered by Google Gemini AI, Lovble analyzes your data and creates compelling marketing content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Data Analysis</h3>
                <p className="text-muted-foreground">
                  Upload CSV, Excel, or JSON files. AI analyzes patterns and identifies growth opportunities
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-secondary transition-all duration-300 hover:shadow-[0_0_30px_rgba(100,149,237,0.2)]">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Business Insights</h3>
                <p className="text-muted-foreground">
                  Get actionable recommendations tailored to your industry and business goals
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-all duration-300 hover:shadow-[0_0_30px_rgba(64,224,208,0.2)]">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Content Generation</h3>
                <p className="text-muted-foreground">
                  Automatically create engaging posts optimized for Instagram and LinkedIn
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Problem Solving</h3>
                <p className="text-muted-foreground">
                  Describe your challenge, AI provides data-driven solutions specific to your business
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-secondary transition-all duration-300 hover:shadow-[0_0_30px_rgba(100,149,237,0.2)]">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Instant Results</h3>
                <p className="text-muted-foreground">
                  From data upload to marketing content in minutes, not hours or days
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-all duration-300 hover:shadow-[0_0_30px_rgba(64,224,208,0.2)]">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
                <p className="text-muted-foreground">
                  Built on Google Gemini, the latest in artificial intelligence technology
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-secondary to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join businesses already using AI to drive growth and engagement
          </p>
          <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-white text-primary hover:bg-white/90">
            <Link to="/auth">Start Your Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Lovble. AI-Powered Business Growth Platform.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
