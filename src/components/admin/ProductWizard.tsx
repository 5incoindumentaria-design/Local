import { useState, useEffect, useRef } from 'react';
import { Product, ProductGender, GENDER_LABELS, Color, Size } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { useColors, useSizes } from '@/hooks/useProducts';
import { CalendarIcon, Percent, ArrowRight, ArrowLeft, Check, ImagePlus, Trash2 } from 'lucide-react';
import { CategoryTreeSelect } from './CategoryTreeSelect';
import { CategorySelector } from './CategorySelector';
import { InlineColorForm } from './InlineColorForm';
import { InlineSizeForm } from './InlineSizeForm';
import { StockByColorManager, VariantStock } from './StockByColorManager';

interface ProductWizardProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

type WizardStep = 'info' | 'variants' | 'photos';

interface ColorImageGroup {
  colorId: string;
  colorName: string;
  colorHex: string;
  images: { file?: File; url?: string; isUploading?: boolean }[];
}

export function ProductWizard({ open, onClose, onSaved }: ProductWizardProps) {
  const { toast } = useToast();
  const { categories, refetch: refetchCategories } = useCategories();
  const { colors, refetch: refetchColors } = useColors();
  const { sizes, refetch: refetchSizes } = useSizes();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step management
  const [step, setStep] = useState<WizardStep>('info');
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  // Step 1: Product info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [costPriceEdited, setCostPriceEdited] = useState(false);
  const [parentCategoryId, setParentCategoryId] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [gender, setGender] = useState<ProductGender>('unisex');
  
  const [discountPercent, setDiscountPercent] = useState('0');
  const [discountEndsAt, setDiscountEndsAt] = useState<Date | undefined>(undefined);

  // Step 2: Variants (colors & sizes)
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [variantStocks, setVariantStocks] = useState<VariantStock[]>([]);

  // Step 3: Photos by color
  const [colorImages, setColorImages] = useState<ColorImageGroup[]>([]);
  const [activeColorForUpload, setActiveColorForUpload] = useState<string | null>(null);
  const [draggedColorId, setDraggedColorId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setStep('info');
      setCreatedProductId(null);
      setName('');
      setDescription('');
      
      // Try to load last used settings from localStorage
      const lastGender = localStorage.getItem('last_product_gender') as ProductGender;
      const lastParentId = localStorage.getItem('last_product_parent_category');
      const lastSubId = localStorage.getItem('last_product_subcategory');

      setGender(lastGender || 'unisex');
      setParentCategoryId(lastParentId || '');
      setSubcategoryId(lastSubId || '');
      
      // Suggest name from the last category if found
      if (lastParentId) {
        // We need to wait for categories to be loaded, but they are already in the hook
        const lastCat = categories.find(c => c.id === (lastSubId || lastParentId));
        if (lastCat) setName(lastCat.name);
      }
      
      setPrice('');
      setCostPrice('');
      setCostPriceEdited(false);
      
      setDiscountPercent('0');
      setDiscountEndsAt(undefined);
      setSelectedColors([]);
      setVariantStocks([]);
      setColorImages([]);
    }
  }, [open]);

  // When colors are selected, update colorImages groups
  useEffect(() => {
    const newColorImages = selectedColors.map(colorId => {
      const existing = colorImages.find(ci => ci.colorId === colorId);
      if (existing) return existing;
      const color = colors.find(c => c.id === colorId);
      return {
        colorId,
        colorName: color?.name || '',
        colorHex: color?.hex_code || '#ccc',
        images: [],
      };
    });
    setColorImages(newColorImages);
  }, [selectedColors, colors]);

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

  const handleStep1Submit = async () => {
    if (!name || !price) {
      toast({ variant: 'destructive', title: 'Completá nombre y precio' });
      return;
    }

    setSaving(true);
    try {
      const finalCategoryId = subcategoryId || parentCategoryId || null;
      const validEnumValues = ['remeras', 'pantalones', 'buzos', 'camperas', 'vestidos', 'faldas', 'accesorios', 'otros'];
      const selectedCategory = categories.find(c => c.id === finalCategoryId);
      const categorySlug = (selectedCategory?.slug && validEnumValues.includes(selectedCategory.slug) ? selectedCategory.slug : 'otros') as any;

      const productData = {
        name,
        description: description || null,
        price: parseFloat(price),
        category: categorySlug,
        category_id: finalCategoryId,
        gender,
        cost_price: costPrice ? parseFloat(costPrice) : null,
        is_new: true, // Will be calculated dynamically based on created_at
        is_active: true,
        discount_percent: parseInt(discountPercent) || 0,
        discount_ends_at: discountEndsAt ? discountEndsAt.toISOString() : null,
      };

      // Save preferences to localStorage for the next time
      localStorage.setItem('last_product_gender', gender);
      localStorage.setItem('last_product_parent_category', parentCategoryId);
      localStorage.setItem('last_product_subcategory', subcategoryId);

      if (createdProductId) {
        // If product was already created in this wizard session, just update it
        const { error } = await supabase.from('products').update(productData).eq('id', createdProductId);
        if (error) throw error;
        setStep('variants');
      } else {
        const { data, error } = await supabase.from('products').insert(productData).select('id').single();
        if (error) throw error;
        setCreatedProductId(data.id);
        toast({ title: 'Producto creado', description: 'Ahora agregá colores y talles' });
        setStep('variants');
      }
    } catch (err: any) {
      console.error('Error creating product:', err);
      toast({ 
        variant: 'destructive', 
        title: 'Error al crear producto', 
        description: err.message || 'No se pudo conectar con la base de datos'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStep2Submit = async () => {
    if (variantStocks.length === 0) {
      toast({ variant: 'destructive', title: 'Configurá al menos una combinación color/talle' });
      return;
    }

    if (!createdProductId) return;

    setSaving(true);
    try {
      // Create variants with configured stock and price
      const variants = variantStocks.map(v => ({
        product_id: createdProductId,
        color_id: v.colorId,
        size_id: v.sizeId,
        stock: v.stock,
        price: v.price || null,
      }));

      // Delete existing variants in case the user went back and forth in the wizard
      await supabase.from('product_variants').delete().eq('product_id', createdProductId);

      const { error } = await supabase.from('product_variants').insert(variants);
      if (error) throw error;

      toast({ title: 'Variantes creadas', description: 'Ahora subí fotos para cada color' });
      setStep('photos');
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error al crear variantes' });
    } finally {
      setSaving(false);
    }
  };

  const addImagesToGroup = (files: File[], colorId: string | null) => {
    if (!colorId) return;

    const newImages = files.filter(f => f.type.startsWith('image/')).map(file => ({ file }));
    
    setColorImages(prev => prev.map(group => {
      if (group.colorId === colorId) {
        return { ...group, images: [...group.images, ...newImages] };
      }
      return group;
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, colorId: string | null) => {
    const files = Array.from(e.target.files || []);
    addImagesToGroup(files, colorId);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (colorId: string | null, index: number) => {
    if (!colorId) return;

    setColorImages(prev => prev.map(group => {
      if (group.colorId === colorId) {
        const newImages = [...group.images];
        newImages.splice(index, 1);
        return { ...group, images: newImages };
      }
      return group;
    }));
  };

  const handlePaste = (e: React.ClipboardEvent, colorId: string) => {
    const items = Array.from(e.clipboardData.items);
    const files: File[] = [];
    
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      addImagesToGroup(files, colorId);
      toast({ title: "Imagen pegada correctamente" });
    }
  };

  const handleDrop = (e: React.DragEvent, colorId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedColorId(null);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) {
      addImagesToGroup(files, colorId);
      toast({ title: "Imágenes cargadas correctamente" });
    }
  };

  const handleFinish = async () => {
    if (!createdProductId) return;

    setSaving(true);
    try {
      let firstUploadedUrl: string | null = null;

      // Upload color-specific images
      for (const colorGroup of colorImages) {
        for (let i = 0; i < colorGroup.images.length; i++) {
          const img = colorGroup.images[i];
          if (img.file) {
            const fileExt = img.file.name.split('.').pop() || 'jpg';
            const fileName = `${createdProductId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('product-images')
              .upload(fileName, img.file);

            if (uploadError) {
              console.error('Upload error for file:', fileName, uploadError);
              continue;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName);

            // Track the first uploaded image as the main product image
            if (!firstUploadedUrl) {
              firstUploadedUrl = publicUrl;
            }

            await supabase.from('product_images').insert({
              product_id: createdProductId,
              image_url: publicUrl,
              display_order: i,
              color_id: colorGroup.colorId,
              is_primary: i === 0,
            });
          }
        }
      }

      // Update product with main image (first uploaded image)
      if (firstUploadedUrl) {
        await supabase.from('products').update({ image_url: firstUploadedUrl }).eq('id', createdProductId);
      }

      toast({ title: '¡Producto completo!', description: 'Se creó con todos sus colores y fotos' });
      onSaved();
      onClose();
    } catch (err) {
      console.error('Error finishing product:', err);
      toast({ variant: 'destructive', title: 'Error al subir imágenes' });
    } finally {
      setSaving(false);
    }
  };

  const handleSkipPhotos = () => {
    toast({ title: 'Producto creado', description: 'Podés agregar fotos después desde el panel' });
    onSaved();
    onClose();
  };

  const toggleColor = (colorId: string) => {
    setSelectedColors(prev => {
      if (prev.includes(colorId)) {
        // Remove color and its variants
        setVariantStocks(stocks => stocks.filter(v => v.colorId !== colorId));
        return prev.filter(c => c !== colorId);
      } else {
        return [...prev, colorId];
      }
    });
  };
  

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {step === 'info' && 'Nuevo Producto - Información'}
            {step === 'variants' && 'Nuevo Producto - Colores y Talles'}
            {step === 'photos' && 'Nuevo Producto - Fotos por Color'}
          </DialogTitle>
          <DialogDescription>
            {step === 'info' && 'Paso 1 de 3: Ingresá los datos básicos del producto'}
            {step === 'variants' && 'Paso 2 de 3: Seleccioná los colores y talles disponibles'}
            {step === 'photos' && 'Paso 3 de 3: Subí fotos para cada color'}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 py-4">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            step === 'info' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {step !== 'info' ? <Check className="h-4 w-4" /> : '1'}
          </div>
          <div className="w-8 h-0.5 bg-muted" />
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            step === 'variants' ? "bg-primary text-primary-foreground" : 
            step === 'photos' ? "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground"
          )}>
            {step === 'photos' ? <Check className="h-4 w-4" /> : '2'}
          </div>
          <div className="w-8 h-0.5 bg-muted" />
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            step === 'photos' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            3
          </div>
        </div>

        {/* Step 1: Info */}
        {step === 'info' && (
          <div className="space-y-4">
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
                // Sugerir nombre si está vacío o si era igual a la categoría anterior
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
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Remera Básica" />
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Precio de Venta *</Label>
                <Input type="number" step="0.01" min="0" value={price} onChange={handlePriceChange} placeholder="15000" />
              </div>
              <div>
                <Label>Precio de Costo (opcional)</Label>
                <Input type="number" step="0.01" min="0" value={costPrice} onChange={handleCostPriceChange} placeholder="7500" />
              </div>
            </div>


            {/* Discount */}
            <div className="border rounded-sm p-4 space-y-3 bg-accent/5">
              <div className="flex items-center gap-2 text-accent">
                <Percent className="h-4 w-4" />
                <Label className="font-medium">Descuento (opcional)</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Porcentaje (%)</Label>
                  <Input type="number" min="0" max="100" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Válido hasta</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !discountEndsAt && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {discountEndsAt ? format(discountEndsAt, "dd/MM/yy", { locale: es }) : "Sin fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={discountEndsAt} onSelect={setDiscountEndsAt} locale={es} disabled={(date) => date < new Date()} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleStep1Submit} disabled={saving}>
                {saving ? 'Guardando...' : 'Siguiente'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Variants */}
        {step === 'variants' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="text-base font-medium">Colores disponibles *</Label>
                  <p className="text-sm text-muted-foreground">Seleccioná los colores del producto</p>
                </div>
                <InlineColorForm onColorAdded={refetchColors} />
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => toggleColor(color.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all",
                      selectedColors.includes(color.id) 
                        ? "border-primary bg-primary/10 ring-2 ring-primary" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.hex_code }} />
                    <span className="text-sm">{color.name}</span>
                    {selectedColors.includes(color.id) && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="text-base font-medium">Talles y Stock por Color</Label>
                  <p className="text-sm text-muted-foreground">Seleccioná los talles disponibles para cada color y configurá el stock</p>
                </div>
                <InlineSizeForm onSizeAdded={refetchSizes} />
              </div>
              <StockByColorManager
                colors={colors}
                sizes={sizes}
                selectedColorIds={selectedColors}
                variantStocks={variantStocks}
                onVariantStocksChange={setVariantStocks}
                onSizesUpdated={refetchSizes}
              />
            </div>

            {variantStocks.length > 0 && (
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-sm">
                  <strong>Se crearán {variantStocks.length} variantes</strong>
                  <span className="text-muted-foreground"> con stock total de {variantStocks.reduce((sum, v) => sum + v.stock, 0)} unidades</span>
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('info')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
              </Button>
              <Button onClick={handleStep2Submit} disabled={saving || variantStocks.length === 0}>
                {saving ? 'Guardando...' : 'Siguiente'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 'photos' && (
          <div className="space-y-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, activeColorForUpload)}
            />

            <div className="bg-accent/10 p-4 rounded-md border border-accent/20 mb-4">
              <p className="text-sm text-accent font-medium flex items-center gap-2">
                <ImagePlus className="h-4 w-4" />
                Tip: Podés arrastrar fotos o pegarlas (Ctrl+V) directamente sobre el color.
              </p>
            </div>

            {/* Color-specific images */}
            {colorImages.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-md">
                <p className="text-muted-foreground">No seleccionaste colores en el paso anterior.</p>
                <Button variant="link" onClick={() => setStep('variants')}>Volver a variantes</Button>
              </div>
            )}

            {colorImages.map(colorGroup => (
              <div 
                key={colorGroup.colorId} 
                className={cn(
                  "space-y-3 pt-4 border-2 transition-all p-2 rounded-md",
                  draggedColorId === colorGroup.colorId 
                    ? "border-dashed border-accent bg-accent/5 scale-[1.01] shadow-sm" 
                    : "border-transparent border-t-border first:border-t-transparent"
                )}
                onPaste={(e) => handlePaste(e, colorGroup.colorId)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = 'copy';
                  if (draggedColorId !== colorGroup.colorId) {
                    setDraggedColorId(colorGroup.colorId);
                  }
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Check if the related target (where the mouse is going) is outside this div
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDraggedColorId(null);
                  }
                }}
                onDrop={(e) => handleDrop(e, colorGroup.colorId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full border-2 shadow-sm" style={{ backgroundColor: colorGroup.colorHex }} />
                    <Label className="font-medium">{colorGroup.colorName}</Label>
                    <span className="text-xs text-muted-foreground">({colorGroup.images.length} fotos)</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveColorForUpload(colorGroup.colorId);
                      fileInputRef.current?.click();
                    }}
                  >
                    <ImagePlus className="h-4 w-4 mr-1" /> Agregar
                  </Button>
                </div>
                
                <div className={cn(
                  "grid grid-cols-4 sm:grid-cols-6 gap-3 p-4 rounded-md border-2 border-dashed transition-colors",
                  colorGroup.images.length === 0 ? "bg-muted/30 border-muted" : "bg-accent/5 border-accent/20"
                )}>
                  {colorGroup.images.length === 0 ? (
                    <div className="col-span-full py-4 text-center">
                      <p className="text-xs text-muted-foreground italic">Arrastrá, pegá o hacé clic en agregar fotos para este color</p>
                    </div>
                  ) : (
                    colorGroup.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-md overflow-hidden group border bg-white">
                        <img 
                          src={img.file ? URL.createObjectURL(img.file) : img.url} 
                          className="w-full h-full object-cover" 
                        />
                        <button
                          onClick={() => removeImage(colorGroup.colorId, idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('variants')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
              </Button>
              <Button onClick={handleFinish} disabled={saving}>
                {saving ? 'Subiendo...' : 'Finalizar'} <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
