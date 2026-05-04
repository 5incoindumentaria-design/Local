import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  gender: 'masculino' | 'femenino' | 'unisex';
  display_order: number;
  parent_id: string | null;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
  depth: number;
  fullPath: string; // e.g. "Ropa > Deportivo > Pantalones"
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');

    if (!error && data) {
      setCategories(data as Category[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Build tree structure from flat categories
  const buildTree = useCallback((parentId: string | null = null, depth = 0, pathPrefix = ''): CategoryNode[] => {
    return categories
      .filter(c => c.parent_id === parentId)
      .map(c => {
        const fullPath = pathPrefix ? `${pathPrefix} > ${c.name}` : c.name;
        return {
          ...c,
          depth,
          fullPath,
          children: buildTree(c.id, depth + 1, fullPath),
        };
      });
  }, [categories]);

  // Flatten tree into ordered list for dropdowns (with depth info)
  const getFlattenedTree = useCallback((): CategoryNode[] => {
    const tree = buildTree();
    const result: CategoryNode[] = [];
    
    const flatten = (nodes: CategoryNode[]) => {
      for (const node of nodes) {
        result.push(node);
        flatten(node.children);
      }
    };
    
    flatten(tree);
    return result;
  }, [buildTree]);

  // Get root categories (no parent)
  const getRootCategories = useCallback(() => {
    return categories.filter(c => !c.parent_id);
  }, [categories]);

  // Get direct children of a category
  const getChildCategories = useCallback((parentId: string) => {
    return categories.filter(c => c.parent_id === parentId);
  }, [categories]);

  // Get all descendant IDs (for filtering products)
  const getDescendantIds = useCallback((categoryId: string): string[] => {
    const descendants: string[] = [categoryId];
    const children = categories.filter(c => c.parent_id === categoryId);
    
    for (const child of children) {
      descendants.push(...getDescendantIds(child.id));
    }
    
    return descendants;
  }, [categories]);

  // Get breadcrumb path for a category
  const getBreadcrumb = useCallback((categoryId: string): Category[] => {
    const path: Category[] = [];
    let current = categories.find(c => c.id === categoryId);
    
    while (current) {
      path.unshift(current);
      current = current.parent_id ? categories.find(c => c.id === current!.parent_id) : undefined;
    }
    
    return path;
  }, [categories]);

  // Helper to get category label by id
  const getCategoryLabel = (categoryId: string | null) => {
    if (!categoryId) return 'Sin categoría';
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || 'Sin categoría';
  };

  // Helper to get categories for a specific gender (includes unisex)
  const getCategoriesForGender = (gender: 'masculino' | 'femenino') => {
    return categories.filter(c => c.gender === gender || c.gender === 'unisex');
  };

  return { 
    categories, 
    loading, 
    refetch: fetchCategories,
    getCategoryLabel,
    getCategoriesForGender,
    buildTree,
    getFlattenedTree,
    getRootCategories,
    getChildCategories,
    getDescendantIds,
    getBreadcrumb,
  };
}
