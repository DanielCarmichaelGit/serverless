import { z } from "zod";

const demographicsSchema = z.object({
  gender: z.array(z.enum(["male", "female", "nonbinary"])).nullable(),
  race: z
    .array(
      z.enum([
        "black",
        "latino",
        "native",
        "asian",
        "pacific_islander",
        "middle_eastern",
        "white",
        "multiracial",
        "any",
      ])
    )
    .nullable(),
  first_generation: z.boolean().nullable(),
  age_bucket: z
    .array(z.enum(["teen", "18_22", "23_29", "30_plus", "any"]))
    .nullable(),
  military_service: z
    .array(z.enum(["veteran", "active_duty", "reserve_guard", "dependent"]))
    .nullable(),
  disability_status: z.enum(["disabled", "none", "unspecified"]).nullable(),
  low_income: z.boolean().nullable(),
  foster_youth: z.boolean().nullable(),
  undocumented: z.boolean().nullable(),
});

const filtersSchema = z.object({
  degree: z
    .array(
      z.enum([
        "high_school",
        "associate",
        "undergrad",
        "graduate",
        "masters",
        "phd",
        "postdoc",
        "vocational",
        "certificate",
      ])
    )
    .nullable(),
  grade: z.enum(["9", "10", "11", "12"]).nullable(),
  gpa_min_bucket: z
    .enum(["none", "2_5", "3_0", "3_5", "3_8", "4_0"])
    .nullable(),
  enrollment: z.enum(["full_time", "part_time", "any"]).nullable(),
  field_of_study: z
    .array(
      z.enum([
        "cs",
        "engineering",
        "math",
        "physics",
        "chemistry",
        "biology",
        "business",
        "economics",
        "law",
        "medicine",
        "nursing",
        "education",
        "arts",
        "humanities",
        "social_science",
        "environmental",
      ])
    )
    .nullable(),
  citizenship: z
    .array(z.enum(["us", "permanent_resident", "intl", "daca"]))
    .nullable(),
  residency_state: z
    .array(
      z.enum([
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DE",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY",
        "DC",
      ])
    )
    .nullable(),
  need_based: z.boolean().nullable(),
});

export const scholarshipSchema = z.object({
  id: z.string(),
  location: z.string().nullable(),
  filters: filtersSchema,
  demographics: demographicsSchema,
});

export const scholarshipSchemaArray = z.array(scholarshipSchema);

const scholarshipRawSchema = z.object({
  name: z.string(),
  link: z.string(),
  host_site: z.string().nullable(),
  application_close_date: z.string().nullable(),
  application_open_date: z.string().nullable(),
  sponsor: z.string().nullable(),
  school: z.string().nullable(),
  description: z.string().nullable(),
  filters: filtersSchema,
  demographics: demographicsSchema,
  tags: z.array(z.string()).nullable(),
  raw: z.object({}),
  location: z.string().nullable(),
  amount: z.string().nullable(),
});


export const scholarshipArrayAsObject = z.object({
  scholarships: scholarshipSchemaArray,
});