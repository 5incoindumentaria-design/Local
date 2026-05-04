import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Megaphone, Eye, EyeOff, ChevronLeft, ChevronRight, X, Monitor, Smartphone, Home, ShoppingBag, Users, MessageCircle, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const PAGE_OPTIONS = [
  { value: '', label: 'Sin enlace', icon: X, description: 'El anuncio no tendrá link' },
  { value: '/', label: 'Inicio', icon: Home, description: 'Página principal' },
  { value: '/catalogo', label: 'Catálogo', icon: ShoppingBag, description: 'Listado de productos' },
  { value: '/nosotros', label: 'Nosotros', icon: Users, description: 'Información de la tienda' },
  { value: '/contacto', label: 'Contacto', icon: MessageCircle, description: 'Formulario de contacto' },
];

interface Announcement {
  id: string;
  title: string;
  subtitle: string | null;
  link_url: string | null;
  link_text: string | null;
  background_color: string;
  text_color: string;
  is_active: boolean;
  display_order: number;
}

interface AnnouncementManagerProps {
  open: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = [
  { name: 'Dorado', bg: '#D4AF37', text: '#1a1a1a' },
  { name: 'Negro', bg: '#1a1a1a', text: '#ffffff' },
  { name: 'Rojo', bg: '#DC2626', text: '#ffffff' },
  { name: 'Verde', bg: '#16A34A', text: '#ffffff' },
  { name: 'Azul', bg: '#2563EB', text: '#ffffff' },
  { name: 'Rosa', bg: '#EC4899', text: '#ffffff' },
  { name: 'Violeta', bg: '#7C3AED', text: '#ffffff' },
  { name: 'Naranja', bg: '#EA580C', text: '#ffffff' },
];

export function AnnouncementManager({ open, onClose }: AnnouncementManagerProps) {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewPage, setPreviewPage] = useState<string>('/');

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [bgColor, setBgColor] = useState('#D4AF37');
  const [textColor, setTextColor] = useState('#1a1a1a');
  const [isActive, setIsActive] = useState(true);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los anuncios' });
    } else {
      setAnnouncements(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchAnnouncements();
  }, [open]);

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setLinkUrl('');
    setLinkText('');
    setBgColor('#D4AF37');
    setTextColor('#1a1a1a');
    setIsActive(true);
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setTitle(a.title);
    setSubtitle(a.subtitle || '');
    setLinkUrl(a.link_url || '');
    setLinkText(a.link_text || '');
    setBgColor(a.background_color);
    setTextColor(a.text_color);
    setIsActive(a.is_active);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      subtitle: subtitle || null,
      link_url: (linkUrl && linkUrl !== 'none') ? linkUrl : null,
      link_text: (linkUrl && linkUrl !== 'none' && linkText) ? linkText : null,
      background_color: bgColor,
      text_color: textColor,
      is_active: isActive,
      display_order: editing ? editing.display_order : announcements.length,
    };

    if (editing) {
      const { error } = await supabase.from('announcements').update(data).eq('id', editing.id);
      if (error) { toast({ variant: 'destructive', title: 'Error' }); return; }
      toast({ title: 'Anuncio actualizado' });
    } else {
      const { error } = await supabase.from('announcements').insert(data);
      if (error) { toast({ variant: 'destructive', title: 'Error' }); return; }
      toast({ title: 'Anuncio creado' });
    }
    resetForm();
    fetchAnnouncements();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (!error) { toast({ title: 'Anuncio eliminado' }); fetchAnnouncements(); }
  };

  const toggleActive = async (a: Announcement) => {
    const { error } = await supabase.from('announcements').update({ is_active: !a.is_active }).eq('id', a.id);
    if (!error) fetchAnnouncements();
  };

  const pageContentPreview: Record<string, { label: string; content: JSX.Element }> = {
    '/': {
      label: 'Inicio',
      content: (
        <div className="space-y-3">
          <div className="h-28 bg-gradient-to-r from-muted to-muted/50 rounded-lg flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground/50">Hero / Banner Principal</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 bg-muted/50 rounded" /><div className="h-16 bg-muted/50 rounded" /><div className="h-16 bg-muted/50 rounded" />
          </div>
          <div className="h-4 w-24 bg-muted rounded mx-auto" />
        </div>
      ),
    },
    '/catalogo': {
      label: 'Catálogo',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2"><div className="h-4 w-16 bg-muted rounded" /><div className="h-4 w-20 bg-muted rounded" /><div className="flex-1" /><div className="h-6 w-24 bg-muted rounded" /></div>
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3].map(i => <div key={i} className="space-y-1"><div className="h-20 bg-muted/50 rounded" /><div className="h-3 w-16 bg-muted rounded" /><div className="h-3 w-10 bg-muted/70 rounded" /></div>)}
          </div>
        </div>
      ),
    },
    '/nosotros': {
      label: 'Nosotros',
      content: (
        <div className="space-y-2 text-center">
          <div className="h-4 w-32 bg-muted rounded mx-auto" />
          <div className="h-3 w-48 bg-muted/60 rounded mx-auto" />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="h-20 bg-muted/40 rounded" /><div className="h-20 bg-muted/40 rounded" />
          </div>
        </div>
      ),
    },
    '/contacto': {
      label: 'Contacto',
      content: (
        <div className="space-y-2">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="space-y-1.5"><div className="h-7 bg-muted/40 rounded" /><div className="h-7 bg-muted/40 rounded" /><div className="h-14 bg-muted/40 rounded" /></div>
          <div className="h-7 w-24 bg-muted rounded" />
        </div>
      ),
    },
  };

  const LivePreview = () => {
    const displayTitle = title || 'Título del anuncio';
    const currentPageContent = pageContentPreview[previewPage] || pageContentPreview['/'];
    const pageUrl = previewPage === '/' ? '5incoindumentaria.com' : `5incoindumentaria.com${previewPage}`;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vista previa en vivo</Label>
          <div className="flex items-center gap-2">
            {/* Page selector tabs */}
            <div className="flex items-center gap-0.5 bg-muted rounded-full p-0.5">
              {Object.entries(pageContentPreview).map(([path, { label }]) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => setPreviewPage(path)}
                  className={cn("px-2.5 py-1 rounded-full text-[10px] font-medium transition-all",
                    previewPage === path ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >{label}</button>
              ))}
            </div>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-0.5 bg-muted rounded-full p-0.5">
              <button type="button" onClick={() => setPreviewMode('desktop')} className={cn("p-1.5 rounded-full transition-colors", previewMode === 'desktop' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => setPreviewMode('mobile')} className={cn("p-1.5 rounded-full transition-colors", previewMode === 'mobile' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className={cn("border rounded-xl overflow-hidden shadow-lg transition-all mx-auto", previewMode === 'mobile' ? 'max-w-[320px]' : 'w-full')}>
          {/* Browser bar */}
          <div className="bg-muted/80 px-3 py-2 flex items-center gap-2 border-b">
            <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><div className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
            <div className="flex-1 bg-background/60 rounded-md px-3 py-1 text-[10px] text-muted-foreground text-center truncate">{pageUrl}</div>
          </div>

          {/* Banner */}
          <div className="relative py-2.5 px-4 text-center overflow-hidden" style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="flex items-center justify-center gap-2 min-h-[24px]">
              {previewMode === 'desktop' && <button type="button" className="p-1 opacity-50" style={{ color: textColor }}><ChevronLeft className="h-4 w-4" /></button>}
              <div className="flex items-center justify-center gap-2 flex-1 min-w-0">
                <span className={cn("font-medium truncate", previewMode === 'mobile' ? 'text-xs' : 'text-sm')}>{displayTitle}</span>
                {subtitle && previewMode === 'desktop' && <span className="text-sm opacity-80">— {subtitle}</span>}
                {linkText && <span className="text-xs font-medium underline ml-1 shrink-0">{linkText}</span>}
              </div>
              {previewMode === 'desktop' && <button type="button" className="p-1 opacity-50" style={{ color: textColor }}><ChevronRight className="h-4 w-4" /></button>}
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-40" style={{ color: textColor }}><X className="h-3 w-3" /></button>
            </div>
            <div className="flex justify-center gap-1 mt-1">
              <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: textColor }} />
              <div className="w-1.5 h-1.5 rounded-full opacity-50" style={{ backgroundColor: textColor }} />
            </div>
          </div>

          {/* Page-specific fake content */}
          <div className="bg-background p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-5 w-16 bg-muted rounded" />
              <div className="flex gap-2">{['Inicio','Catálogo','Nosotros','Contacto'].map(n => (
                <div key={n} className={cn('text-[8px] px-1.5 py-0.5 rounded', previewPage === PAGE_OPTIONS.find(p=>p.label===n)?.value ? 'bg-accent/20 text-accent font-bold' : 'text-muted-foreground')}>{n}</div>
              ))}</div>
            </div>
            {currentPageContent.content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Gestionar Anuncios
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/70 text-sm">
            Los anuncios aparecen como un banner en la parte superior de la tienda.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-5">
            {showForm ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-bold text-lg">{editing ? 'Editar anuncio' : 'Nuevo anuncio'}</h3>

                {/* Title & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Título *</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ej: ¡30% OFF en toda la tienda!" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Subtítulo <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                    <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Ej: Hasta agotar stock" />
                  </div>
                </div>

                {/* Link - Page Selector */}
                <div className="space-y-3">
                  <Label>Enlazar a una página <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select value={linkUrl || ''} onValueChange={(v) => { setLinkUrl(v); if (v) setPreviewPage(v); }}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Seleccionar página..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_OPTIONS.map(p => {
                          const Icon = p.icon;
                          return (
                            <SelectItem key={p.value} value={p.value || 'none'}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{p.label}</span>
                                <span className="text-[10px] text-muted-foreground ml-1">({p.description})</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <div className="space-y-1">
                      <Input value={linkText} onChange={e => setLinkText(e.target.value)} placeholder="Texto del botón (ej: Ver ofertas)" />
                    </div>
                  </div>
                  {linkUrl && linkUrl !== 'none' && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      El anuncio redirigirá a: <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{linkUrl}</code>
                    </p>
                  )}
                </div>

                {/* Color Presets */}
                <div className="space-y-2">
                  <Label>Estilo rápido</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map(p => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => { setBgColor(p.bg); setTextColor(p.text); }}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all hover:scale-105",
                          bgColor === p.bg ? 'ring-2 ring-offset-2 ring-accent' : 'border-transparent'
                        )}
                        style={{ backgroundColor: p.bg, color: p.text }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Color de fondo</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-12 h-9 p-1 cursor-pointer" />
                      <Input value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1 font-mono text-xs" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Color de texto</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-12 h-9 p-1 cursor-pointer" />
                      <Input value={textColor} onChange={e => setTextColor(e.target.value)} className="flex-1 font-mono text-xs" />
                    </div>
                  </div>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {isActive ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    <Label htmlFor="is-active" className="cursor-pointer text-sm">
                      {isActive ? 'Anuncio visible en la tienda' : 'Anuncio oculto (borrador)'}
                    </Label>
                  </div>
                  <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
                </div>

                {/* Live Preview */}
                <LivePreview />

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit" className="flex-1">{editing ? 'Guardar Cambios' : 'Crear Anuncio'}</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <Button onClick={() => setShowForm(true)} className="w-full gap-2">
                  <Plus className="h-4 w-4" /> Nuevo Anuncio
                </Button>

                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Cargando...</p>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                    <p className="text-muted-foreground font-medium">No hay anuncios</p>
                    <p className="text-xs text-muted-foreground mt-1">¡Creá el primero para promocionar tus ofertas!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map(a => (
                      <div key={a.id} className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                        {/* Mini preview of the banner */}
                        <div
                          className="py-2 px-4 text-center"
                          style={{ backgroundColor: a.background_color, color: a.text_color }}
                        >
                          <p className="font-medium text-sm truncate">{a.title}</p>
                          {a.subtitle && <p className="text-xs opacity-70 truncate">{a.subtitle}</p>}
                          {a.link_text && <span className="text-[10px] underline">{a.link_text}</span>}
                        </div>
                        {/* Controls */}
                        <div className="p-3 flex items-center gap-2 bg-card">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{a.title}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {a.is_active ? '✅ Activo' : '⏸️ Inactivo'} • Orden: {a.display_order + 1}
                            </p>
                          </div>
                          <Switch checked={a.is_active} onCheckedChange={() => toggleActive(a)} className="scale-75" />
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/60 hover:text-destructive" onClick={() => handleDelete(a.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <Button variant="outline" onClick={onClose} className="w-full">Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}