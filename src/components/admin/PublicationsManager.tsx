import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit } from "lucide-react";

const PublicationsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
  });

  const { data: publications } = useQuery({
    queryKey: ["admin-publications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("publications").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-publications"] });
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      toast({ title: "Publicación creada", description: "La publicación se creó exitosamente." });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("publications").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-publications"] });
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      toast({ title: "Publicación actualizada", description: "La publicación se actualizó exitosamente." });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("publications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-publications"] });
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      toast({ title: "Publicación eliminada", description: "La publicación se eliminó exitosamente." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ title: "", content: "", image_url: "" });
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

  const handleEdit = (publication: any) => {
    setEditingId(publication.id);
    setFormData({
      title: publication.title,
      content: publication.content || "",
      image_url: publication.image_url || "",
    });
  };

  const canCreateNew = !publications || publications.length < 4;

  return (
    <div className="space-y-6">
      {canCreateNew && (
        <Card className="bg-card border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {editingId ? "Editar Publicación" : "Crear Nueva Publicación"}
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
              <Label htmlFor="content">Contenido</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
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
              <Button type="submit" className="bg-accent hover:bg-accent/90">
                {editingId ? "Actualizar" : "Crear"} Publicación
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      {!canCreateNew && !editingId && (
        <Card className="bg-card border-border p-4">
          <p className="text-muted-foreground text-center">
            Máximo de 4 publicaciones alcanzado. Elimina una para crear otra.
          </p>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">
          Publicaciones Existentes ({publications?.length || 0}/4)
        </h2>
        {publications && publications.length > 0 ? (
          publications.map((publication) => (
            <Card key={publication.id} className="bg-card border-border p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{publication.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{publication.content}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEdit(publication)}
                    className="hover:bg-accent/20"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(publication.id)}
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
            <p className="text-muted-foreground">No hay publicaciones creadas.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicationsManager;