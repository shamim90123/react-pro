// src/hooks/useLeadProducts.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductsApi } from "@/services/products";
import { LeadsApi } from "../api/leadsApi";
import { UsersApi } from "@/services/users";
import { DemoBookApi } from "@/services/DemoBook";
import { SaleStageApi } from "@/services/SaleStages";
import { SweetAlert } from "@/components/ui/SweetAlert";
import { normId } from "@/utils/id";

const PRODUCT_FETCH_LIMIT = 100;

/**
 * Note: UI does not show "Use Lead AM". We still accept `leadAccountManagerId`
 * to set the default product AM when pivot AM is empty.
 */
export function useLeadProducts(leadId, leadAccountManagerId) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());
  const [stages, setStages] = useState([]);
  const [users, setUsers] = useState([]);
  const [demoBooks, setDemoBooks] = useState([]);

  // { [productId]: { sales_stage_id: string|"", account_manager_id: string|"" } }
  const [edits, setEdits] = useState({});

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

  const loadStagesAndUsers = useCallback(async () => {
    try {
      const [sRes, uRes] = await Promise.all([
        SaleStageApi.list(),
        UsersApi.list?.() ?? UsersApi.getAll?.() ?? Promise.resolve({ data: [] }),
      ]);
      const sItems = Array.isArray(sRes?.data) ? sRes.data : (sRes || []);
      const uItems = Array.isArray(uRes?.data) ? uRes.data : (uRes || []);
      setStages(sItems);
      setUsers(uItems);
    } catch (e) {
      console.error(e);
      // Non-blocking
    }
  }, []);

  // demobooks are used as products in some setups
  useEffect(() => {
    const loadDemoBooks = async () => {
      try {
        const res = await DemoBookApi.list({ page: 1, perPage: PRODUCT_FETCH_LIMIT });
        const items = Array.isArray(res) ? res : (res || []);
        setDemoBooks(items);
      } catch (e) {
        console.error(e);
        // non-blocking
      }
    };
    loadDemoBooks();
  }, []);

  const hydrateSelectedProducts = useCallback(async () => {
    if (!leadId) return;
    try {
      const res = await LeadsApi.getProducts(leadId);
      
      const arr = (res?.data || res || []).map((p) => ({
        id: normId(p.id),
        stage: p?.pivot?.sales_stage_id ? String(p.pivot.sales_stage_id) : "",
        am: p?.pivot?.account_manager_id ? String(p.pivot.account_manager_id) : "",
        contact: p?.pivot?.contact_id ? String(p.pivot.contact_id) : "",
        notes: p?.pivot?.notes ? String(p.pivot.notes) : "",
        demoBookID: p?.pivot?.demo_book_id ? String(p.pivot.demo_book_id) : "",
        demoBookDate: p?.pivot?.demo_book_date ? p.pivot.demo_book_date : "",
      }));

      // select current links
      setSelectedProductIds(new Set(arr.map((a) => a.id)));


      // seed edits: if pivot AM empty, default to lead AM
      setEdits((prev) => {
        const next = { ...prev };
        for (const a of arr) {
          next[a.id] = {
            sales_stage_id: a.stage || "",
            account_manager_id:
              a.am || (leadAccountManagerId ? String(leadAccountManagerId) : ""),
            contact_id: a.contact  || "",
            notes: a.notes  || "",
            demo_book_id: a.demoBookID  || "",
            demo_book_date: a.demoBookDate  || "",
          };
        }
        return next;
      });
      
    } catch (e) {
      console.error(e);
      // non-blocking
    }
  }, [leadId, leadAccountManagerId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadStagesAndUsers();
  }, [loadStagesAndUsers]);

  useEffect(() => {
    hydrateSelectedProducts();
  }, [hydrateSelectedProducts]);

  const ensureEditRow = useCallback(
    (pid) => {
      setEdits((prev) => {
        if (prev[pid]) return prev;
        return {
          ...prev,
          [pid]: {
            sales_stage_id: "",
            account_manager_id: leadAccountManagerId ? String(leadAccountManagerId) : "",
            contact_id: "",
            demo_book_id: "",
            demo_book_date: ""
          },
        };
      });
    },
    [leadAccountManagerId]
  );

  const toggleProduct = useCallback(
    (productId) => {
      const pid = normId(productId);
      setSelectedProductIds((prev) => {
        const next = new Set(prev);
        next.has(pid) ? next.delete(pid) : next.add(pid);
        return next;
      });
      ensureEditRow(pid);
    },
    [ensureEditRow]
  );

  const toggleAllProducts = useCallback(() => {
    if (allSelected) {
      setSelectedProductIds(new Set());
    } else {
      const ids = products.map((p) => normId(p.id));
      setSelectedProductIds(new Set(ids));
      setEdits((prev) => {
        const next = { ...prev };
        for (const p of products) {
          const pid = normId(p.id);
          if (!next[pid]) {
            next[pid] = {
              sales_stage_id: "",
              account_manager_id: leadAccountManagerId ? String(leadAccountManagerId) : "",
              contact_id: "",
              demo_book_id: "",
              demo_book_date: ""
            };
          }
        }
        return next;
      });
    }
  }, [allSelected, products, leadAccountManagerId]);

  const onEditField = useCallback((productId, patch) => {
    const pid = normId(productId);
    setEdits((prev) => {
      console.log('onEditField')
      const base =
        prev[pid] ?? {
          sales_stage_id: "",
          account_manager_id: leadAccountManagerId ? String(leadAccountManagerId) : "",
          contact_id: "",
          demo_book_id: "",
          demo_book_date: ""
        };
      return { ...prev, [pid]: { ...base, ...patch } };
    });
  }, [leadAccountManagerId]);

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

      // 1) Replace the set of linked products
      await LeadsApi.assignProducts(leadId, savedIds);

      // 2) Bulk apply pivot values (single API call)
      const items = savedIds.map((pid) => {
        const row = edits[pid] || {};
        const sales_stage_id = row.sales_stage_id || null;
        const account_manager_id =
          row.account_manager_id || (leadAccountManagerId ? String(leadAccountManagerId) : "");

        const contactId = row.contact_id || null
        const notes = row.notes || ''
        const demoBookId = row.demo_book_id || null
        const demoBookDate = row.demo_book_date || null


        return {
          product_id: Number(pid),
          sales_stage_id: sales_stage_id ? Number(sales_stage_id) : null,
          account_manager_id: account_manager_id ? Number(account_manager_id) : null,
          contact_id: contactId ? Number(contactId) : null,
          notes: notes || null,
          demo_book_id: demoBookId ? Number(demoBookId) : null,
          demo_book_date: demoBookDate || null,
        };
      });

      if (items.length > 0) {
        await LeadsApi.bulkUpdateProductLinks(leadId, items);
      }

      SweetAlert.success("Products & settings saved");
    } catch (e) {
      console.error(e);
      SweetAlert.error("Failed to save products");
    }
  }, [leadId, selectedProductIds, edits, leadAccountManagerId]);

  return {
    products,
    loadingProducts,
    selectedProductIds,
    allSelected,
    toggleProduct,
    toggleAllProducts,
    saveSelectedProducts,
    // expose for table
    stages,
    users,
    demoBooks,
    edits,
    onEditField,
  };
}
