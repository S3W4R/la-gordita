import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/la-gordita-logo.png";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-accent/10" />
      
      <div className="relative z-10 text-center space-y-8 max-w-2xl">
        {/* Logo */}
        <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
          <img 
            src={logo} 
            alt="La Gordita Logo" 
            className="w-64 h-64 mx-auto drop-shadow-[0_0_40px_rgba(71,184,129,0.3)]"
          />
        </div>

        {/* Welcome message */}
        <div className="space-y-4 animate-in fade-in duration-700 delay-200 slide-in-from-bottom-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Bienvenidos a <span className="text-primary">La Gordita</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            El lugar donde la buena vibra, los amigos y los cócteles se mezclan con sabor.
          </p>
        </div>

        {/* CTA Button */}
        <div className="animate-in fade-in duration-700 delay-300 slide-in-from-bottom-4">
          <Button
            onClick={() => navigate("/menu")}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-12 py-6 rounded-full shadow-[0_0_40px_rgba(71,184,129,0.3)] hover:shadow-[0_0_60px_rgba(71,184,129,0.5)] transition-all duration-300"
          >
            Entrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;