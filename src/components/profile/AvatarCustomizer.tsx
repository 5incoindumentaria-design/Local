import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dice5, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── DiceBear Avataaars options ───
const SKIN_COLORS = [
  { id: 'ae5d29', label: 'Moreno Oscuro' },
  { id: 'c68642', label: 'Moreno' },
  { id: 'd08b5b', label: 'Canela' },
  { id: 'e0a66a', label: 'Trigueño' },
  { id: 'edb98a', label: 'Clara' },
  { id: 'f8d25c', label: 'Dorada' },
  { id: 'fd9841', label: 'Tostada' },
  { id: 'ffdbb4', label: 'Piel Suave' },
];

const HAIR_COLORS = [
  { id: '2c1b18', label: 'Negro' },
  { id: '4a312c', label: 'Castaño Oscuro' },
  { id: '724133', label: 'Castaño' },
  { id: 'a55728', label: 'Marrón' },
  { id: 'b58143', label: 'Dorado Oscuro' },
  { id: 'd6b370', label: 'Rubio' },
  { id: 'e8e1e1', label: 'Platino' },
  { id: 'ecdcbf', label: 'Rubio Claro' },
  { id: 'c93305', label: 'Pelirrojo' },
  { id: 'f59797', label: 'Rosa' },
  { id: '000000', label: 'Negro Azabache' },
];

const TOP_TYPES_MALE = [
  { id: 'shortFlat', label: 'Corto Plano' },
  { id: 'shortWaved', label: 'Corto Ondulado' },
  { id: 'shortCurly', label: 'Corto Rizado' },
  { id: 'shortRound', label: 'Corto Redondo' },
  { id: 'theCaesar', label: 'César' },
  { id: 'theCaesarAndSidePart', label: 'César Lateral' },
  { id: 'dreads01', label: 'Rastas Cortas' },
  { id: 'dreads02', label: 'Rastas' },
  { id: 'frizzle', label: 'Despeinado' },
  { id: 'sides', label: 'Rapado Lados' },
  { id: 'noHair', label: 'Sin Pelo' },
];

const TOP_TYPES_FEMALE = [
  { id: 'straight01', label: 'Largo Liso' },
  { id: 'straight02', label: 'Largo Liso 2' },
  { id: 'straightAndStrand', label: 'Largo con Mechón' },
  { id: 'bob', label: 'Bob' },
  { id: 'bun', label: 'Rodete' },
  { id: 'curly', label: 'Largo Rizado' },
  { id: 'curvy', label: 'Largo Ondulado' },
  { id: 'bigHair', label: 'Pelo Voluminoso' },
  { id: 'dreads', label: 'Rastas Largas' },
  { id: 'frida', label: 'Estilo Frida' },
  { id: 'fro', label: 'Afro' },
  { id: 'froBand', label: 'Afro con Vincha' },
  { id: 'miaWallace', label: 'Mia Wallace' },
  { id: 'longButNotTooLong', label: 'Mediano' },
  { id: 'shavedSides', label: 'Rapado Lateral' },
];

const TOP_TYPES_NEUTRAL = [
  { id: 'shortFlat', label: 'Corto Plano' },
  { id: 'shortWaved', label: 'Corto Ondulado' },
  { id: 'straight01', label: 'Largo Liso' },
  { id: 'bob', label: 'Bob' },
  { id: 'bun', label: 'Rodete' },
  { id: 'curly', label: 'Largo Rizado' },
  { id: 'dreads02', label: 'Rastas' },
  { id: 'fro', label: 'Afro' },
  { id: 'noHair', label: 'Sin Pelo' },
];

const FACIAL_HAIR = [
  { id: 'blank', label: 'Sin Barba' },
  { id: 'beardLight', label: 'Barba Ligera' },
  { id: 'beardMedium', label: 'Barba Media' },
  { id: 'beardMajestic', label: 'Barba Majestuosa' },
  { id: 'moustacheFancy', label: 'Bigote Elegante' },
  { id: 'moustacheMagnum', label: 'Bigote Magnum' },
];

const EYES = [
  { id: 'default', label: 'Normal' },
  { id: 'happy', label: 'Feliz' },
  { id: 'wink', label: 'Guiño' },
  { id: 'winkWacky', label: 'Guiño Loco' },
  { id: 'squint', label: 'Entrecerrados' },
  { id: 'surprised', label: 'Sorprendido' },
  { id: 'side', label: 'De Lado' },
  { id: 'hearts', label: 'Corazones' },
  { id: 'xDizzy', label: 'Mareado' },
  { id: 'eyeRoll', label: 'Ojos Rodando' },
];

const EYEBROWS = [
  { id: 'default', label: 'Normal' },
  { id: 'defaultNatural', label: 'Natural' },
  { id: 'flatNatural', label: 'Planas' },
  { id: 'raisedExcited', label: 'Emocionado' },
  { id: 'raisedExcitedNatural', label: 'Emoción Natural' },
  { id: 'upDown', label: 'Arriba/Abajo' },
  { id: 'upDownNatural', label: 'Arriba/Abajo Natural' },
  { id: 'frownNatural', label: 'Ceño Fruncido' },
  { id: 'angryNatural', label: 'Enojado' },
  { id: 'unibrowNatural', label: 'Uniceja' },
];

const MOUTHS = [
  { id: 'default', label: 'Normal' },
  { id: 'smile', label: 'Sonrisa' },
  { id: 'twinkle', label: 'Brillante' },
  { id: 'tongue', label: 'Lengua' },
  { id: 'serious', label: 'Serio' },
  { id: 'disbelief', label: 'Incredulidad' },
  { id: 'eating', label: 'Comiendo' },
  { id: 'grimace', label: 'Mueca' },
  { id: 'sad', label: 'Triste' },
  { id: 'screamOpen', label: 'Grito' },
  { id: 'vomit', label: 'Vomitando' },
];

const ACCESSORIES = [
  { id: 'blank', label: 'Sin Accesorios' },
  { id: 'kurt', label: 'Lentes Kurt' },
  { id: 'prescription01', label: 'Lentes Receta' },
  { id: 'prescription02', label: 'Lentes Gruesos' },
  { id: 'round', label: 'Lentes Redondos' },
  { id: 'sunglasses', label: 'Lentes de Sol' },
  { id: 'wayfarers', label: 'Wayfarers' },
];

const CLOTHES = [
  { id: 'blazerAndShirt', label: 'Blazer + Camisa' },
  { id: 'blazerAndSweater', label: 'Blazer + Sweater' },
  { id: 'collarAndSweater', label: 'Sweater Cuello' },
  { id: 'graphicShirt', label: 'Remera Estampada' },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'overall', label: 'Overol' },
  { id: 'shirtCrewNeck', label: 'Remera Básica' },
  { id: 'shirtScoopNeck', label: 'Remera Escote' },
  { id: 'shirtVNeck', label: 'Remera V' },
];

const CLOTHES_COLORS = [
  { id: '3c4f5c', label: 'Azul Marino' },
  { id: '65c9ff', label: 'Celeste' },
  { id: '5199e4', label: 'Azul' },
  { id: '25557c', label: 'Azul Oscuro' },
  { id: 'e6e6e6', label: 'Gris Claro' },
  { id: '929598', label: 'Gris' },
  { id: '262e33', label: 'Negro' },
  { id: 'ff5c5c', label: 'Rojo' },
  { id: 'ff488e', label: 'Rosa' },
  { id: 'a7ffc4', label: 'Verde Menta' },
  { id: 'ffafb9', label: 'Rosa Claro' },
  { id: 'ffffff', label: 'Blanco' },
];

const BACKGROUND_COLORS = [
  { id: 'transparent', label: 'Transparente' },
  { id: 'b6e3f4', label: 'Celeste' },
  { id: 'c0aede', label: 'Violeta' },
  { id: 'd1d4f9', label: 'Lavanda' },
  { id: 'ffd5dc', label: 'Rosa' },
  { id: 'ffdfbf', label: 'Durazno' },
  { id: 'e8f5e9', label: 'Verde Claro' },
  { id: 'fff9c4', label: 'Amarillo' },
];

type Gender = 'masculino' | 'femenino' | 'otro';

interface AvatarCustomizerProps {
  initialUrl?: string | null;
  onSelect: (url: string) => void;
}

// ─── Section component ───
function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border border-border/40 rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground/90 hover:bg-muted/50 transition-colors"
      >
        <span>{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Pill selector ───
function PillSelector({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
            value === opt.id
              ? "bg-accent text-white border-accent shadow-md shadow-accent/20 scale-105"
              : "bg-muted/40 text-muted-foreground border-transparent hover:border-border hover:bg-muted/70"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Color circle selector ───
function ColorSelector({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          title={opt.label}
          className={cn(
            "w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center relative group",
            value === opt.id ? "border-accent scale-110 shadow-lg shadow-accent/25 ring-2 ring-accent/20" : "border-transparent hover:scale-105 hover:border-border"
          )}
          style={{
            backgroundColor: opt.id === 'transparent' ? 'transparent' : `#${opt.id}`,
            backgroundImage: opt.id === 'transparent'
              ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)'
              : 'none',
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 4px 4px'
          }}
        >
          {value === opt.id && (
            <Check className={cn("h-3.5 w-3.5", ['ffffff', 'e8e1e1', 'ecdcbf', 'ffdbb4', 'e6e6e6', 'a7ffc4', 'ffafb9', 'fff9c4', 'e8f5e9', 'ffdfbf', 'ffd5dc', 'd1d4f9', 'f8d25c', 'transparent'].includes(opt.id) ? 'text-gray-800' : 'text-white')} />
          )}
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] whitespace-nowrap text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export function AvatarCustomizer({ initialUrl, onSelect }: AvatarCustomizerProps) {
  const [gender, setGender] = useState<Gender>('masculino');
  const [skinColor, setSkinColor] = useState('edb98a');
  const [hairColor, setHairColor] = useState('2c1b18');
  const [topType, setTopType] = useState('shortFlat');
  const [facialHair, setFacialHair] = useState('blank');
  const [eyes, setEyes] = useState('default');
  const [eyebrows, setEyebrows] = useState('default');
  const [mouth, setMouth] = useState('smile');
  const [accessories, setAccessories] = useState('blank');
  const [clothes, setClothes] = useState('hoodie');
  const [clothesColor, setClothesColor] = useState('3c4f5c');
  const [bgColor, setBgColor] = useState('transparent');

  // Section toggles
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    gender: true,
    skin: true,
    hair: false,
    face: false,
    accessories: false,
    clothes: false,
    background: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const topTypes = useMemo(() => {
    switch (gender) {
      case 'masculino': return TOP_TYPES_MALE;
      case 'femenino': return TOP_TYPES_FEMALE;
      default: return TOP_TYPES_NEUTRAL;
    }
  }, [gender]);

  // Reset hair when gender changes
  useEffect(() => {
    const validIds = topTypes.map(t => t.id);
    if (!validIds.includes(topType)) {
      setTopType(topTypes[0].id);
    }
    // Hide facial hair for female
    if (gender === 'femenino') {
      setFacialHair('blank');
    }
  }, [gender]);

  const avatarUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('seed', 'custom');
    params.set('skinColor', skinColor);
    params.set('hairColor', hairColor);
    
    if (topType === 'noHair') {
      params.set('topProbability', '0');
    } else {
      params.set('topProbability', '100');
      params.set('top', topType);
    }
    
    if (facialHair === 'blank') {
      params.set('facialHairProbability', '0');
    } else {
      params.set('facialHairProbability', '100');
      params.set('facialHair', facialHair);
    }
    
    if (accessories === 'blank') {
      params.set('accessoriesProbability', '0');
    } else {
      params.set('accessoriesProbability', '100');
      params.set('accessories', accessories);
    }
    
    params.set('eyes', eyes);
    params.set('eyebrows', eyebrows);
    params.set('mouth', mouth);
    params.set('clothing', clothes);
    params.set('clothingColor', clothesColor);
    if (bgColor !== 'transparent') {
      params.set('backgroundColor', bgColor);
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
  }, [skinColor, hairColor, topType, facialHair, eyes, eyebrows, mouth, accessories, clothes, clothesColor, bgColor]);

  useEffect(() => {
    onSelect(avatarUrl);
  }, [avatarUrl]);

  const randomize = () => {
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    setSkinColor(pick(SKIN_COLORS).id);
    setHairColor(pick(HAIR_COLORS).id);
    setTopType(pick(topTypes).id);
    setFacialHair(gender === 'femenino' ? 'blank' : pick(FACIAL_HAIR).id);
    setEyes(pick(EYES).id);
    setEyebrows(pick(EYEBROWS).id);
    setMouth(pick(MOUTHS).id);
    setAccessories(pick(ACCESSORIES).id);
    setClothes(pick(CLOTHES).id);
    setClothesColor(pick(CLOTHES_COLORS).id);
    setBgColor(pick(BACKGROUND_COLORS).id);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* ─── Left: Avatar Preview ─── */}
      <div className="flex flex-col items-center lg:sticky lg:top-0 shrink-0">
        <div className="relative">
          <div
            className="w-44 h-44 rounded-3xl overflow-hidden shadow-2xl border-4 border-background relative"
            style={{
              backgroundColor: bgColor !== 'transparent' ? `#${bgColor}` : 'var(--muted)'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={avatarUrl}
                src={avatarUrl}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              />
            </AnimatePresence>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={randomize}
          className="mt-5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-accent hover:text-white transition-all duration-300 px-5"
        >
          <Dice5 className="h-4 w-4 mr-2" /> Aleatorio
        </Button>
      </div>

      {/* ─── Right: Options ─── */}
      <ScrollArea className="flex-1 max-h-[55vh] lg:max-h-[65vh] pr-2">
        <div className="space-y-3">
          {/* Gender */}
          <Section title="👤 Género" open={openSections.gender} onToggle={() => toggleSection('gender')}>
            <div className="flex gap-2">
              {([
                { id: 'masculino' as Gender, label: '♂ Masculino', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
                { id: 'femenino' as Gender, label: '♀ Femenino', color: 'bg-pink-500/10 border-pink-500/30 text-pink-400' },
                { id: 'otro' as Gender, label: '⚧ Otro', color: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
              ]).map(g => (
                <button
                  key={g.id}
                  onClick={() => setGender(g.id)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                    gender === g.id
                      ? `${g.color} scale-105 shadow-md`
                      : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/70"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Skin */}
          <Section title="🎨 Color de Piel" open={openSections.skin} onToggle={() => toggleSection('skin')}>
            <ColorSelector options={SKIN_COLORS} value={skinColor} onChange={setSkinColor} />
          </Section>

          {/* Hair */}
          <Section title="💇 Peinado y Color de Pelo" open={openSections.hair} onToggle={() => toggleSection('hair')}>
            <div className="space-y-4">
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-2 block">Estilo</Label>
                <PillSelector options={topTypes} value={topType} onChange={setTopType} />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-2 block">Color</Label>
                <ColorSelector options={HAIR_COLORS} value={hairColor} onChange={setHairColor} />
              </div>
              {gender !== 'femenino' && (
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-2 block">Barba / Bigote</Label>
                  <PillSelector options={FACIAL_HAIR} value={facialHair} onChange={setFacialHair} />
                </div>
              )}
            </div>
          </Section>

          {/* Face */}
          <Section title="😊 Expresión Facial" open={openSections.face} onToggle={() => toggleSection('face')}>
            <div className="space-y-4">
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-2 block">Ojos</Label>
                <PillSelector options={EYES} value={eyes} onChange={setEyes} />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-2 block">Cejas</Label>
                <PillSelector options={EYEBROWS} value={eyebrows} onChange={setEyebrows} />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-2 block">Boca</Label>
                <PillSelector options={MOUTHS} value={mouth} onChange={setMouth} />
              </div>
            </div>
          </Section>

          {/* Accessories */}
          <Section title="🕶️ Accesorios" open={openSections.accessories} onToggle={() => toggleSection('accessories')}>
            <PillSelector options={ACCESSORIES} value={accessories} onChange={setAccessories} />
          </Section>

          {/* Clothes */}
          <Section title="👕 Ropa" open={openSections.clothes} onToggle={() => toggleSection('clothes')}>
            <div className="space-y-4">
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-2 block">Tipo</Label>
                <PillSelector options={CLOTHES} value={clothes} onChange={setClothes} />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-2 block">Color de Ropa</Label>
                <ColorSelector options={CLOTHES_COLORS} value={clothesColor} onChange={setClothesColor} />
              </div>
            </div>
          </Section>

          {/* Background */}
          <Section title="🖼️ Fondo" open={openSections.background} onToggle={() => toggleSection('background')}>
            <ColorSelector options={BACKGROUND_COLORS} value={bgColor} onChange={setBgColor} />
          </Section>
        </div>
      </ScrollArea>
    </div>
  );
}
