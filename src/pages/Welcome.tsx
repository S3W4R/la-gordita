import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/la-gordita-logo.png";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="text-center space-y-12 max-w-2xl">
        {/* Logo */}
        <div className="animate-in fade-in duration-500">
          <img 
            src={logo} 
            alt="La Gordita" 
            className="w-80 md:w-96 mx-auto drop-shadow-[0_0_40px_rgba(71,184,129,0.4)]"
          />
        </div>

        {/* Welcome Message */}
        <div className="animate-in fade-in duration-700 slide-in-from-bottom-2">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Bienvenidos a <span className="text-primary">La Gordita</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            El lugar donde la buena vibra, los amigos y los cócteles se mezclan con sabor.
          </p>
        </div>

        {/* CTA Button */}
        <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
          <Button
            onClick={() => navigate("/menu")}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl px-16 py-8 rounded-full shadow-[0_10px_40px_rgba(71,184,129,0.3)] hover:shadow-[0_15px_60px_rgba(71,184,129,0.5)] transition-all duration-300 hover:scale-105"
          >
            Entrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;