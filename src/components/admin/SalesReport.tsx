import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  BarChart3, 
  DollarSign, 
  CreditCard, 
  Banknote, 
  ArrowRightLeft,
  Package,
  FolderOpen,
  Calendar as CalendarIcon,
  Download,
  FileSpreadsheet,
  FileText,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SalesReportProps {
  open: boolean;
  onClose: () => void;
}

type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'all';
type DateFilter = 'today' | 'week' | 'month' | 'all' | 'custom';

interface SaleData {
  id: string;
  payment_method: 'efectivo' | 'tarjeta' | 'transferencia';
  total: number;
  created_at: string;
}

interface SaleItemData {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  subtotal: number;
}

interface ProductSales {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

interface CategorySales {
  category_id: string;
  category_name: string;
  total_quantity: number;
  total_revenue: number;
  total_profit: number;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  all: 'Todos',
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia'
};

const PAYMENT_METHOD_ICONS: Record<PaymentMethod, React.ReactNode> = {
  all: <BarChart3 className="h-4 w-4" />,
  efectivo: <Banknote className="h-4 w-4" />,
  tarjeta: <CreditCard className="h-4 w-4" />,
  transferencia: <ArrowRightLeft className="h-4 w-4" />
};

const DATE_FILTER_LABELS: Record<DateFilter, string> = {
  today: 'Hoy',
  week: 'Esta semana',
  month: 'Este mes',
  all: 'Todo',
  custom: 'Personalizado'
};

export function SalesReport({ open, onClose }: SalesReportProps) {
  const { categories, getCategoryLabel } = useCategories();
  const { activeProfile } = useAuth();
  const isOwner = activeProfile?.role === 'dueño';
  const { toast } = useToast();
  const [sales, setSales] = useState<SaleData[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItemData[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; category_id: string | null; cost_price: number | null }[]>([]);
  const [variants, setVariants] = useState<{ id: string; product_id: string; stock: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>(undefined);
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>(undefined);
  const [cancelingSaleId, setCancelingSaleId] = useState<string | null>(null);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    
    const [salesRes, itemsRes, productsRes, variantsRes] = await Promise.all([
      supabase.from('sales').select('*').order('created_at', { ascending: false }),
      supabase.from('sale_items').select('*'),
      supabase.from('products').select('id, name, category_id, cost_price'),
      supabase.from('product_variants').select('id, product_id, stock')
    ]);
    
    setSales((salesRes.data || []) as SaleData[]);
    setSaleItems((itemsRes.data || []) as SaleItemData[]);
    setProducts(productsRes.data || []);
    setVariants((variantsRes as any).data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!open) return;
    fetchData();
  }, [open]);

  // Cancel/delete a sale and restore stock
  const handleCancelSale = async (saleId: string) => {
    setCancelingSaleId(saleId);
    
    try {
      // Get the items from this sale to restore stock
      const saleItemsToRestore = saleItems.filter(item => item.sale_id === saleId);
      
      // Restore stock for each variant
      for (const item of saleItemsToRestore) {
        const variantId = (item as any).variant_id;
        if (variantId) {
          // Get current stock
          const { data: variant } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('id', variantId)
            .maybeSingle();
          
          if (variant) {
            // Restore stock
            await supabase
              .from('product_variants')
              .update({ stock: variant.stock + item.quantity })
              .eq('id', variantId);
          }
        }
      }

      // Delete sale items first (foreign key constraint)
      await supabase.from('sale_items').delete().eq('sale_id', saleId);
      
      // Delete the sale
      const { error } = await supabase.from('sales').delete().eq('id', saleId);
      
      if (error) throw error;
      
      toast({ title: 'Venta anulada', description: 'El stock ha sido restaurado' });
      fetchData();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo anular la venta' });
    } finally {
      setCancelingSaleId(null);
    }
  };

  // Get date range based on filter
  const getDateRange = useMemo(() => {
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        return { from: startOfDay(now), to: endOfDay(now) };
      case 'week':
        return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'month':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'custom':
        return { 
          from: customDateFrom ? startOfDay(customDateFrom) : null, 
          to: customDateTo ? endOfDay(customDateTo) : null 
        };
      default:
        return { from: null, to: null };
    }
  }, [dateFilter, customDateFrom, customDateTo]);

  // Filtered sales by payment method and date
  const filteredSales = useMemo(() => {
    let filtered = sales;
    
    // Filter by payment method
    if (selectedPaymentMethod !== 'all') {
      filtered = filtered.filter(s => s.payment_method === selectedPaymentMethod);
    }
    
    // Filter by date
    const { from, to } = getDateRange;
    if (from) {
      filtered = filtered.filter(s => new Date(s.created_at) >= from);
    }
    if (to) {
      filtered = filtered.filter(s => new Date(s.created_at) <= to);
    }
    
    return filtered;
  }, [sales, selectedPaymentMethod, getDateRange]);

  // Total revenue
  const totalRevenue = useMemo(() => {
    return filteredSales.reduce((sum, sale) => sum + Number(sale.total), 0);
  }, [filteredSales]);

  // Investment (based on current stock and cost price)
  const totalInvestment = useMemo(() => {
    return variants.reduce((sum, variant) => {
      const product = products.find(p => p.id === variant.product_id);
      if (product?.cost_price) {
        return sum + (variant.stock * product.cost_price);
      }
      return sum;
    }, 0);
  }, [variants, products]);

  // Profit (based on filtered sales)
  const totalProfit = useMemo(() => {
    const saleIds = new Set(filteredSales.map(s => s.id));
    const relevantItems = saleItems.filter(item => saleIds.has(item.sale_id));
    
    return relevantItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id);
      const cost = product?.cost_price || 0;
      return sum + (Number(item.subtotal) - (item.quantity * cost));
    }, 0);
  }, [filteredSales, saleItems, products]);

  // Revenue by payment method
  const revenueByMethod = useMemo(() => {
    const methods: ('efectivo' | 'tarjeta' | 'transferencia')[] = ['efectivo', 'tarjeta', 'transferencia'];
    return methods.map(method => ({
      method,
      total: filteredSales.filter(s => s.payment_method === method).reduce((sum, s) => sum + Number(s.total), 0),
      count: filteredSales.filter(s => s.payment_method === method).length
    }));
  }, [filteredSales]);

  // Top products
  const topProducts = useMemo(() => {
    const saleIds = new Set(filteredSales.map(s => s.id));
    const relevantItems = saleItems.filter(item => saleIds.has(item.sale_id));

    const productMap: Record<string, ProductSales> = {};
    
    for (const item of relevantItems) {
      if (!productMap[item.product_id]) {
        productMap[item.product_id] = {
          product_id: item.product_id,
          product_name: item.product_name,
          total_quantity: 0,
          total_revenue: 0
        };
      }
      productMap[item.product_id].total_quantity += item.quantity;
      productMap[item.product_id].total_revenue += Number(item.subtotal);
    }

    return Object.values(productMap)
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, 10);
  }, [filteredSales, saleItems]);

  // Top categories
  const topCategories = useMemo(() => {
    const saleIds = new Set(filteredSales.map(s => s.id));
    const relevantItems = saleItems.filter(item => saleIds.has(item.sale_id));

    const categoryMap: Record<string, CategorySales> = {};
    
    for (const item of relevantItems) {
      const product = products.find(p => p.id === item.product_id);
      const categoryId = product?.category_id || 'sin-categoria';
      const categoryName = categoryId === 'sin-categoria' 
        ? 'Sin categoría' 
        : getCategoryLabel(categoryId);
      
      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = {
          category_id: categoryId,
          category_name: categoryName,
          total_quantity: 0,
          total_revenue: 0,
          total_profit: 0
        };
      }
      categoryMap[categoryId].total_quantity += item.quantity;
      categoryMap[categoryId].total_revenue += Number(item.subtotal);
      
      const costProduct = products.find(p => p.id === item.product_id);
      const cost = costProduct?.cost_price || 0;
      categoryMap[categoryId].total_profit += (Number(item.subtotal) - (item.quantity * cost));
    }

    return Object.values(categoryMap)
      .sort((a, b) => b.total_quantity - a.total_quantity);
  }, [filteredSales, saleItems, products, getCategoryLabel]);

  const formatPrice = (p: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(p);

  // Export to Excel
  const exportToExcel = () => {
    const saleIds = new Set(filteredSales.map(s => s.id));
    const relevantItems = saleItems.filter(item => saleIds.has(item.sale_id));

    // Sales summary sheet
    const summaryData = [
      ['Reporte de Ventas'],
      ['Período', dateFilter === 'custom' 
        ? `${customDateFrom ? format(customDateFrom, 'dd/MM/yyyy') : ''} - ${customDateTo ? format(customDateTo, 'dd/MM/yyyy') : ''}`
        : DATE_FILTER_LABELS[dateFilter]
      ],
      ['Método de pago', PAYMENT_METHOD_LABELS[selectedPaymentMethod]],
      [''],
      ['Resumen'],
      ['Total ventas', filteredSales.length],
      ['Total recaudado', formatPrice(totalRevenue)],
      [''],
      ['Por método de pago'],
      ...revenueByMethod.map(r => [PAYMENT_METHOD_LABELS[r.method], r.count, formatPrice(r.total)])
    ];

    // Products sheet
    const productsData = [
      ['Producto', 'Cantidad', 'Total'],
      ...topProducts.map(p => [p.product_name, p.total_quantity, formatPrice(p.total_revenue)])
    ];

    // Categories sheet
    const categoriesData = [
      ['Categoría', 'Cantidad', 'Total', 'Ganancia'],
      ...topCategories.map(c => [c.category_name, c.total_quantity, formatPrice(c.total_revenue), formatPrice(c.total_profit)])
    ];

    // Sales detail sheet
    const salesDetailData = [
      ['Fecha', 'Producto', 'Cantidad', 'Subtotal', 'Método de Pago'],
      ...filteredSales.flatMap(sale => {
        const items = relevantItems.filter(item => item.sale_id === sale.id);
        return items.map(item => [
          format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm'),
          item.product_name,
          item.quantity,
          formatPrice(Number(item.subtotal)),
          PAYMENT_METHOD_LABELS[sale.payment_method]
        ]);
      })
    ];

    const wb = XLSX.utils.book_new();
    
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');
    
    const ws2 = XLSX.utils.aoa_to_sheet(productsData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Productos');
    
    const ws3 = XLSX.utils.aoa_to_sheet(categoriesData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Categorías');
    
    const ws4 = XLSX.utils.aoa_to_sheet(salesDetailData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Detalle');

    XLSX.writeFile(wb, `reporte-ventas-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(18);
    doc.text('Reporte de Ventas', pageWidth / 2, 20, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(10);
    const periodText = dateFilter === 'custom' 
      ? `${customDateFrom ? format(customDateFrom, 'dd/MM/yyyy') : ''} - ${customDateTo ? format(customDateTo, 'dd/MM/yyyy') : ''}`
      : DATE_FILTER_LABELS[dateFilter];
    doc.text(`Período: ${periodText} | Método: ${PAYMENT_METHOD_LABELS[selectedPaymentMethod]}`, pageWidth / 2, 28, { align: 'center' });
    
    // Summary
    doc.setFontSize(12);
    doc.text('Resumen', 14, 40);
    
    autoTable(doc, {
      startY: 45,
      head: [['Concepto', 'Valor']],
      body: [
        ['Total de ventas', String(filteredSales.length)],
        ['Total recaudado', formatPrice(totalRevenue)],
        ...revenueByMethod.map(r => [`${PAYMENT_METHOD_LABELS[r.method]} (${r.count})`, formatPrice(r.total)])
      ],
      theme: 'striped',
      headStyles: { fillColor: [60, 60, 60] }
    });

    // Top products
    const finalY1 = (doc as any).lastAutoTable.finalY || 45;
    doc.text('Productos más vendidos', 14, finalY1 + 15);
    
    autoTable(doc, {
      startY: finalY1 + 20,
      head: [['#', 'Producto', 'Cantidad', 'Total']],
      body: topProducts.map((p, i) => [
        String(i + 1),
        p.product_name,
        String(p.total_quantity),
        formatPrice(p.total_revenue)
      ]),
      theme: 'striped',
      headStyles: { fillColor: [60, 60, 60] }
    });

    // Top categories
    const finalY2 = (doc as any).lastAutoTable.finalY || 45;
    doc.text('Categorías más vendidas', 14, finalY2 + 15);
    
    autoTable(doc, {
      startY: finalY2 + 20,
      head: [['#', 'Categoría', 'Cantidad', 'Total', 'Ganancia']],
      body: topCategories.map((c, i) => [
        String(i + 1),
        c.category_name,
        String(c.total_quantity),
        formatPrice(c.total_revenue),
        formatPrice(c.total_profit)
      ]),
      theme: 'striped',
      headStyles: { fillColor: [60, 60, 60] }
    });

    doc.save(`reporte-ventas-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Reporte de Ventas
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Cargando datos...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <BarChart3 className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg">No hay ventas registradas</p>
              <p className="text-sm">Las ventas aparecerán aquí después de registrarlas</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Date Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground mr-2">Período:</span>
                {(['today', 'week', 'month', 'all'] as DateFilter[]).map(filter => (
                  <Button
                    key={filter}
                    variant={dateFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setDateFilter(filter);
                      setCustomDateFrom(undefined);
                      setCustomDateTo(undefined);
                    }}
                  >
                    {DATE_FILTER_LABELS[filter]}
                  </Button>
                ))}
                
                {/* Custom date range */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={dateFilter === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {dateFilter === 'custom' && customDateFrom && customDateTo
                        ? `${format(customDateFrom, 'dd/MM')} - ${format(customDateTo, 'dd/MM')}`
                        : 'Personalizado'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Desde</p>
                          <Calendar
                            mode="single"
                            selected={customDateFrom}
                            onSelect={(date) => {
                              setCustomDateFrom(date);
                              setDateFilter('custom');
                            }}
                            locale={es}
                            className={cn("p-3 pointer-events-auto border rounded-md")}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Hasta</p>
                          <Calendar
                            mode="single"
                            selected={customDateTo}
                            onSelect={(date) => {
                              setCustomDateTo(date);
                              setDateFilter('custom');
                            }}
                            locale={es}
                            disabled={(date) => customDateFrom ? date < customDateFrom : false}
                            className={cn("p-3 pointer-events-auto border rounded-md")}
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Payment Method Filter */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground mr-2">Método:</span>
                {(['all', 'efectivo', 'tarjeta', 'transferencia'] as PaymentMethod[]).map(method => (
                  <Button
                    key={method}
                    variant={selectedPaymentMethod === method ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPaymentMethod(method)}
                    className="flex items-center gap-2"
                  >
                    {PAYMENT_METHOD_ICONS[method]}
                    {PAYMENT_METHOD_LABELS[method]}
                  </Button>
                ))}
              </div>

              {/* Export Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={exportToExcel}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
                <Button variant="outline" size="sm" onClick={exportToPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>

              {/* Revenue Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="md:col-span-1 border-accent/20 bg-accent/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-accent flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Ventas Totales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-accent">{formatPrice(totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground">{filteredSales.length} ventas</p>
                  </CardContent>
                </Card>

                {isOwner && (
                  <>
                    <Card className="md:col-span-1 border-green-500/20 bg-green-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Ganancia Bruta
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-green-600">{formatPrice(totalProfit)}</p>
                        <p className="text-xs text-muted-foreground">Rentabilidad: {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%</p>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-1 border-blue-500/20 bg-blue-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Inversión en Stock
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-blue-600">{formatPrice(totalInvestment)}</p>
                        <p className="text-xs text-muted-foreground">Valor de costo del inventario</p>
                      </CardContent>
                    </Card>
                  </>
                )}

                <Card className="md:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Ticket Promedio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatPrice(filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0)}</p>
                    <p className="text-xs text-muted-foreground">Por cada venta</p>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue by method breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {revenueByMethod.map(({ method, total, count }) => (
                  <Card key={method} className={selectedPaymentMethod === method ? 'ring-2 ring-primary' : ''}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        {PAYMENT_METHOD_ICONS[method]}
                        {PAYMENT_METHOD_LABELS[method]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-bold">{formatPrice(total)}</p>
                      <p className="text-xs text-muted-foreground">{count} ventas</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Productos más vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topProducts.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No hay datos disponibles para el período seleccionado</p>
                  ) : (
                    <div className="space-y-3">
                      {topProducts.map((product, index) => (
                        <div 
                          key={product.product_id} 
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500 text-white' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              index === 2 ? 'bg-amber-600 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </span>
                            <span className="font-medium">{product.product_name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{product.total_quantity} unidades</p>
                            <p className="text-xs text-muted-foreground">{formatPrice(product.total_revenue)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Categorías más vendidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topCategories.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No hay datos disponibles para el período seleccionado</p>
                  ) : (
                    <div className="space-y-3">
                      {topCategories.map((category, index) => (
                        <div 
                          key={category.category_id} 
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500 text-white' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              index === 2 ? 'bg-amber-600 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </span>
                            <span className="font-medium">{category.category_name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{category.total_quantity} unidades</p>
                            <p className="text-xs text-muted-foreground">{formatPrice(category.total_revenue)}</p>
                            {isOwner && (
                              <p className="text-[10px] text-green-600 font-medium">Ganancia: {formatPrice(category.total_profit)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Sales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Últimas ventas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredSales.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No hay ventas para el período seleccionado</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredSales.slice(0, 10).map(sale => (
                        <div 
                          key={sale.id}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            {PAYMENT_METHOD_ICONS[sale.payment_method]}
                            <div>
                              <p className="font-medium">{formatPrice(Number(sale.total))}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(sale.created_at).toLocaleString('es-AR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {PAYMENT_METHOD_LABELS[sale.payment_method]}
                            </Badge>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={cancelingSaleId === sale.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                    ¿Anular esta venta?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará la venta de {formatPrice(Number(sale.total))} y restaurará el stock de los productos vendidos. Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleCancelSale(sale.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Sí, anular venta
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <Button variant="outline" onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
