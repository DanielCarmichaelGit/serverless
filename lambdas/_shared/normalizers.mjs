// tiny helpers used across lambdas
export const chunk = (a, n) => { const o=[]; for (let i=0;i<a.length;i+=n) o.push(a.slice(i,i+n)); return o; };
export const nullish = v => v === undefined ? null : v;
export const numOrNull = n => (typeof n === "number" && isFinite(n)) ? n : null;
export const boolOrNull = b => (typeof b === "boolean") ? b : null;
export const dateOrNull = s => { if(!s) return null; const d = new Date(s); return isNaN(+d) ? null : d.toISOString().slice(0,10); };
export const hostFrom = u => { try { return new URL(u).host; } catch { return null; } };
export const cleanTags = (tags) => {
  if (!Array.isArray(tags)) return null;
  const out = tags.map(t => String(t).trim()).filter(t => t && t.split(/\s+/).length <= 5);
  return out.length ? Array.from(new Set(out)) : null;
};

import { FILTERS, DEMOGRAPHICS } from "./registries.mjs";

export function normalizeFilters(input = {}) {
  const out = {};
  const pickArr = (k) => { const set=new Set(FILTERS[k]); const v=input[k]; if(Array.isArray(v)){ const a=v.filter(x=>set.has(x)); if(a.length) out[k]=a; } };
  const pickOne = (k) => { const set=new Set(FILTERS[k]); const v=input[k]; if(set.has(v)) out[k]=v; };
  const pickBool = (k) => { const v=input[k]; if(typeof v==='boolean') out[k]=v; };

  pickArr('degree'); pickArr('grade'); pickArr('field_of_study');
  pickOne('gpa_min_bucket'); pickOne('enrollment'); pickOne('citizenship'); pickOne('residency_state');
  pickBool('need_based'); pickBool('merit_based'); pickBool('essay_required'); pickBool('recommendation_required'); pickBool('fafsa_required');

  if (Array.isArray(input.deadline_month)) {
    const m = input.deadline_month.filter(n => Number.isInteger(n) && n>=1 && n<=12);
    if (m.length) out.deadline_month = m;
  }
  return out;
}

export function normalizeDemographics(input = {}) {
  const out = {};
  const one = (k, set) => { const v=input[k]; if (v && new Set(set).has(v)) out[k]=v; };
  const arr = (k, set) => { const v=input[k]; if(Array.isArray(v)){ const a=v.filter(x=>new Set(set).has(x)); if(a.length) out[k]=a; } };
  const bool = (k) => { const v=input[k]; if(typeof v==='boolean') out[k]=v; };

  one('gender', DEMOGRAPHICS.gender);
  arr('race_ethnicity', DEMOGRAPHICS.race_ethnicity);
  one('age_bucket', DEMOGRAPHICS.age_bucket);
  one('military_service', DEMOGRAPHICS.military_service);
  one('disability_status', DEMOGRAPHICS.disability_status);
  bool('first_generation'); bool('low_income'); bool('foster_youth'); bool('undocumented');
  return out;
}
