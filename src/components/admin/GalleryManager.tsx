import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";

const GalleryManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");

  const { data: images } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { image_url: string; caption: string }) => {
      const { error } = await supabase.from("gallery").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast({ title: "Imagen agregada", description: "La imagen se agregó exitosamente." });
      setImageUrl("");
      setCaption("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast({ title: "Imagen eliminada", description: "La imagen se eliminó exitosamente." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ image_url: imageUrl, caption });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Agregar Nueva Imagen</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image_url">URL de Imagen *</Label>
            <Input
              id="image_url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              required
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Descripción (opcional)</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Descripción de la imagen..."
              className="bg-input border-border"
            />
          </div>

          <Button type="submit" className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Imagen
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">
          Imágenes en la Galería ({images?.length || 0})
        </h2>
        {images && images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="bg-card border-border overflow-hidden group">
                <div className="aspect-square relative">
                  <img
                    src={image.image_url}
                    alt={image.caption || "Gallery image"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(image.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {image.caption && (
                  <div className="p-2 text-xs text-muted-foreground truncate">
                    {image.caption}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border p-8 text-center">
            <p className="text-muted-foreground">No hay imágenes en la galería.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GalleryManager;