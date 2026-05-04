import { useState, useEffect } from 'react';
import { Product, ProductGender, GENDER_LABELS } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from './ImageUpload';
import { CategorySelector } from './CategorySelector';
import { useCategories } from '@/hooks/useCategories';
import { CalendarIcon, Percent, Sparkles, Loader2 } from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductForm({ product, open, onClose, onSaved }: ProductFormProps) {
  const isEditing = !!product;
  const { toast } = useToast();
  const { categories, refetch: refetchCategories } = useCategories();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [gender, setGender] = useState<ProductGender>('unisex');
  const [imageUrl, setImageUrl] = useState('');
  
  const [discountPercent, setDiscountPercent] = useState('0');
  const [discountEndsAt, setDiscountEndsAt] = useState<Date | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [costPriceEdited, setCostPriceEdited] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [instagramCopy, setInstagramCopy] = useState('');

  // Reset form when product changes or modal opens
  useEffect(() => {
    if (open) {
      setName(product?.name || '');
      setDescription(product?.description || '');
      setPrice(product?.price?.toString() || '');
      setCostPrice(product?.cost_price?.toString() || '');
      setCostPriceEdited(!!product?.cost_price);
      if (product?.category_id) {
        const cat = categories.find(c => c.id === product.category_id);
        if (cat?.parent_id) {
          setParentCategoryId(cat.parent_id);
          setSubcategoryId(cat.id);
        } else {
          setParentCategoryId(product.category_id);
          setSubcategoryId('');
        }
        setSubcategoryId('');
      } else {
        // For new products, try to load last used settings
        const lastGender = localStorage.getItem('last_product_gender') as ProductGender;
        const lastParentId = localStorage.getItem('last_product_parent_category');
        const lastSubId = localStorage.getItem('last_product_subcategory');

        setGender(lastGender || 'unisex');
        setParentCategoryId(lastParentId || '');
        setSubcategoryId(lastSubId || '');

        // Suggest name from the last category if found
        if (lastParentId) {
          const lastCat = categories.find(c => c.id === (lastSubId || lastParentId));
          if (lastCat) setName(lastCat.name);
        }
      }

      setGender(product?.gender || 'unisex');
      setImageUrl(product?.image_url || '');
      
      setDiscountPercent(product?.discount_percent?.toString() || '0');
      setDiscountEndsAt(product?.discount_ends_at ? new Date(product.discount_ends_at) : undefined);
      setInstagramCopy(product?.instagram_copy || '');
    }
  }, [product, open, categories]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = e.target.value;
    setPrice(newPrice);
    
    if (!costPriceEdited && newPrice && !isNaN(Number(newPrice))) {
      setCostPrice((Number(newPrice) / 2).toString());
    } else if (!newPrice && !costPriceEdited) {
      setCostPrice('');
    }
  };

  const handleCostPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCostPrice(e.target.value);
    setCostPriceEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const finalCategoryId = subcategoryId || parentCategoryId || null;
      // Get category slug for the legacy column
      const selectedCategory = categories.find(c => c.id === finalCategoryId);
      const validEnumValues = ['remeras', 'pantalones', 'buzos', 'camperas', 'vestidos', 'faldas', 'accesorios', 'otros'];
      const categorySlug = (selectedCategory?.slug && validEnumValues.includes(selectedCategory.slug) ? selectedCategory.slug : 'otros') as 'remeras' | 'pantalones' | 'buzos' | 'camperas' | 'vestidos' | 'faldas' | 'accesorios' | 'otros';
      
      const productData = {
        name,
        description: description || null,
        price: parseFloat(price),
        category: categorySlug,
        category_id: finalCategoryId,
        gender,
        cost_price: costPrice ? parseFloat(costPrice) : null,
        image_url: imageUrl || null,
        is_new: product?.is_new ?? true, // Calculated dynamically based on created_at
        discount_percent: parseInt(discountPercent) || 0,
        discount_ends_at: discountEndsAt ? discountEndsAt.toISOString() : null,
        instagram_copy: instagramCopy || null,
      };

      // Save preferences to localStorage for the next time
      localStorage.setItem('last_product_gender', gender);
      localStorage.setItem('last_product_parent_category', parentCategoryId);
      localStorage.setItem('last_product_subcategory', subcategoryId);

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        if (error) throw error;
        toast({ title: 'Producto actualizado' });
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
        toast({ title: 'Producto creado' });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error saving product:', err);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: err.message || 'No se pudo guardar el producto' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!isEditing) {
      toast({ variant: 'destructive', title: 'Guardá el producto primero', description: 'Para analizar la imagen, el producto ya debe estar creado.' });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-product-content-v2', {
        body: { productId: product.id }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setDescription(data.description);
      setInstagramCopy(data.instagram_copy);
      toast({ title: 'Contenido generado con IA ✨' });
    } catch (err: any) {
      console.error('Error con IA:', err);
      toast({ variant: 'destructive', title: 'Error al generar con IA', description: err.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Image Upload */}
          <div>
            <Label className="mb-2 block">Imagen del producto</Label>
            <ImageUpload
              currentImageUrl={imageUrl}
              onImageUploaded={(url) => setImageUrl(url)}
              onImageRemoved={() => setImageUrl('')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Género</Label>
              <Select value={gender} onValueChange={v => {
                setGender(v as ProductGender);
                setParentCategoryId('');
                setSubcategoryId('');
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(GENDER_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <CategorySelector
            categories={categories}
            gender={gender}
            parentCategoryId={parentCategoryId}
            subcategoryId={subcategoryId}
            onParentChange={(id, catName) => {
              const oldCat = categories.find(c => c.id === parentCategoryId);
              if (!name || (oldCat && name === oldCat.name)) {
                if (catName) setName(catName);
              }
              setParentCategoryId(id);
              setSubcategoryId('');
            }}
            onSubcategoryChange={setSubcategoryId}
            onCategoriesUpdated={refetchCategories}
          />

          <div>
            <Label>Nombre *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Descripción</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-8 gap-1.5 text-accent hover:text-accent hover:bg-accent/10"
                onClick={handleGenerateAI}
                disabled={generating || !isEditing}
              >
                {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span className="text-xs font-medium">Generar con IA</span>
              </Button>
            </div>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="La IA analizará la foto para redactar esto..." />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              Copy para Instagram
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Opcional</span>
            </Label>
            <Textarea 
              value={instagramCopy} 
              onChange={e => setInstagramCopy(e.target.value)} 
              rows={4} 
              className="text-sm bg-muted/20"
              placeholder="Ideal para copiar y pegar en redes..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Precio de Venta *</Label>
              <Input type="number" step="0.01" min="0" value={price} onChange={handlePriceChange} required placeholder="15000" />
            </div>
            <div>
              <Label>Precio de Costo (opcional)</Label>
              <Input type="number" step="0.01" min="0" value={costPrice} onChange={handleCostPriceChange} placeholder="7500" />
            </div>
          </div>


          {/* Discount Section */}
          <div className="border rounded-sm p-4 space-y-4 bg-accent/5">
            <div className="flex items-center gap-2 text-accent">
              <Percent className="h-4 w-4" />
              <Label className="font-medium">Descuento</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Porcentaje (%)</Label>
                <Input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={discountPercent} 
                  onChange={e => setDiscountPercent(e.target.value)} 
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Válido hasta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !discountEndsAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {discountEndsAt ? format(discountEndsAt, "dd/MM/yyyy", { locale: es }) : "Sin fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={discountEndsAt}
                      onSelect={setDiscountEndsAt}
                      locale={es}
                      disabled={(date) => date < new Date()}
                      className={cn("p-3 pointer-events-auto")}
                    />
                    {discountEndsAt && (
                      <div className="p-2 border-t">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setDiscountEndsAt(undefined)}
                        >
                          Quitar fecha
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {parseInt(discountPercent) > 0 && (
              <p className="text-sm text-muted-foreground">
                Precio con descuento: {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(parseFloat(price || '0') * (1 - parseInt(discountPercent) / 100))}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
