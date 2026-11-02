import { collectRecordPages } from "../recordsPaging";

// A fake API over `total` records (ids 1..total, newest first).
const fakeApi = (total, { limitless = false } = {}) => {
  const all = Array.from({ length: total }, (_, i) => ({ id: total - i }));
  const calls = [];
  const fetchPage = async (limit, offset) => {
    calls.push({ limit, offset });
    if (limitless) return { success: true, data: { records: all, total, limit: null } };
    return {
      success: true,
      data: { records: all.slice(offset, offset + limit), total, limit, offset },
    };
  };
  return { fetchPage, calls, all };
};

describe("collectRecordPages", () => {
  it("returns every record in order, one page per request", async () => {
    const { fetchPage, calls, all } = fakeApi(450);
    const result = await collectRecordPages(fetchPage, 200);
    expect(result.success).toBe(true);
    expect(result.records).toEqual(all);
    expect(calls).toEqual([
      { limit: 200, offset: 0 },
      { limit: 200, offset: 200 },
      { limit: 200, offset: 400 },
    ]);
  });

  it("does not ask for an extra empty page when the total is a multiple", async () => {
    const { fetchPage, calls } = fakeApi(400);
    const result = await collectRecordPages(fetchPage, 200);
    expect(result.records).toHaveLength(400);
    expect(calls).toHaveLength(2);
  });

  it("handles an empty account with a single request", async () => {
    const { fetchPage, calls } = fakeApi(0);
    const result = await collectRecordPages(fetchPage, 200);
    expect(result).toEqual({ success: true, records: [] });
    expect(calls).toHaveLength(1);
  });

  it("accepts an API that ignores the limit and sends everything", async () => {
    const { fetchPage, calls, all } = fakeApi(500, { limitless: true });
    const result = await collectRecordPages(fetchPage, 200);
    expect(result.records).toEqual(all);
    expect(calls).toHaveLength(1);
  });

  it("keeps each record once when new ones shift the pages", async () => {
    const pages = [
      { records: [{ id: 5 }, { id: 4 }], total: 4 },
      { records: [{ id: 4 }, { id: 3 }], total: 5 }, // 4 shifted into page two
      { records: [{ id: 2 }, { id: 1 }], total: 5 },
    ];
    let call = 0;
    const fetchPage = async (limit) => ({
      success: true,
      data: { ...pages[call++], limit },
    });
    const result = await collectRecordPages(fetchPage, 2);
    expect(result.records.map((r) => r.id)).toEqual([5, 4, 3, 2, 1]);
  });

  it("fails as a whole when a page fails, without partial data", async () => {
    let call = 0;
    const fetchPage = async (limit) => {
      call += 1;
      if (call === 2) return { success: false, error: "timeout", status: 0 };
      return {
        success: true,
        data: { records: Array.from({ length: limit }, (_, i) => ({ id: i })), total: 1000, limit },
      };
    };
    const result = await collectRecordPages(fetchPage, 200);
    expect(result).toEqual({ success: false, error: "timeout", status: 0 });
  });
});
