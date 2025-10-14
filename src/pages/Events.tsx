import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Events = () => {
  const navigate = useNavigate();

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      
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
              <Calendar className="w-8 h-8 text-primary" />
              Próximos Eventos
            </h1>
            <p className="text-muted-foreground mt-1">
              No te pierdas nuestras fiestas y eventos especiales
            </p>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Cargando eventos...
            </div>
          ) : events && events.length > 0 ? (
            events.map((event, index) => (
              <Card
                key={event.id}
                className="bg-card border-border overflow-hidden hover:border-primary transition-all duration-300 animate-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="md:flex">
                  {event.image_url && (
                    <div className="md:w-1/3">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 md:flex-1">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h2 className="text-2xl font-bold text-foreground">
                        {event.title}
                      </h2>
                      <div className="text-right whitespace-nowrap">
                        <p className="text-primary font-semibold">
                          {format(new Date(event.event_date), "dd MMM", { locale: es })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.event_date), "HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="bg-card border-border p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No hay eventos programados por el momento.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                ¡Mantente atento para próximas fiestas!
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;