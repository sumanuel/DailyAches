// Who has the most records: the podium shown on the people list.

export const MEDALS = {
  1: { emoji: "🥇", label: "Primer lugar" },
  2: { emoji: "🥈", label: "Segundo lugar" },
  3: { emoji: "🥉", label: "Tercer lugar" },
};

// Map of person id (as a string) to its place, 1 to 3. People with the same
// number of records share a place, and the next place is skipped (1, 1, 3).
// There is no podium for a single person, nor for people without records.
export const rankPeopleByRecords = (people, records) => {
  const places = new Map();
  if (!Array.isArray(people) || people.length < 2) return places;

  const counts = new Map();
  for (const record of records || []) {
    const id = String(record.personId);
    counts.set(id, (counts.get(id) || 0) + 1);
  }

  const withRecords = people
    .map((person) => ({ id: String(person.id), count: counts.get(String(person.id)) || 0 }))
    .filter((entry) => entry.count > 0);

  for (const entry of withRecords) {
    const place = 1 + withRecords.filter((other) => other.count > entry.count).length;
    if (place <= 3) places.set(entry.id, place);
  }
  return places;
};
