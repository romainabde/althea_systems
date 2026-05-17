"use client";

import { useCallback, useEffect, useState } from "react";

// =============================================================================
// useResource
// -----------------------------------------------------------------------------
// Hook simple pour charger une liste depuis l'API admin et offrir des
// helpers de mutation qui rechargent automatiquement.
//
// Exemple d'usage :
//   const { rows, loading, error, refresh, run } = useResource(productsApi.list);
//   await run(() => productsApi.create(values));   // ré-fetch après succès
//
// "transform" : fonction optionnelle qui adapte la réponse en tableau.
//   Par défaut, on suppose que la réponse EST un tableau.
// =============================================================================

export default function useResource(loader, { transform } = {}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loader();
      const next = typeof transform === "function" ? transform(data) : data;
      setRows(Array.isArray(next) ? next : next ? [next] : []);
    } catch (err) {
      setError(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [loader, transform]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Lance une mutation (création / update / delete) puis rafraîchit la liste
  // si l'opération réussit.
  const run = useCallback(
    async (action) => {
      setError(null);
      try {
        await action();
        await refresh();
        return true;
      } catch (err) {
        setError(err);
        return false;
      }
    },
    [refresh]
  );

  return { rows, setRows, loading, error, setError, refresh, run };
}
