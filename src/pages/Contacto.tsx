import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Mail, MessageSquare, Phone, Send, MapPin } from 'lucide-react';

export default function Contacto() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Construct WhatsApp message
    const whatsappNumber = '5492613831779';
    const text = `¡Hola! Mi nombre es *${name}*.\n\n*Mensaje:* ${message}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');

    // Show success toast and clear form
    toast({
      title: 'Redirigiendo a WhatsApp',
      description: 'Se ha generado tu mensaje correctamente.',
    });
    
    setName('');
    setMessage('');
    setLoading(false);
  };

  return (
    <Layout>
      <div className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block text-sm uppercase tracking-[0.3em] text-accent font-medium mb-3">
              Contacto
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-medium mb-6">
              Escribinos
            </h1>
            <p className="text-muted-foreground">
              ¿Tenés alguna consulta? Completá el formulario y te responderemos lo antes posible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Form */}
            <div className="bg-card p-8 rounded-sm elegant-shadow">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    required
                  />
                </div>



                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribí tu mensaje..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar Mensaje'}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-xl font-medium mb-4">
                  Otras formas de contacto
                </h3>
                <p className="text-muted-foreground mb-6">
                  También podés comunicarte con nosotros a través de los siguientes medios:
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href="https://wa.me/5492613831779"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 rounded-sm border border-border hover:border-accent/50 transition-colors group"
                >
                  <div className="p-3 rounded-full bg-green-500/10 text-green-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-accent transition-colors">WhatsApp</h4>
                    <p className="text-sm text-muted-foreground">+54 9 261 383-1779</p>
                  </div>
                </a>

                <a
                  href="https://chat.whatsapp.com/JZLo09MEgND9tRyRL7zKG4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 rounded-sm border border-border hover:border-accent/50 transition-colors group"
                >
                  <div className="p-3 rounded-full bg-green-500/10 text-green-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-accent transition-colors">Grupo de WhatsApp</h4>
                    <p className="text-sm text-muted-foreground">Unite a nuestra comunidad</p>
                  </div>
                </a>

                <a
                  href="mailto:5incoindumentaria@gmail.com"
                  className="flex items-center space-x-4 p-4 rounded-sm border border-border hover:border-accent/50 transition-colors group"
                >
                  <div className="p-3 rounded-full bg-accent/10 text-accent">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-accent transition-colors">Email</h4>
                    <p className="text-sm text-muted-foreground">5incoindumentaria@gmail.com</p>
                  </div>
                </a>

                <a
                  href="https://maps.app.goo.gl/nUsGQWeNiGavEQ4U6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 rounded-sm border border-border hover:border-accent/50 transition-colors group"
                >
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-accent transition-colors">Ubicación</h4>
                    <p className="text-sm text-muted-foreground">Ver en Google Maps</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="max-w-5xl mx-auto mt-16 rounded-sm overflow-hidden elegant-shadow border border-border">
            <iframe 
              src="https://maps.google.com/maps?q=-32.8879456,-68.6852061&hl=es&z=16&output=embed" 
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </Layout>

  );
}
