import { Layout } from '@/components/layout/Layout';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';

export default function Nosotros() {
  return (
    <Layout>
      <div className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-sm uppercase tracking-[0.3em] text-accent font-medium mb-3">
              Nuestra Historia
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-medium mb-6">
              5inco Indumentaria
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Somos un local de moda femenina dedicado a ofrecer prendas de calidad con diseños únicos. 
              Cada pieza es seleccionada cuidadosamente pensando en la mujer moderna que busca 
              expresar su estilo con elegancia y autenticidad.
            </p>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                title: 'Calidad Premium',
                description: 'Seleccionamos las mejores telas y materiales para garantizar durabilidad y confort.',
              },
              {
                title: 'Diseño Único',
                description: 'Prendas exclusivas que te hacen destacar con estilo propio y personalidad.',
              },
              {
                title: 'Atención Personal',
                description: 'Te asesoramos para encontrar las prendas perfectas que se adapten a tu estilo.',
              },
            ].map((value) => (
              <div key={value.title} className="text-center p-8 bg-card rounded-sm elegant-shadow">
                <h3 className="font-serif text-xl font-medium mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="bg-primary text-primary-foreground rounded-sm p-8 md:p-12">
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-center mb-10">
              Visitanos
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center">
                <MapPin className="h-6 w-6 mb-3 text-gold" />
                <h4 className="font-medium mb-1">Ubicación</h4>
                <p className="text-sm text-primary-foreground/70">
                  Mendoza, Argentina
                </p>
                <a 
                  href="https://maps.app.goo.gl/nUsGQWeNiGavEQ4U6" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] uppercase tracking-wider text-gold hover:underline mt-2"
                >
                  Ver mapa
                </a>
              </div>
              <div className="flex flex-col items-center text-center">
                <Phone className="h-6 w-6 mb-3 text-gold" />
                <h4 className="font-medium mb-1">Teléfono</h4>
                <p className="text-sm text-primary-foreground/70">
                  +54 9 261 383-1779
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Mail className="h-6 w-6 mb-3 text-gold" />
                <h4 className="font-medium mb-1">Email</h4>
                <p className="text-sm text-primary-foreground/70">
                  5incoindumentaria@gmail.com
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Clock className="h-6 w-6 mb-3 text-gold" />
                <h4 className="font-medium mb-1">Horario</h4>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gold uppercase tracking-wider">Lunes a Sábados</p>
                  <p className="text-sm text-primary-foreground/70">
                    Mañana: 10:00 — 13:30
                  </p>
                  <p className="text-sm text-primary-foreground/70">
                    Tarde: 17:00 — 20:30
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
