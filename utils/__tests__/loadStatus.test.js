import {
  DEFAULT_LOAD_ERROR,
  failLoad,
  finishLoad,
  initialLoadStatus,
  initialRemoteStatus,
  joinLabels,
  startLoad,
  summarizeSources,
} from "../loadStatus";

describe("load status transitions", () => {
  it("starts idle for every resource", () => {
    const status = initialRemoteStatus();
    expect(Object.keys(status)).toEqual(["people", "painTypes", "records"]);
    expect(status.people).toEqual({ loading: false, loaded: false, error: null });
  });

  it("keeps the previous error while a retry is running", () => {
    const failed = failLoad(initialLoadStatus(), "boom");
    expect(startLoad(failed)).toEqual({
      loading: true,
      loaded: false,
      error: "boom",
    });
    expect(finishLoad().error).toBeNull();
  });

  it("marks loaded after success and keeps loaded after a later failure", () => {
    const ok = finishLoad();
    expect(ok).toEqual({ loading: false, loaded: true, error: null });
    const later = failLoad(startLoad(ok), "sin red");
    expect(later).toEqual({ loading: false, loaded: true, error: "sin red" });
  });

  it("falls back to a default error message", () => {
    expect(failLoad(initialLoadStatus()).error).toBe(DEFAULT_LOAD_ERROR);
  });
});

describe("summarizeSources", () => {
  const source = (status, extra = {}) => ({
    status: { ...initialLoadStatus(), ...status },
    hasData: false,
    label: "las personas",
    ...extra,
  });

  it("reports an initial load only while nothing is shown yet", () => {
    expect(
      summarizeSources([source({ loading: true })]).initialLoading,
    ).toHaveLength(1);
    expect(
      summarizeSources([source({ loading: true }, { hasData: true })])
        .initialLoading,
    ).toHaveLength(0);
    expect(
      summarizeSources([source({ loading: true, loaded: true })])
        .initialLoading,
    ).toHaveLength(0);
  });

  it("collects failures and whether stale data is on screen", () => {
    const result = summarizeSources([
      source({ error: "x" }, { hasData: true }),
      source({}),
    ]);
    expect(result.failed).toHaveLength(1);
    expect(result.hasStaleData).toBe(true);
  });

  it("flags a retry in progress", () => {
    expect(
      summarizeSources([source({ error: "x", loading: true })]).isRetrying,
    ).toBe(true);
    expect(summarizeSources([source({ error: "x" })]).isRetrying).toBe(false);
  });

  it("ignores missing sources", () => {
    expect(summarizeSources(undefined).failed).toEqual([]);
    expect(summarizeSources([null, {}]).failed).toEqual([]);
  });
});

describe("joinLabels", () => {
  it("joins in natural Spanish", () => {
    expect(joinLabels([])).toBe("");
    expect(joinLabels(["a"])).toBe("a");
    expect(joinLabels(["a", "b"])).toBe("a y b");
    expect(joinLabels(["a", "b", "c"])).toBe("a, b y c");
  });
});
