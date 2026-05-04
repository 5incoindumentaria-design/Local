import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Clock, TrendingUp, Calendar, ChevronLeft, ChevronRight, Save, Settings, FileSpreadsheet, History } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { useAuditLog } from '@/hooks/useAuditLog';

interface PayrollPanelProps {
  open: boolean;
  onClose: () => void;
}

interface Sale {
  id: string;
  total: number;
  created_at: string;
  profile_id: string | null;
}

interface WorkHourEntry {
  id: string;
  profile_id: string;
  date: string;
  hours: number;
  notes: string | null;
}

interface PayrollConfig {
  id: string;
  commission_percent: number;
  hourly_rate: number;
  effective_from: string;
}

interface ProfileInfo {
  id: string;
  name: string;
  role: string;
}

export function PayrollPanel({ open, onClose }: PayrollPanelProps) {
  const { activeProfile } = useAuth();
  const { toast } = useToast();
  const isOwner = activeProfile?.role === 'dueño';
  const { logAction } = useAuditLog();

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [sales, setSales] = useState<Sale[]>([]);
  const [workHours, setWorkHours] = useState<WorkHourEntry[]>([]);
  const [config, setConfig] = useState<PayrollConfig | null>(null);
  const [profiles, setProfiles] = useState<ProfileInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Config editing (owners only)
  const [editCommission, setEditCommission] = useState('10');
  const [editHourlyRate, setEditHourlyRate] = useState('0');
  const [savingConfig, setSavingConfig] = useState(false);

  // Hours input for cashier
  const [todayHours, setTodayHours] = useState('');
  const [todayNotes, setTodayNotes] = useState('');
  const [savingHours, setSavingHours] = useState(false);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  // Selected profile for owners to view
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  useEffect(() => {
    if (open) {
      fetchAll();
      if (activeProfile) {
        setSelectedProfileId(activeProfile.id);
      }
    }
  }, [open, currentWeek]);

  const fetchAll = async () => {
    setLoading(true);
    const ws = format(weekStart, 'yyyy-MM-dd');
    const we = format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');

    const [salesRes, hoursRes, configRes, profilesRes] = await Promise.all([
      supabase.from('sales').select('id, total, created_at, profile_id')
        .gte('created_at', `${ws}T00:00:00`)
        .lte('created_at', `${we}T23:59:59`),
      supabase.from('work_hours').select('*')
        .gte('date', ws)
        .lte('date', we),
      supabase.from('payroll_config').select('*')
        .order('effective_from', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from('profiles').select('id, name, role').order('name'),
    ]);

    setSales(salesRes.data || []);
    setWorkHours(hoursRes.data || []);
    if (configRes.data) {
      setConfig(configRes.data);
      setEditCommission(configRes.data.commission_percent.toString());
      setEditHourlyRate(configRes.data.hourly_rate.toString());
    }
    setProfiles(profilesRes.data || []);
    setLoading(false);
  };

  const getProfileSales = (profileId: string) => {
    return sales.filter(s => s.profile_id === profileId);
  };

  const getProfileHours = (profileId: string) => {
    return workHours.filter(h => h.profile_id === profileId);
  };

  const calcEarnings = (profileId: string) => {
    const pSales = getProfileSales(profileId);
    const pHours = getProfileHours(profileId);
    const totalSold = pSales.reduce((sum, s) => sum + Number(s.total), 0);
    const totalHrs = pHours.reduce((sum, h) => sum + Number(h.hours), 0);
    const commPct = config?.commission_percent || 10;
    const hrRate = config?.hourly_rate || 0;
    const commission = totalSold * (commPct / 100);
    const hoursPayment = totalHrs * hrRate;
    return { totalSold, salesCount: pSales.length, totalHrs, commission, hoursPayment, totalPay: commission + hoursPayment };
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    const { error } = await supabase.from('payroll_config').insert({
      commission_percent: parseFloat(editCommission) || 10,
      hourly_rate: parseFloat(editHourlyRate) || 0,
      effective_from: new Date().toISOString(),
      created_by: activeProfile?.id,
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Error al guardar configuracion' });
    } else {
      toast({ title: 'Configuracion actualizada' });
      await logAction(
        `Configuración de nómina actualizada: Comisión ${editCommission}%, Hora ${formatPrice(parseFloat(editHourlyRate))}`,
        'ajustes',
        { commission: editCommission, hourly_rate: editHourlyRate }
      );
      fetchAll();
    }
    setSavingConfig(false);
  };

  const saveHours = async () => {
    if (!activeProfile) return;
    setSavingHours(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    const hrs = parseFloat(todayHours) || 0;

    const { error } = await supabase.from('work_hours').upsert({
      profile_id: activeProfile.id,
      date: today,
      hours: hrs,
      notes: todayNotes || null,
    }, { onConflict: 'profile_id,date' });

    if (error) {
      toast({ variant: 'destructive', title: 'Error al guardar horas' });
    } else {
      toast({ title: 'Horas registradas' });
      await logAction(
        `Registro de horas: ${hrs}hs para el día ${today}${todayNotes ? ` (${todayNotes})` : ''}`,
        'perfil',
        { hours: hrs, date: today, notes: todayNotes }
      );
      setTodayHours('');
      setTodayNotes('');
      fetchAll();
    }
    setSavingHours(false);
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(p);

  const viewProfileId = isOwner ? selectedProfileId : activeProfile?.id || '';
  const earnings = viewProfileId ? calcEarnings(viewProfileId) : null;
  const viewProfile = profiles.find(p => p.id === viewProfileId);

  const weekDays = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const exportToExcel = () => {
    const cashierProfiles = profiles.filter(p => p.role === 'cajero');
    const data = cashierProfiles.map(p => {
      const e = calcEarnings(p.id);
      return {
        'Empleado': p.name,
        'Ventas Realizadas': e.salesCount,
        'Total Vendido': e.totalSold,
        'Comisión (%)': config?.commission_percent || 10,
        'Monto Comisión': e.commission,
        'Horas Trabajadas': e.totalHrs,
        'Pago por Hora': config?.hourly_rate || 0,
        'Monto por Horas': e.hoursPayment,
        'TOTAL A COBRAR': e.totalPay
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nómina');
    
    // Auto-size columns
    const max_width = data.reduce((w, r) => Math.max(w, r.Empleado.length), 10);
    ws['!cols'] = [{ wch: max_width + 5 }];

    const fileName = `Nomina_Semana_${format(weekStart, 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast({ title: 'Excel generado', description: `Se descargó el reporte ${fileName}` });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Nomina y Comisiones
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando...</div>
          ) : (
            <Tabs defaultValue="resumen" className="w-full">
              <TabsList className="w-full rounded-none border-b bg-muted/30 p-0 h-auto">
                <TabsTrigger value="resumen" className="flex-1 rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Resumen Semanal
                </TabsTrigger>
                <TabsTrigger value="horas" className="flex-1 rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Cargar Horas
                </TabsTrigger>
                {isOwner && (
                  <TabsTrigger value="config" className="flex-1 rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary">
                    Configuracion
                  </TabsTrigger>
                )}
              </TabsList>

              {/* RESUMEN SEMANAL */}
              <TabsContent value="resumen" className="p-4 space-y-4 mt-0">
                {/* Week Navigator */}
                <div className="flex items-center justify-between bg-muted/50 rounded-md p-3">
                  <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-center">
                    <p className="text-sm font-medium">Semana del {format(weekStart, "d 'de' MMMM", { locale: es })}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(weekStart, 'dd/MM')} - {format(weekEnd, 'dd/MM')}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Owner Actions */}
                {isOwner && (
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reportes de Empleados</h4>
                    <Button variant="outline" size="sm" onClick={exportToExcel} className="h-8 gap-2 text-xs border-green-500/50 hover:bg-green-500/10 text-green-600">
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      Exportar Excel
                    </Button>
                  </div>
                )}

                {/* Profile selector for owners */}
                {isOwner && (
                  <div className="flex gap-2 flex-wrap">
                    {profiles.map(p => (
                      <Button
                        key={p.id}
                        variant={selectedProfileId === p.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedProfileId(p.id)}
                      >
                        {p.name}
                        <span className="ml-1 text-[10px] opacity-70">({p.role})</span>
                      </Button>
                    ))}
                  </div>
                )}

                {earnings && viewProfile && (
                  <>
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground">Ganancias de <strong>{viewProfile.name}</strong></p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-card border rounded-md p-4 text-center">
                        <TrendingUp className="h-5 w-5 mx-auto mb-1 text-accent" />
                        <p className="text-2xl font-bold">{formatPrice(earnings.totalSold)}</p>
                        <p className="text-xs text-muted-foreground">{earnings.salesCount} ventas realizadas</p>
                      </div>
                      <div className="bg-card border rounded-md p-4 text-center">
                        <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-500" />
                        <p className="text-2xl font-bold">{formatPrice(earnings.commission)}</p>
                        <p className="text-xs text-muted-foreground">Comision ({config?.commission_percent}%)</p>
                      </div>
                      <div className="bg-card border rounded-md p-4 text-center">
                        <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                        <p className="text-2xl font-bold">{earnings.totalHrs}hs</p>
                        <p className="text-xs text-muted-foreground">Horas trabajadas</p>
                      </div>
                      <div className="bg-card border rounded-md p-4 text-center">
                        <DollarSign className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                        <p className="text-2xl font-bold">{formatPrice(earnings.hoursPayment)}</p>
                        <p className="text-xs text-muted-foreground">Por horas ({formatPrice(config?.hourly_rate || 0)}/hr)</p>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="bg-primary text-primary-foreground rounded-md p-4 text-center">
                      <p className="text-sm opacity-80">Total a cobrar esta semana</p>
                      <p className="text-3xl font-bold mt-1">{formatPrice(earnings.totalPay)}</p>
                    </div>

                    {/* Daily breakdown */}
                    <div>
                      <p className="text-sm font-medium mb-2">Detalle por dia</p>
                      <div className="space-y-1">
                        {weekDays.map(day => {
                          const dayStr = format(day, 'yyyy-MM-dd');
                          const daySales = sales.filter(s => s.profile_id === viewProfileId && s.created_at.startsWith(dayStr));
                          const dayHrs = workHours.find(h => h.profile_id === viewProfileId && h.date === dayStr);
                          const dayTotal = daySales.reduce((s, sale) => s + Number(sale.total), 0);
                          return (
                            <div key={dayStr} className="flex items-center justify-between text-sm bg-muted/30 rounded px-3 py-2">
                              <span className="capitalize">{format(day, 'EEEE d', { locale: es })}</span>
                              <div className="flex items-center gap-4 text-xs">
                                {dayHrs && <span className="text-blue-500">{dayHrs.hours}hs</span>}
                                <span className={daySales.length > 0 ? 'font-medium' : 'text-muted-foreground'}>
                                  {daySales.length > 0 ? `${daySales.length} ventas - ${formatPrice(dayTotal)}` : 'Sin ventas'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* CARGAR HORAS */}
              <TabsContent value="horas" className="p-4 space-y-4 mt-0">
                <div className="bg-card border rounded-md p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-accent" />
                    <h3 className="font-medium">Registrar horas de hoy ({format(new Date(), "EEEE d 'de' MMMM", { locale: es })})</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Cantidad de horas</Label>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        max="24"
                        value={todayHours}
                        onChange={e => setTodayHours(e.target.value)}
                        placeholder="Ej: 8"
                      />
                    </div>
                    <div>
                      <Label>Notas (opcional)</Label>
                      <Input
                        value={todayNotes}
                        onChange={e => setTodayNotes(e.target.value)}
                        placeholder="Ej: Turno tarde"
                      />
                    </div>
                  </div>
                  <Button onClick={saveHours} disabled={savingHours || !todayHours} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {savingHours ? 'Guardando...' : 'Guardar Horas'}
                  </Button>
                </div>

                {/* This week's hours */}
                <div>
                  <p className="text-sm font-medium mb-2">Horas esta semana</p>
                  <div className="space-y-1">
                    {weekDays.map(day => {
                      const dayStr = format(day, 'yyyy-MM-dd');
                      const entry = workHours.find(h => h.profile_id === activeProfile?.id && h.date === dayStr);
                      return (
                        <div key={dayStr} className="flex items-center justify-between text-sm bg-muted/30 rounded px-3 py-2">
                          <span className="capitalize">{format(day, 'EEEE d', { locale: es })}</span>
                          <span className={entry ? 'font-medium text-blue-500' : 'text-muted-foreground'}>
                            {entry ? `${entry.hours} horas${entry.notes ? ` - ${entry.notes}` : ''}` : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* CONFIGURACION (owners only) */}
              {isOwner && (
                <TabsContent value="config" className="p-4 space-y-4 mt-0">
                  <div className="bg-card border rounded-md p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-5 w-5 text-accent" />
                      <h3 className="font-medium">Configuracion de Pagos</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Los cambios aplican desde el momento en que se guardan. El historico anterior conserva las tasas antiguas.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Comision por venta (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={editCommission}
                          onChange={e => setEditCommission(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Sobre el total vendido (precio final)</p>
                      </div>
                      <div>
                        <Label>Pago por hora ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={editHourlyRate}
                          onChange={e => setEditHourlyRate(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Por cada hora trabajada</p>
                      </div>
                    </div>
                    <Button onClick={saveConfig} disabled={savingConfig} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      {savingConfig ? 'Guardando...' : 'Actualizar Configuracion'}
                    </Button>
                  </div>

                  {/* All cashiers summary */}
                  <div>
                    <p className="text-sm font-medium mb-2">Resumen de todos los perfiles</p>
                    <div className="space-y-2">
                      {profiles.filter(p => p.role === 'cajero').map(profile => {
                        const e = calcEarnings(profile.id);
                        return (
                          <div key={profile.id} className="bg-muted/30 rounded-md p-3 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{profile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {e.salesCount} ventas | {e.totalHrs}hs trabajadas
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-accent">{formatPrice(e.totalPay)}</p>
                              <p className="text-[10px] text-muted-foreground">
                                Com: {formatPrice(e.commission)} + Hrs: {formatPrice(e.hoursPayment)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
