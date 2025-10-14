import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";

const EventsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    image_url: "",
  });

  const { data: events } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("events").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "Evento creado", description: "El evento se creó exitosamente." });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("events").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "Evento actualizado", description: "El evento se actualizó exitosamente." });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "Evento eliminado", description: "El evento se eliminó exitosamente." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", event_date: "", image_url: "" });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (event: any) => {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      description: event.description || "",
      event_date: event.event_date.split("+")[0],
      image_url: event.image_url || "",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">
          {editingId ? "Editar Evento" : "Crear Nuevo Evento"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_date">Fecha y Hora *</Label>
            <Input
              id="event_date"
              type="datetime-local"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              required
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL de Imagen</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://..."
              className="bg-input border-border"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {editingId ? "Actualizar" : "Crear"} Evento
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Eventos Existentes</h2>
        {events && events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id} className="bg-card border-border p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  <p className="text-sm text-primary mt-2">
                    {format(new Date(event.event_date), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEdit(event)}
                    className="hover:bg-primary/20"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(event.id)}
                    className="hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="bg-card border-border p-8 text-center">
            <p className="text-muted-foreground">No hay eventos creados.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EventsManager;