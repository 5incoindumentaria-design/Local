 import { useState } from 'react';
 import { useCategories, CategoryNode } from '@/hooks/useCategories';
 import { cn } from '@/lib/utils';
 import { ChevronRight, ChevronDown, FolderOpen, Folder } from 'lucide-react';
 import { ScrollArea } from '@/components/ui/scroll-area';
 
 interface CategoryTreeSelectProps {
   value: string;
   onSelect: (categoryId: string) => void;
 }
 
 export function CategoryTreeSelect({ value, onSelect }: CategoryTreeSelectProps) {
   const { buildTree } = useCategories();
   const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
 
   const tree = buildTree();
 
   const toggleExpand = (id: string) => {
     setExpandedIds(prev => {
       const next = new Set(prev);
       if (next.has(id)) {
         next.delete(id);
       } else {
         next.add(id);
       }
       return next;
     });
   };
 
   const renderNode = (node: CategoryNode): JSX.Element => {
     const hasChildren = node.children.length > 0;
     const isExpanded = expandedIds.has(node.id);
     const isSelected = value === node.id;
 
     return (
       <div key={node.id}>
         <div
           className={cn(
             'flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer transition-colors',
             isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
           )}
           style={{ paddingLeft: `${node.depth * 16 + 8}px` }}
         >
           {hasChildren ? (
             <button
               type="button"
               onClick={(e) => {
                 e.stopPropagation();
                 toggleExpand(node.id);
               }}
               className="p-0.5"
             >
               {isExpanded ? (
                 <ChevronDown className="h-4 w-4" />
               ) : (
                 <ChevronRight className="h-4 w-4" />
               )}
             </button>
           ) : (
             <span className="w-5" />
           )}
           {hasChildren ? (
             isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />
           ) : (
             <span className="w-4" />
           )}
           <span
             className="flex-1 text-sm truncate"
             onClick={() => onSelect(node.id)}
           >
             {node.name}
           </span>
         </div>
         {hasChildren && isExpanded && (
           <div>
             {node.children.map(child => renderNode(child))}
           </div>
         )}
       </div>
     );
   };
 
   return (
     <ScrollArea className="h-48 border rounded-sm bg-background">
       <div className="p-1">
         {tree.length === 0 ? (
           <p className="text-sm text-muted-foreground p-2 text-center">No hay categorías</p>
         ) : (
           tree.map(node => renderNode(node))
         )}
       </div>
     </ScrollArea>
   );
 }