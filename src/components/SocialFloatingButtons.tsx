import { Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SocialFloatingButtons = () => {
  const whatsappNumber = "611565522";
  const instagramHandle = "lagordita_mx";

  const handleWhatsApp = () => {
    window.open(`https://wa.me/52${whatsappNumber}`, "_blank");
  };

  const handleInstagram = () => {
    window.open(`https://instagram.com/${instagramHandle}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <Button
        onClick={handleWhatsApp}
        size="icon"
        className="h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>
      
      <Button
        onClick={handleInstagram}
        size="icon"
        className="h-14 w-14 rounded-full bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Seguir en Instagram"
      >
        <Instagram className="h-7 w-7" />
      </Button>
    </div>
  );
};

export default SocialFloatingButtons;
