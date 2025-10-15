import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import welcomeBg from "@/assets/welcome-bg.jpg";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${welcomeBg})` }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-background/20" />
      
      <div className="relative z-10 text-center space-y-12 max-w-2xl">
        {/* CTA Button */}
        <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
          <Button
            onClick={() => navigate("/menu")}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl px-16 py-8 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_60px_rgba(71,184,129,0.4)] transition-all duration-300 hover:scale-105"
          >
            ENTRAR
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;