export const FILTERS = {
    degree: ['high_school','associate','undergrad','graduate','masters','phd','postdoc','vocational','certificate'],
    grade: ['9','10','11','12'],
    gpa_min_bucket: ['none','2_5','3_0','3_5','3_8','4_0'],
    enrollment: ['full_time','part_time','any'],
    field_of_study: ['cs','engineering','math','physics','chemistry','biology','business','economics',
                     'law','medicine','nursing','education','arts','humanities','social_science','environmental'],
    citizenship: ['us','permanent_resident','intl','daca','any'],
    residency_state: ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME',
                      'MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA',
                      'RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'],
    need_based: [true,false],
    merit_based: [true,false],
    essay_required: [true,false],
    recommendation_required: [true,false],
    fafsa_required: [true,false],
    deadline_month: [1,2,3,4,5,6,7,8,9,10,11,12]
  };
  
  export const DEMOGRAPHICS = {
    gender: ['female','male','nonbinary','any'],
    race_ethnicity: ['black','latino','native','asian','pacific_islander','middle_eastern','white','multiracial','any'],
    age_bucket: ['teen','18_22','23_29','30_plus','any'],
    military_service: ['veteran','active_duty','reserve_guard','dependent','none'],
    disability_status: ['disabled','none','unspecified'],
    first_generation: [true,false],
    low_income: [true,false],
    foster_youth: [true,false],
    undocumented: [true,false]
  };
  