import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Publications = () => {
  const navigate = useNavigate();

  const { data: publications, isLoading } = useQuery({
    queryKey: ["publications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/menu")}
            className="hover:bg-primary/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <Newspaper className="w-8 h-8 text-accent" />
              Publicaciones
            </h1>
            <p className="text-muted-foreground mt-1">
              Las últimas novedades de La Gordita
            </p>
          </div>
        </div>

        {/* Publications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              Cargando publicaciones...
            </div>
          ) : publications && publications.length > 0 ? (
            publications.map((publication, index) => (
              <Card
                key={publication.id}
                className="bg-card border-border overflow-hidden hover:border-accent transition-all duration-300 animate-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {publication.image_url && (
                  <div className="aspect-video relative">
                    <img
                      src={publication.image_url}
                      alt={publication.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                      <span 
                        className="text-white font-bold opacity-90 whitespace-nowrap"
                        style={{ 
                          fontSize: 'clamp(1rem, 4vw, 2rem)',
                          transform: 'rotate(45deg)',
                          textShadow: '3px 3px 10px rgba(0,0,0,0.9)',
                          letterSpacing: '0.15em'
                        }}
                      >
                        PROXIMAMENTE
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-3">
                    {publication.title}
                  </h2>
                  {publication.content && (
                    <p className="text-muted-foreground leading-relaxed">
                      {publication.content}
                    </p>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="col-span-2 bg-card border-border p-12 text-center">
              <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No hay publicaciones disponibles.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Publications;