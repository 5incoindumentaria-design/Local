import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, DollarSign, History, CheckCircle, Search, CreditCard, Banknote, ArrowRightLeft, Plus, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Debtor {
  id: string;
  name: string;
  phone: string | null;
  total_debt: number;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

interface DebtManagerProps {
  open: boolean;
  onClose: () => void;
}

export function DebtManager({ open, onClose }: DebtManagerProps) {
  const { toast } = useToast();
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const [showNewDebtorForm, setShowNewDebtorForm] = useState(false);
  const [newDebtorName, setNewDebtorName] = useState('');
  const [newDebtorPhone, setNewDebtorPhone] = useState('');
  const [addingDebtor, setAddingDebtor] = useState(false);

  const [debtorToDelete, setDebtorToDelete] = useState<Debtor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDebtors = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('debtors')
      .select('*')
      .order('total_debt', { ascending: false });
    setDebtors(data || []);
    setLoading(false);
  };

  const fetchPayments = async (debtorId: string) => {
    setLoadingPayments(true);
    const { data } = await supabase
      .from('debtor_payments')
      .select('*')
      .eq('debtor_id', debtorId)
      .order('created_at', { ascending: false });
    setPayments(data || []);
    setLoadingPayments(false);
  };

  useEffect(() => {
    if (open) fetchDebtors();
  }, [open]);

  useEffect(() => {
    if (selectedDebtor) fetchPayments(selectedDebtor.id);
  }, [selectedDebtor]);

  const filteredDebtors = debtors.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(p);

  const handleRegisterPayment = async () => {
    if (!selectedDebtor || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (amount <= 0) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('debtor_payments')
        .insert({ debtor_id: selectedDebtor.id, amount, payment_method: paymentMethod, notes: paymentNotes });
      if (error) throw error;

      toast({ title: 'Pago registrado', description: `Se acreditaron ${formatPrice(amount)} a la cuenta de ${selectedDebtor.name}` });
      setSelectedDebtor({ ...selectedDebtor, total_debt: selectedDebtor.total_debt - amount });
      setShowPaymentForm(false);
      setPaymentAmount('');
      setPaymentNotes('');
      fetchDebtors();
      fetchPayments(selectedDebtor.id);
    } catch {
      toast({ variant: 'destructive', title: 'Error al registrar pago' });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteDebtor = async () => {
    if (!debtorToDelete) return;
    setDeleting(true);
    try {
      // Delete payments first (cascade)
      await supabase.from('debtor_payments').delete().eq('debtor_id', debtorToDelete.id);
      const { error } = await supabase.from('debtors').delete().eq('id', debtorToDelete.id);
      if (error) throw error;

      toast({ title: 'Deudor eliminado', description: `Se eliminó a "${debtorToDelete.name}" y todo su historial.` });
      if (selectedDebtor?.id === debtorToDelete.id) setSelectedDebtor(null);
      fetchDebtors();
    } catch {
      toast({ variant: 'destructive', title: 'Error al eliminar deudor' });
    } finally {
      setDeleting(false);
      setDebtorToDelete(null);
    }
  };

  const hasDebt = (d: Debtor) => d.total_debt > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b bg-accent text-accent-foreground rounded-t-lg">
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cuentas Corrientes (Deudores)
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: List */}
          <div className="w-1/3 border-r flex flex-col">
            <div className="p-3 border-b space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar deudor..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 h-9" />
              </div>
              <Button className="w-full h-9 gap-2" onClick={() => setShowNewDebtorForm(true)}>
                <Plus className="h-4 w-4" /> Agregar deudor
              </Button>
            </div>
            <ScrollArea className="flex-1">
              {loading ? (
                <p className="text-center p-4 text-sm">Cargando...</p>
              ) : filteredDebtors.length === 0 ? (
                <p className="text-center p-8 text-sm text-muted-foreground">No hay deudores registrados.</p>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredDebtors.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDebtor(d)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all border relative group",
                        selectedDebtor?.id === d.id
                          ? hasDebt(d) ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'
                          : hasDebt(d) ? 'border-red-500/15 hover:bg-red-500/5' : 'border-green-500/15 hover:bg-green-500/5'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          hasDebt(d) ? "bg-red-500" : "bg-green-500"
                        )} />
                        <p className="font-medium text-sm truncate flex-1">{d.name}</p>
                        {/* Delete button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setDebtorToDelete(d); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-destructive/60 hover:text-destructive"
                          title="Eliminar deudor"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1 ml-4">
                        <p className={cn("text-xs font-bold", hasDebt(d) ? 'text-red-500' : 'text-green-600')}>
                          {hasDebt(d) ? `Debe ${formatPrice(d.total_debt)}` : 'Al día ✓'}
                        </p>
                        {!hasDebt(d) && <ShieldCheck className="h-3.5 w-3.5 text-green-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right: Details */}
          <div className="flex-1 flex flex-col bg-muted/10">
            {selectedDebtor ? (
              <>
                {/* Debtor header with status color */}
                <div className={cn(
                  "p-4 border-b flex justify-between items-start",
                  hasDebt(selectedDebtor) ? "bg-red-500/5" : "bg-green-500/5"
                )}>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-serif font-bold">{selectedDebtor.name}</h3>
                      {!hasDebt(selectedDebtor) && (
                        <Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-[10px]">Al día</Badge>
                      )}
                      {hasDebt(selectedDebtor) && (
                        <Badge variant="destructive" className="bg-red-500/15 text-red-500 border-red-500/30 text-[10px]">Debe</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" /> {selectedDebtor.phone || 'Sin teléfono'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Cliente desde {new Date(selectedDebtor.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Saldo</p>
                    <p className={cn("text-2xl font-bold", hasDebt(selectedDebtor) ? 'text-red-500' : 'text-green-600')}>
                      {formatPrice(selectedDebtor.total_debt)}
                    </p>
                  </div>
                </div>

                <div className="flex-1 p-4 flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <History className="h-4 w-4" /> Historial de Pagos
                    </h4>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={() => setDebtorToDelete(selectedDebtor)}
                      >
                        <Trash2 className="h-3 w-3" /> Eliminar
                      </Button>
                      <Button size="sm" onClick={() => setShowPaymentForm(true)} disabled={selectedDebtor.total_debt <= 0}>
                        Registrar Entrega
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    {loadingPayments ? (
                      <p className="text-center py-8">Cargando pagos...</p>
                    ) : payments.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <DollarSign className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-2" />
                        <p className="text-muted-foreground">No hay pagos registrados aún.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {payments.map(p => (
                          <div key={p.id} className="bg-background p-3 rounded-lg border flex justify-between items-center hover:shadow-sm transition-shadow">
                            <div>
                              <p className="font-bold text-green-600">{formatPrice(p.amount)}</p>
                              <p className="text-[10px] text-muted-foreground uppercase">
                                {p.payment_method} • {new Date(p.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                {' • '}
                                {new Date(p.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {p.notes && <p className="text-xs mt-1 text-muted-foreground italic">"{p.notes}"</p>}
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                <User className="h-16 w-16 mb-4 opacity-10" />
                <p className="font-medium">Seleccioná un deudor</p>
                <p className="text-xs mt-1">Para ver los detalles de su cuenta e historial.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Payment Modal */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Registrar entrega / pago</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto a entregar *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="pl-9 text-xl font-bold" placeholder="0.00" />
              </div>
              <p className="text-[10px] text-muted-foreground">Deuda actual: {selectedDebtor ? formatPrice(selectedDebtor.total_debt) : ''}</p>
            </div>
            <div className="space-y-2">
              <Label>Método de pago</Label>
              <div className="flex gap-2">
                <Button type="button" variant={paymentMethod === 'efectivo' ? 'default' : 'outline'} className="flex-1 h-12 flex flex-col gap-1" onClick={() => setPaymentMethod('efectivo')}>
                  <Banknote className="h-4 w-4" /><span className="text-[10px]">Efectivo</span>
                </Button>
                <Button type="button" variant={paymentMethod === 'transferencia' ? 'default' : 'outline'} className="flex-1 h-12 flex flex-col gap-1" onClick={() => setPaymentMethod('transferencia')}>
                  <ArrowRightLeft className="h-4 w-4" /><span className="text-[10px]">Transfer</span>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas / Comentarios</Label>
              <Input value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder="Ej: Pago seña remera" />
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg" onClick={handleRegisterPayment} disabled={processing || !paymentAmount || parseFloat(paymentAmount) <= 0}>
              {processing ? 'Registrando...' : 'Confirmar Pago'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Debtor Modal */}
      <Dialog open={showNewDebtorForm} onOpenChange={setShowNewDebtorForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Cargar Nuevo Deudor</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre completo *</Label>
              <Input value={newDebtorName} onChange={e => setNewDebtorName(e.target.value)} placeholder="Ej: Pedro Gomez" />
            </div>
            <div className="space-y-2">
              <Label>Teléfono / WhatsApp</Label>
              <Input value={newDebtorPhone} onChange={e => setNewDebtorPhone(e.target.value)} placeholder="Ej: 11 9876 5432" />
            </div>
            <Button className="w-full" onClick={async () => {
              if (!newDebtorName) return;
              setAddingDebtor(true);
              const { data, error } = await supabase.from('debtors').insert({ name: newDebtorName, phone: newDebtorPhone }).select().single();
              if (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el deudor' });
              } else if (data) {
                await fetchDebtors();
                setSelectedDebtor(data);
                setShowNewDebtorForm(false);
                setNewDebtorName('');
                setNewDebtorPhone('');
                toast({ title: 'Deudor cargado correctamente' });
              }
              setAddingDebtor(false);
            }} disabled={addingDebtor || !newDebtorName}>
              {addingDebtor ? 'Cargando...' : 'Cargar Deudor'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!debtorToDelete} onOpenChange={() => setDebtorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              ¿Eliminar deudor?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará a <strong>"{debtorToDelete?.name}"</strong> junto con <strong>todo su historial de pagos</strong>. Esta acción no se puede deshacer.
              {debtorToDelete && hasDebt(debtorToDelete) && (
                <span className="block mt-2 p-2 bg-destructive/10 rounded-md text-destructive text-sm">
                  ⚠️ Este deudor todavía debe {formatPrice(debtorToDelete.total_debt)}. ¿Estás seguro?
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDebtor} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
