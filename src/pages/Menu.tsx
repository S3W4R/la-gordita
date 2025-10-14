import { useNavigate } from "react-router-dom";
import { Calendar, Newspaper, Image, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import logo from "@/assets/la-gordita-logo.png";

const menuItems = [
  {
    title: "Eventos",
    description: "Próximos eventos y fiestas",
    icon: Calendar,
    path: "/eventos",
    color: "primary"
  },
  {
    title: "Publicaciones",
    description: "Últimas novedades del bar",
    icon: Newspaper,
    path: "/publicaciones",
    color: "accent"
  },
  {
    title: "Galería",
    description: "Fotos y momentos especiales",
    icon: Image,
    path: "/galeria",
    color: "primary"
  },
  {
    title: "Administración",
    description: "Panel de control",
    icon: Lock,
    path: "/admin",
    color: "accent"
  }
];

const Menu = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Logo Header */}
        <div className="text-center animate-in fade-in duration-500">
          <img 
            src={logo} 
            alt="La Gordita Logo" 
            className="w-32 h-32 mx-auto mb-4"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Menú Principal
          </h1>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-700 delay-200">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                onClick={() => navigate(item.path)}
                className="group cursor-pointer bg-card border-border hover:border-primary transition-all duration-300 overflow-hidden animate-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-8 space-y-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    item.color === 'primary' 
                      ? 'bg-primary/20 text-primary group-hover:shadow-[0_0_30px_rgba(71,184,129,0.4)]' 
                      : 'bg-accent/20 text-accent group-hover:shadow-[0_0_30px_rgba(255,140,66,0.4)]'
                  } transition-all duration-300`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {item.title}
                    </h2>
                    <p className="text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Menu;