import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Category, FulfillmentMode, Product, Store, StoreId } from "@/domain/types";
import { catalogRepository, storeRepository } from "@/repositories/memory";

type LoadStatus = "loading" | "ready" | "error";

interface CatalogContextValue {
  categories: readonly Category[];
  fulfillmentMode: FulfillmentMode;
  loadError?: string;
  products: readonly Product[];
  reload(): Promise<void>;
  selectStore(storeId: StoreId, mode: FulfillmentMode): void;
  selectedStore?: Store;
  status: LoadStatus;
  stores: readonly Store[];
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

export function CatalogProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [loadError, setLoadError] = useState<string>();
  const [stores, setStores] = useState<readonly Store[]>([]);
  const [categories, setCategories] = useState<readonly Category[]>([]);
  const [products, setProducts] = useState<readonly Product[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<StoreId>();
  const [fulfillmentMode, setFulfillmentMode] = useState<FulfillmentMode>("pickup");

  const reload = useCallback(async () => {
    setStatus("loading");
    setLoadError(undefined);
    const [storeResult, categoryResult, productResult] = await Promise.all([
      storeRepository.list(),
      catalogRepository.listCategories(),
      catalogRepository.listProducts(),
    ]);

    if (!storeResult.ok || !categoryResult.ok || !productResult.ok) {
      setLoadError("The local demo catalog could not be loaded.");
      setStatus("error");
      return;
    }

    setStores(storeResult.value);
    setCategories(categoryResult.value);
    setProducts(productResult.value);
    setStatus("ready");
  }, []);

  useEffect(() => {
    void Promise.resolve().then(reload);
  }, [reload]);

  const selectedStore = stores.find(({ id }) => id === selectedStoreId);
  const selectStore = useCallback((storeId: StoreId, mode: FulfillmentMode) => {
    setSelectedStoreId(storeId);
    setFulfillmentMode(mode);
  }, []);

  const value = useMemo<CatalogContextValue>(
    () => ({
      categories,
      fulfillmentMode,
      loadError,
      products,
      reload,
      selectStore,
      selectedStore,
      status,
      stores,
    }),
    [
      categories,
      fulfillmentMode,
      loadError,
      products,
      reload,
      selectStore,
      selectedStore,
      status,
      stores,
    ],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) {
    throw new Error("useCatalog must be used inside CatalogProvider.");
  }
  return value;
}
