// Reads every record of the account in pages, so no single request has to carry
// the whole history. `fetchPage(limit, offset)` returns the usual
// { success, data|error } of HttpService; `data` is { records, total, limit }.
export const RECORDS_PAGE_SIZE = 200;

// Safety net against a server that never ends (200 pages = 40 000 records).
const MAX_PAGES = 200;

export const collectRecordPages = async (
  fetchPage,
  pageSize = RECORDS_PAGE_SIZE,
) => {
  const records = [];
  const seen = new Set();
  let offset = 0;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const response = await fetchPage(pageSize, offset);
    if (!response.success) return response;

    const batch = response.data?.records || [];
    // Records created while paging shift the offsets: keep each one once.
    for (const record of batch) {
      if (!seen.has(record.id)) {
        seen.add(record.id);
        records.push(record);
      }
    }

    // An API that ignores `limit` answers with everything at once.
    const paged = response.data?.limit != null;
    const total = response.data?.total;
    offset += batch.length;
    if (!paged || batch.length < pageSize || batch.length === 0) break;
    if (typeof total === "number" && offset >= total) break;
  }

  return { success: true, records };
};
