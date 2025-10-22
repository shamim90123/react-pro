import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductsApi } from "@/services/products";
import { LeadsApi } from "@/services/leads";
import { SweetAlert } from "@/components/ui/SweetAlert";
import { normId } from "@/utils/id";

const PRODUCT_FETCH_LIMIT = 100;

export function useLeadProducts(leadId) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());

  const allSelected = useMemo(
    () => products.length > 0 && selectedProductIds.size === products.length,
    [products, selectedProductIds]
  );

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await ProductsApi.list({ page: 1, perPage: PRODUCT_FETCH_LIMIT });
      const items =
        Array.isArray(res?.data) ? res.data :
        Array.isArray(res?.data?.data) ? res.data.data :
        Array.isArray(res) ? res : [];
      setProducts(items);
    } catch (e) {
      console.error(e);
      SweetAlert.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const hydrateSelectedProducts = useCallback(async () => {
    if (!leadId) return;
    try {
      const res = await LeadsApi.getProducts(leadId);
      const list = (res?.data || res || []).map((p) => normId(p.id));
      setSelectedProductIds(new Set(list));
    } catch (e) {
      console.error(e);
      // non-blocking
    }
  }, [leadId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    hydrateSelectedProducts();
  }, [hydrateSelectedProducts]);

  const toggleProduct = useCallback((productId) => {
    const pid = normId(productId);
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      next.has(pid) ? next.delete(pid) : next.add(pid);
      return next;
    });
  }, []);

  const toggleAllProducts = useCallback(() => {
    if (allSelected) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(products.map((p) => normId(p.id))));
    }
  }, [allSelected, products]);

  const saveSelectedProducts = useCallback(async () => {
    if (!leadId) return;
    try {
      const result = await SweetAlert.confirm({
        title: "Save Product Selections?",
        text: "These products will be linked to the lead.",
        confirmButtonText: "Save",
      });
      if (!result.isConfirmed) return;

      const savedIds = Array.from(selectedProductIds);
      await LeadsApi.assignProducts(leadId, savedIds);

      // refresh canonical from server
      try {
        const res = await LeadsApi.getProducts(leadId);
        const fresh = new Set((res?.data || res || []).map((p) => normId(p.id)));
        setSelectedProductIds(fresh);
      } catch {
        setSelectedProductIds(new Set(savedIds));
      }

      SweetAlert.success("Products saved");
    } catch (e) {
      console.error(e);
      SweetAlert.error("Failed to save products");
    }
  }, [leadId, selectedProductIds]);

  return {
    products,
    loadingProducts,
    selectedProductIds,
    allSelected,
    toggleProduct,
    toggleAllProducts,
    saveSelectedProducts,
  };
}
