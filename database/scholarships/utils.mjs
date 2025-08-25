import { supabase } from "../../clients/supabase/index.mjs";

const upsert = async (scholarships) => {
  // quickly deduplicate by link
  const deduplicated = scholarships.filter(
    (scholarship, index, self) =>
      index === self.findIndex((t) => t.link === scholarship.link)
  );

  const { data, error } = await supabase
    .from("scholarship_lot")
    .upsert(deduplicated, {
      onConflict: "link",
    });

  if (error) {
    console.error("Error upserting scholarships:", error);
  }

  return data;
};

const pull = async (site, limit = 100000) => {
  const recs = [];
  let count = 0;
  let keepGoing = true;

  while (keepGoing) {
    const { data, error } = await supabase
      .from("scholarship_lot")
      .select("raw")
      .eq("synced", false)
      .eq("site", site)
      .limit(1000)
      .range(count * 1000, (count + 1) * 1000 - 1);

    recs.push(...data);

    count += 1;

    if (!data.length > 0 || (recs.length >= limit && limit !== 100000)) {
      keepGoing = false;
      break;
    }
  }

  return recs;
};

const sync = async (records) => {
  const { data: upserted, error: upsertError } = await supabase
    .from("scholarships")
    .upsert(records);

  if (upsertError) {
    console.error("Error upserting scholarships:", upsertError);
  }

  const { data: synced, error: syncError } = await supabase
    .from("scholarship_lot")
    .update({
      synced: true,
    })
    .in(
      "link",
      records.map((r) => r.link)
    );

  if (syncError) {
    console.error("Error syncing lot status:", syncError);
  }

  const today = new Date();
  const todayFormatted = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;

  const { data: deleted, error: deleteError } = await supabase
    .from("scholarships")
    .delete()
    .lt("deadline", todayFormatted)
    .select("link");

  const { data: lotDeleted, error: lotDeleteError } = await supabase
    .from("scholarship_lot")
    .delete()
    .in("link", deleted.map((r) => r.link));

  if (deleteError) {
    console.error("Error deleting scholarships:", deleteError);
    return;
  }

  if (lotDeleteError) {
    console.error("Error deleting scholarships:", lotDeleteError);
  }
};

export const parkingLot = {
  upsert: upsert,
  pull: pull,
  sync: sync,
};
