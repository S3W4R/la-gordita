import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Image as ImageIcon, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Gallery = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: images, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
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
              <ImageIcon className="w-8 h-8 text-primary" />
              Galería
            </h1>
            <p className="text-muted-foreground mt-1">
              Revive los mejores momentos en La Gordita
            </p>
          </div>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Cargando galería...
          </div>
        ) : images && images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <Card
                key={image.id}
                onClick={() => setSelectedImage(image.image_url)}
                className="bg-card border-border overflow-hidden cursor-pointer hover:border-primary transition-all duration-300 group animate-in fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="aspect-square relative">
                  <img
                    src={image.image_url}
                    alt={image.caption || "Gallery image"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border p-12 text-center">
            <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              La galería está vacía por el momento.
            </p>
          </Card>
        )}

        {/* Image Modal */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
            <div className="relative">
              <Button
                onClick={() => setSelectedImage(null)}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-5 h-5" />
              </Button>
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Gallery full view"
                  className="w-full h-auto rounded-lg"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Gallery;