import { useState } from 'react';
import { useAuditHistory, AuditEntry } from '@/hooks/useAuditLog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingCart, Package, Percent, DollarSign, Settings, UserCheck, 
  Layers, Clock, RefreshCw, Filter, ChevronDown, ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityHistoryProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  venta: { label: 'Ventas', icon: ShoppingCart, color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
  stock: { label: 'Stock', icon: Layers, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  producto: { label: 'Productos', icon: Package, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  descuento: { label: 'Descuentos', icon: Percent, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  deuda: { label: 'Deudas', icon: DollarSign, color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  config: { label: 'Configuración', icon: Settings, color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
  perfil: { label: 'Perfiles', icon: UserCheck, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  general: { label: 'General', icon: Clock, color: 'bg-muted text-muted-foreground border-border' },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: diffDays > 365 ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function EntryCard({ entry }: { entry: AuditEntry }) {
  const [expanded, setExpanded] = useState(false);
  const config = CATEGORY_CONFIG[entry.category] || CATEGORY_CONFIG.general;
  const Icon = config.icon;
  const hasDetails = entry.details && Object.keys(entry.details).length > 0;

  return (
    <div className="group border rounded-lg p-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('p-2 rounded-lg border shrink-0', config.color)}>
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">{entry.action}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal">
              {entry.profile_name}
            </Badge>
            <span className="text-[10px] text-muted-foreground" title={formatFullDate(entry.created_at)}>
              {formatDate(entry.created_at)}
            </span>
          </div>
        </div>

        {/* Expand button */}
        {hasDetails && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        )}
      </div>

      {/* Expanded details */}
      {expanded && hasDetails && (
        <div className="mt-3 ml-11 p-3 bg-muted/50 rounded-md border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Detalles</p>
          <div className="space-y-1">
            {Object.entries(entry.details).map(([key, value]) => (
              <div key={key} className="flex gap-2 text-xs">
                <span className="text-muted-foreground capitalize shrink-0">{key.replace(/_/g, ' ')}:</span>
                <span className="font-medium truncate">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Group entries by date
function groupByDate(entries: AuditEntry[]): Map<string, AuditEntry[]> {
  const groups = new Map<string, AuditEntry[]>();
  for (const entry of entries) {
    const date = new Date(entry.created_at);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;
    if (date.toDateString() === today.toDateString()) {
      key = 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Ayer';
    } else {
      key = date.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' });
      key = key.charAt(0).toUpperCase() + key.slice(1);
    }

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }
  return groups;
}

export function ActivityHistory({ open, onClose }: ActivityHistoryProps) {
  const {
    entries,
    loading,
    profileFilter,
    setProfileFilter,
    categoryFilter,
    setCategoryFilter,
    profiles,
    refetch,
  } = useAuditHistory();

  const grouped = groupByDate(entries);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-5 border-b bg-primary text-primary-foreground rounded-t-lg">
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historial de Actividad
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/70 text-sm">
            Registro completo de todas las acciones realizadas por los cajeros y administradores.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="p-4 border-b bg-muted/30 flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          
          <Select value={profileFilter} onValueChange={setProfileFilter}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Todos los perfiles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los perfiles</SelectItem>
              {(profiles as any[]).map((p: {id: string, name: string}) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={refetch}
            className="ml-auto h-8 text-xs gap-1"
          >
            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
            Actualizar
          </Button>
        </div>

        {/* Entries */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">Cargando historial...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">Sin actividad registrada</p>
              <p className="text-xs text-muted-foreground mt-1">
                Las acciones de los cajeros aparecerán aquí automáticamente.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {[...grouped.entries()].map(([dateLabel, dateEntries]) => (
                <div key={dateLabel}>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{dateLabel}</h3>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-muted-foreground">{dateEntries.length} acciones</span>
                  </div>
                  <div className="space-y-2">
                    {dateEntries.map(entry => (
                      <EntryCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Mostrando las últimas {entries.length} acciones
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
