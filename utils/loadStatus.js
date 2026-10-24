// Load state for each remote resource (people, painTypes, records):
// { loading, loaded, error }. `loaded` becomes true after the first success.

export const DEFAULT_LOAD_ERROR = "No se pudo conectar con el servidor";

export const initialLoadStatus = () => ({
  loading: false,
  loaded: false,
  error: null,
});

export const initialRemoteStatus = () => ({
  people: initialLoadStatus(),
  painTypes: initialLoadStatus(),
  records: initialLoadStatus(),
});

// The previous error stays until the retry succeeds, so the notice does not flicker.
export const startLoad = (prev) => ({ ...prev, loading: true });

export const finishLoad = () => ({ loading: false, loaded: true, error: null });

export const failLoad = (prev, message) => ({
  ...prev,
  loading: false,
  error: message || DEFAULT_LOAD_ERROR,
});

// `sources` is a list of { status, hasData, label, onRetry }. Returns what a
// screen should tell the user: which resources are loading for the first time
// with nothing to show yet, and which failed.
export const summarizeSources = (sources) => {
  const list = (sources || []).filter((source) => source && source.status);
  const failed = list.filter((source) => source.status.error);
  const initialLoading = list.filter(
    (source) =>
      source.status.loading &&
      !source.status.loaded &&
      !source.hasData &&
      !source.status.error,
  );
  return {
    failed,
    initialLoading,
    hasStaleData: failed.some((source) => source.hasData),
    isRetrying: failed.some((source) => source.status.loading),
  };
};

export const joinLabels = (labels) => {
  if (labels.length <= 1) return labels[0] || "";
  return `${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`;
};
