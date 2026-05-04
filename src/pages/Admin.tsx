import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { GENDER_LABELS, Product } from '@/types/database';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Plus, Trash2, LogOut, Package, Edit, Layers, Home, Images,
  Palette, Ruler, FolderOpen, ShoppingCart, BarChart3, Megaphone,
  Percent, Eye, EyeOff, User as UserIcon, DollarSign, Bell, BellOff,
  History, Settings as SettingsIcon, ChevronLeft, ChevronRight, Search
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductWizard } from '@/components/admin/ProductWizard';
import { VariantManager } from '@/components/admin/VariantManager';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { ColorManager } from '@/components/admin/ColorManager';
import { SizeManager } from '@/components/admin/SizeManager';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { CashierPanel } from '@/components/admin/CashierPanel';
import { SalesReport } from '@/components/admin/SalesReport';
import { LowStockAlert } from '@/components/admin/LowStockAlert';
import { AnnouncementManager } from '@/components/admin/AnnouncementManager';
import { ProfileManager } from '@/components/admin/ProfileManager';
import { DebtManager } from '@/components/admin/DebtManager';
import { DiscountManager } from '@/components/admin/DiscountManager';
import { PayrollPanel } from '@/components/admin/PayrollPanel';
import { ActivityHistory } from '@/components/admin/ActivityHistory';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useCategories } from '@/hooks/useCategories';
import { ModeToggle } from '@/components/ModeToggle';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sparkles } from 'lucide-react';

type SidebarSection = 'operaciones' | 'productos' | 'catalogo' | 'admin';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  action: () => void;
  ownerOnly?: boolean;
  highlight?: string;
}

export default function Admin() {
  const { user, isAdmin, activeProfile, loading: authLoading, signOut } = useAuth();
  const { products, refetch } = useProducts();
  const { categories, getCategoryLabel } = useCategories();
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [managingVariants, setManagingVariants] = useState<Product | null>(null);
  const [managingGallery, setManagingGallery] = useState<Product | null>(null);
  const [showColorManager, setShowColorManager] = useState(false);
  const [showSizeManager, setShowSizeManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showCashierPanel, setShowCashierPanel] = useState(false);
  const [showSalesReport, setShowSalesReport] = useState(false);
  const [showAnnouncementManager, setShowAnnouncementManager] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showProductWizard, setShowProductWizard] = useState(false);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [showDebtManager, setShowDebtManager] = useState(false);
  const [showDiscountManager, setShowDiscountManager] = useState(false);
  const [showPayroll, setShowPayroll] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showActivityHistory, setShowActivityHistory] = useState(false);
  const [showIAPanel, setShowIAPanel] = useState(false);
  const [processingIA, setProcessingIA] = useState(false);
  const [iaProgress, setIAProgress] = useState({ current: 0, total: 0 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [globalSettings, setGlobalSettings] = useState<{hide_out_of_stock: boolean, low_stock_threshold: number}>({
    hide_out_of_stock: false, low_stock_threshold: 5
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [lowStockAlertEnabled, setLowStockAlertEnabled] = useState(() => {
    const saved = localStorage.getItem('lowStockAlertEnabled');
    return saved !== null ? saved === 'true' : true;
  });

  const fetchSettings = async () => {
    const { data } = await supabase.from('app_settings').select('*').eq('id', 'global').maybeSingle();
    if (data) setGlobalSettings({ hide_out_of_stock: data.hide_out_of_stock, low_stock_threshold: data.low_stock_threshold });
  };

  useEffect(() => { if (isAdmin) fetchSettings(); }, [isAdmin]);

  const saveSettings = async (updates: Partial<typeof globalSettings>) => {
    setSavingSettings(true);
    const { error } = await supabase.from('app_settings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', 'global');
    if (error) { toast({ variant: 'destructive', title: 'Error al guardar ajustes' }); }
    else { setGlobalSettings(prev => ({ ...prev, ...updates })); toast({ title: 'Ajustes actualizados' }); }
    setSavingSettings(false);
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!isAdmin) return <Navigate to="/jefecitos" replace />;

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.code === '23503' ? 'Tiene ventas asociadas. Desactivalo en vez de eliminarlo.' : 'No se pudo eliminar.' });
    } else {
      toast({ title: 'Producto eliminado' });
      await logAction(`Eliminó "${productToDelete.name}"`, 'producto', { product_name: productToDelete.name });
      refetch();
    }
    setDeleting(false);
    setProductToDelete(null);
  };

  const handleToggleActive = async (product: Product) => {
    const s = !product.is_active;
    const { error } = await supabase.from('products').update({ is_active: s }).eq('id', product.id);
    if (!error) {
      toast({ title: s ? 'Producto activado' : 'Producto desactivado' });
      await logAction(`${s ? 'Activó' : 'Desactivó'} "${product.name}"`, 'producto', { product_name: product.name });
      refetch();
    }
  };

  const formatPrice = (p: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(p);
  const isOwner = activeProfile?.role === 'dueño';

  const filteredProducts = products.filter(p =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const navSections: { title: string; section: SidebarSection; items: NavItem[] }[] = [
    {
      title: 'Operaciones', section: 'operaciones', items: [
        { id: 'cajera', label: 'Registrar Venta', icon: ShoppingCart, action: () => setShowCashierPanel(true), highlight: 'bg-accent/15 border-accent/30 text-accent' },
        { id: 'reportes', label: 'Reporte Ventas', icon: BarChart3, action: () => setShowSalesReport(true) },
        { id: 'deudas', label: 'Cuentas Corrientes', icon: DollarSign, action: () => setShowDebtManager(true) },
      ]
    },
    {
      title: 'Catálogo', section: 'catalogo', items: [
        { id: 'colores', label: 'Colores', icon: Palette, action: () => setShowColorManager(true) },
        { id: 'talles', label: 'Talles', icon: Ruler, action: () => setShowSizeManager(true) },
        { id: 'categorias', label: 'Categorías', icon: FolderOpen, action: () => setShowCategoryManager(true) },
        { id: 'descuentos', label: 'Descuentos', icon: Percent, action: () => setShowDiscountManager(true) },
        { id: 'anuncios', label: 'Anuncios', icon: Megaphone, action: () => setShowAnnouncementManager(true) },
      ]
    },
    {
      title: 'Administración', section: 'admin', items: [
        { id: 'ia', label: 'Herramientas IA', icon: Sparkles, action: () => setShowIAPanel(true), highlight: 'bg-accent/10 text-accent border-accent/20' },
        { id: 'nomina', label: 'Nómina', icon: DollarSign, action: () => setShowPayroll(true) },
        { id: 'tienda', label: 'Ajustes Tienda', icon: SettingsIcon, action: () => setShowSettings(true) },
        { id: 'perfiles', label: 'Perfiles', icon: UserIcon, action: () => setShowProfileManager(true), ownerOnly: true },
        { id: 'historial', label: 'Historial', icon: History, action: () => setShowActivityHistory(true), ownerOnly: true },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-3 sticky top-0 z-20 border-b border-primary-foreground/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors lg:hidden">
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            <h1 className="font-serif text-lg">Panel Admin</h1>
            <div className="hidden sm:flex h-5 w-px bg-primary-foreground/20" />
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-primary-foreground/10 p-1 rounded-lg transition-colors outline-none group">
                    <div className="relative h-7 w-7 rounded-full overflow-hidden border border-primary-foreground/20 group-hover:border-primary-foreground/50 transition-colors bg-primary-foreground/10">
                      {activeProfile?.avatar_url ? (
                        <img src={activeProfile.avatar_url} className="h-full w-full object-cover" alt="" />
                      ) : (
                        <UserIcon className="h-4 w-4 m-1.5 text-primary-foreground/70" />
                      )}
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="font-semibold text-primary-foreground">{activeProfile?.name || 'Admin'}</span>
                      <span className="text-[10px] text-primary-foreground/60 uppercase">{activeProfile?.role || 'User'}</span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 mt-1 p-2 border-none bg-background/95 backdrop-blur-xl shadow-2xl">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Mi Cuenta</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem 
                    onClick={() => setShowProfileSettings(true)}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span>Personalizar Perfil</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {isOwner && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase">Dueño</span>}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground text-xs h-8">
                <Home className="h-3.5 w-3.5 mr-1" /> Tienda
              </Button>
            </Link>
            <ModeToggle />
            <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground/70 hover:text-primary-foreground text-xs h-8">
              <LogOut className="h-3.5 w-3.5 mr-1" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={cn(
          "bg-card border-r border-border flex flex-col transition-all duration-300 shrink-0 overflow-y-auto",
          sidebarCollapsed ? "w-0 lg:w-16 overflow-hidden" : "w-64"
        )}>
          <nav className="flex-1 py-4 space-y-6">
            {navSections.map(({ title, items }) => (
              <div key={title}>
                {!sidebarCollapsed && (
                  <h3 className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{title}</h3>
                )}
                <div className="space-y-0.5 px-2">
                  {items.filter(i => !i.ownerOnly || isOwner).map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-muted group",
                          item.highlight || "text-foreground/80 hover:text-foreground",
                          sidebarCollapsed && "justify-center px-0"
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0 group-hover:scale-110 transition-transform" />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar footer */}
          {!sidebarCollapsed && (
            <div className="p-3 border-t border-border">
              <div className="flex items-center justify-between px-2 py-1.5">
                <div className="flex items-center gap-2">
                  {lowStockAlertEnabled ? <Bell className="h-3.5 w-3.5 text-accent" /> : <BellOff className="h-3.5 w-3.5 text-muted-foreground" />}
                  <span className="text-xs text-muted-foreground">Alertas Stock</span>
                </div>
                <Switch
                  checked={lowStockAlertEnabled}
                  onCheckedChange={(c) => { setLowStockAlertEnabled(c); localStorage.setItem('lowStockAlertEnabled', String(c)); }}
                  className="scale-75"
                />
              </div>
            </div>
          )}

          {/* Collapse toggle (desktop) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center py-2 border-t border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Low Stock Alert */}
            {lowStockAlertEnabled && <LowStockAlert />}

            {/* Quick Actions (mobile-friendly CTA) */}
            <div className="lg:hidden">
              <Button size="lg" onClick={() => setShowCashierPanel(true)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <ShoppingCart className="h-5 w-5 mr-2" /> Registrar Venta
              </Button>
            </div>

            {/* Products Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" /> Productos
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">{products.length} productos registrados</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar producto..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Button onClick={() => setShowProductWizard(true)} className="shrink-0 h-9">
                  <Plus className="h-4 w-4 mr-1" /> Nuevo
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map(p => (
                <div key={p.id} className={cn(
                  "bg-card border rounded-xl p-4 space-y-3 transition-all hover:shadow-md hover:border-accent/20",
                  !p.is_active && "opacity-50"
                )}>
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0 relative">
                      {p.image_url ? (
                        <img src={p.image_url} className="w-full h-full object-cover" alt={p.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="h-6 w-6 text-muted-foreground/40" /></div>
                      )}
                      {!p.is_active && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <EyeOff className="h-5 w-5 text-white/80" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{p.name}</h3>
                      <p className="text-base font-bold text-accent mt-0.5">{formatPrice(p.price)}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded-full">{getCategoryLabel(p.category_id)}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded-full">{GENDER_LABELS[p.gender]}</span>
                        {p.is_new && <span className="text-[10px] px-1.5 py-0.5 bg-accent/20 text-accent rounded-full font-medium">Nuevo</span>}
                        {p.discount_percent && p.discount_percent > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-destructive/15 text-destructive rounded-full font-medium">-{p.discount_percent}%</span>
                        )}
                        {!p.is_active && <span className="text-[10px] px-1.5 py-0.5 bg-muted-foreground/20 rounded-full">Oculto</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 pt-2 border-t border-border/50">
                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={() => { setEditingProduct(p); setShowProductForm(true); }}>
                      <Edit className="h-3 w-3 mr-1" /> Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={() => setManagingGallery(p)}>
                      <Layers className="h-3 w-3 mr-1" /> Gestionar
                    </Button>
                    <Button variant="ghost" size="icon" className={cn("h-8 w-8 shrink-0", p.is_active ? "text-muted-foreground" : "text-green-500")} onClick={() => handleToggleActive(p)}>
                      {p.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive/60 hover:text-destructive" onClick={() => setProductToDelete(p)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-card rounded-xl border border-dashed">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground font-medium">{productSearch ? 'Sin resultados' : 'No hay productos'}</p>
                <p className="text-xs text-muted-foreground mt-1">{productSearch ? 'Probá con otro término' : '¡Agregá el primero!'}</p>
                {!productSearch && (
                  <Button className="mt-4" onClick={() => setShowProductWizard(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Agregar Producto
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* === ALL MODALS === */}
      <ProductForm product={editingProduct} open={showProductForm} onClose={() => { setShowProductForm(false); setEditingProduct(null); }} onSaved={refetch} />
      {managingGallery && <GalleryManager productId={managingGallery.id} productName={managingGallery.name} open={!!managingGallery} onClose={() => setManagingGallery(null)} />}
      <ColorManager open={showColorManager} onClose={() => setShowColorManager(false)} />
      <SizeManager open={showSizeManager} onClose={() => setShowSizeManager(false)} />
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-lg w-full max-h-[80vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-serif text-xl">Gestionar Categorías</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCategoryManager(false)}>Cerrar</Button>
            </div>
            <div className="p-4"><CategoryManager /></div>
          </div>
        </div>
      )}
      <CashierPanel open={showCashierPanel} onClose={() => setShowCashierPanel(false)} />
      <SalesReport open={showSalesReport} onClose={() => setShowSalesReport(false)} />
      <AnnouncementManager open={showAnnouncementManager} onClose={() => setShowAnnouncementManager(false)} />
      <ProfileManager open={showProfileManager} onClose={() => setShowProfileManager(false)} />
      <DebtManager open={showDebtManager} onClose={() => setShowDebtManager(false)} />
      <DiscountManager open={showDiscountManager} onClose={() => setShowDiscountManager(false)} />
      <PayrollPanel open={showPayroll} onClose={() => setShowPayroll(false)} />
      <ActivityHistory open={showActivityHistory} onClose={() => setShowActivityHistory(false)} />
      <ProductWizard open={showProductWizard} onClose={() => setShowProductWizard(false)} onSaved={refetch} />
      
      <ProfileSettings 
        open={showProfileSettings} 
        onClose={() => setShowProfileSettings(false)} 
      />

      <Dialog open={showIAPanel} onOpenChange={setShowIAPanel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" /> Herramientas IA</DialogTitle>
            <DialogDescription>Optimizá tu catálogo automáticamente usando Groq Vision.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="p-4 bg-muted/30 rounded-lg border space-y-3">
              <h4 className="font-bold text-sm">Autocompletado de Descripciones</h4>
              <p className="text-xs text-muted-foreground">Analiza las fotos de los productos que no tienen descripción y redacta una profesional junto con un copy para Instagram.</p>
              
              {processingIA ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Procesando productos...</span>
                    <span>{iaProgress.current} / {iaProgress.total}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-300" 
                      style={{ width: `${(iaProgress.current / iaProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={async () => {
                    const toProcess = products.filter(p => !p.description || p.description.length < 10);
                    if (toProcess.length === 0) {
                      toast({ title: '¡Todo al día!', description: 'No hay productos sin descripción para procesar.' });
                      return;
                    }
                    
                    setProcessingIA(true);
                    setIAProgress({ current: 0, total: toProcess.length });
                    
                    let count = 0;
                    for (const p of toProcess) {
                      try {
                        const { error } = await supabase.functions.invoke('generate-product-content-v2', {
                          body: { productId: p.id }
                        });
                        if (error) throw error;
                        count++;
                        setIAProgress(prev => ({ ...prev, current: count }));
                      } catch (err) {
                        console.error(`Error procesando ${p.name}:`, err);
                      }
                    }
                    
                    setProcessingIA(false);
                    toast({ title: 'Proceso terminado', description: `Se actualizaron ${count} productos.` });
                    refetch();
                  }}
                >
                  Generar {products.filter(p => !p.description || p.description.length < 10).length} faltantes
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará "{productToDelete?.name}" junto con sus variantes e imágenes. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><SettingsIcon className="h-5 w-5" /> Ajustes de la Tienda</DialogTitle>
            <DialogDescription>Configurá el comportamiento global del catálogo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label className="text-base">Ocultar productos sin stock</Label>
                <p className="text-sm text-muted-foreground">No aparecerán en el catálogo si no tienen stock.</p>
              </div>
              <Switch checked={globalSettings.hide_out_of_stock} onCheckedChange={(c) => saveSettings({ hide_out_of_stock: c })} disabled={savingSettings} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Umbral de "Stock Bajo"</Label>
              <p className="text-sm text-muted-foreground">Unidades mínimas para mostrar alerta.</p>
              <div className="flex items-center gap-4">
                <Input id="threshold" type="number" value={globalSettings.low_stock_threshold} onChange={(e) => setGlobalSettings(prev => ({ ...prev, low_stock_threshold: parseInt(e.target.value) || 0 }))} className="w-24" />
                <Button size="sm" onClick={() => saveSettings({ low_stock_threshold: globalSettings.low_stock_threshold })} disabled={savingSettings}>Guardar</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
