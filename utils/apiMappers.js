// Translate Dailyaches-api payloads (snake_case) into the shapes the app keeps in state.

export const mapPerson = (p) => ({
  id: String(p.id),
  name: p.name,
  relationship: p.relation || "",
  avatar: p.image_url || "Mujer feliz.png",
  phone: p.phone || "",
  whatsappEnabled: p.whatsapp_enabled || false,
});

export const mapPainType = (pt) => ({
  id: String(pt.id),
  name: pt.name,
  image: pt.image_url || null,
});

export const mapRecord = (r) => ({
  id: String(r.id),
  personId: String(r.person_id),
  painTypeId: String(r.pain_type_id),
  pain: r.pain_type_name,
  personName: r.person_name,
  painLevel: r.pain_level,
  notes: r.notes,
  createdAt: r.created_at,
});
