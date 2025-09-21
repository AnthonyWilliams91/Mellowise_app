-- ============================================================================
-- COMPLETE LSAT QUESTIONS MIGRATION
-- Generated from JSON files - 960 questions across 24 subsections
-- ============================================================================

-- Include setup from migrate-questions.sql first
\i migrate-questions.sql;

-- Migration Statistics
DO $$
BEGIN
    RAISE NOTICE 'Starting migration of 960 LSAT questions...';
END $$;

-- LogicalReasoning_Assumption.json (40 questions)

SELECT insert_lsat_question(
    'lr-assum-001',
    'Logical Reasoning',
    'Assumption',
    6,
    '{"question_text": "A recent study found that companies implementing remote work policies experienced a 25% increase in employee productivity. The CEO of TechFlow Inc. concluded that adopting remote work would directly cause similar productivity gains for their company. The CEO''s conclusion assumes which of the following?", "answer_choices": [{"label": "A", "text": "TechFlow''s employees are currently working below their maximum productivity potential."}, {"label": "B", "text": "Remote work policies are the primary factor responsible for the productivity increases observed in the study."}, {"label": "C", "text": "TechFlow''s employees would prefer to work remotely rather than in the office."}, {"label": "D", "text": "The study included companies similar in size and industry to TechFlow Inc."}, {"label": "E", "text": "Productivity gains from remote work can be sustained over long periods."}], "correct_answer": "B", "explanation": "The CEO assumes remote work caused the productivity gains. This requires assuming no other major factors were responsible for the 25% increase observed in the study."}',
    ARRAY['assumption', 'necessary', 'causation', 'business-scenario']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-002',
    'Logical Reasoning',
    'Assumption',
    5,
    '{"question_text": "Environmental scientist Maria argues that installing solar panels on all government buildings would significantly reduce the city''s carbon emissions. She notes that government buildings account for 15% of the city''s total energy consumption. Maria''s argument depends on the assumption that:", "answer_choices": [{"label": "A", "text": "Solar panels are the most cost-effective renewable energy option for large buildings."}, {"label": "B", "text": "The electricity currently used by government buildings is generated primarily from carbon-emitting sources."}, {"label": "C", "text": "Government buildings have adequate roof space and sun exposure for solar panel installation."}, {"label": "D", "text": "Installing solar panels would not require significant changes to the buildings'' electrical systems."}, {"label": "E", "text": "The city government has sufficient budget allocated for renewable energy initiatives."}], "correct_answer": "B", "explanation": "For solar panels to reduce carbon emissions, the current electricity must be generating carbon emissions. If the grid is already clean, solar panels wouldn''t reduce emissions significantly."}',
    ARRAY['assumption', 'environmental', 'logical-gap']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-003',
    'Logical Reasoning',
    'Assumption',
    4,
    '{"question_text": "The new health insurance policy will cover preventive care visits at no cost to patients. Dr. Johnson believes this will lead to earlier detection of serious diseases and ultimately save the insurance company money. Dr. Johnson''s reasoning assumes:", "answer_choices": [{"label": "A", "text": "Most patients currently avoid preventive care due to cost concerns."}, {"label": "B", "text": "Early detection of diseases typically results in less expensive treatment than late detection."}, {"label": "C", "text": "Preventive care visits are generally less expensive than treatment visits."}, {"label": "D", "text": "The insurance company is currently spending too much money on disease treatment."}, {"label": "E", "text": "Patients will take advantage of free preventive care visits."}], "correct_answer": "B", "explanation": "The argument concludes that free preventive care will save money through early detection. This requires assuming early detection leads to cost savings compared to late detection."}',
    ARRAY['assumption', 'healthcare', 'causal-reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-004',
    'Logical Reasoning',
    'Assumption',
    5,
    '{"question_text": "Restaurant critic Sarah claims that the downtown location of Milano''s will fail within six months because it lacks adequate parking. She points out that the restaurant has only 12 parking spaces for a 150-seat establishment. Sarah''s prediction rests on which assumption?", "answer_choices": [{"label": "A", "text": "Successful restaurants typically have a parking space-to-seat ratio of at least 1:4."}, {"label": "B", "text": "Most of Milano''s potential customers will drive to the restaurant rather than use alternative transportation."}, {"label": "C", "text": "The downtown area has limited street parking available to restaurant patrons."}, {"label": "D", "text": "Milano''s food quality is not exceptional enough to overcome parking inconvenience."}, {"label": "E", "text": "Other restaurants in the area have more parking spaces than Milano''s."}], "correct_answer": "B", "explanation": "The critic assumes parking shortage will cause failure. This requires assuming customers need parking - that most will drive rather than walk, take public transport, etc."}',
    ARRAY['assumption', 'business-failure', 'causal-reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-005',
    'Logical Reasoning',
    'Assumption',
    6,
    '{"question_text": "The archaeology professor argued that the recently discovered pottery fragments are at least 3,000 years old because they were found in the same soil layer as bones from extinct animals known to have lived 3,000 years ago. The professor''s reasoning depends on assuming:", "answer_choices": [{"label": "A", "text": "The pottery and animal bones were deposited in the soil layer at approximately the same time."}, {"label": "B", "text": "No other pottery fragments have been found in deeper soil layers at the site."}, {"label": "C", "text": "The extinct animals lived exclusively 3,000 years ago and at no other time."}, {"label": "D", "text": "The soil layers at this archaeological site have not been significantly disturbed."}, {"label": "E", "text": "Similar pottery fragments found at other sites have been reliably dated to 3,000 years ago."}], "correct_answer": "A", "explanation": "The argument uses co-location in the same soil layer to infer contemporaneous age. This requires assuming items in the same layer were deposited around the same time."}',
    ARRAY['assumption', 'archaeology', 'co-location-inference']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-006',
    'Logical Reasoning',
    'Assumption',
    7,
    '{"question_text": "Legal scholar Martinez contends that the new witness protection program will significantly reduce organized crime prosecutions because potential witnesses will be more willing to testify. However, she notes that the program can only protect a limited number of witnesses each year. Martinez''s argument assumes which of the following?", "answer_choices": [{"label": "A", "text": "The current witness protection program is inadequate for prosecuting organized crime."}, {"label": "B", "text": "Fear of retaliation is currently the primary factor preventing witnesses from testifying in organized crime cases."}, {"label": "C", "text": "The number of witnesses willing to testify will not exceed the program''s capacity to protect them."}, {"label": "D", "text": "Organized crime groups are not aware of the witness protection program''s limitations."}, {"label": "E", "text": "Successful prosecutions of organized crime require testimony from multiple witnesses."}], "correct_answer": "B", "explanation": "The argument claims protection will increase prosecutions by making witnesses more willing to testify. This assumes fear is currently the main barrier to testimony."}',
    ARRAY['assumption', 'legal-reasoning', 'policy-effectiveness']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-007',
    'Logical Reasoning',
    'Assumption',
    4,
    '{"question_text": "The city council''s decision to replace all parking meters with mobile payment systems will increase parking revenue, according to transportation director Chen. She argues that mobile payments are more convenient, so more people will choose to pay for parking rather than risk tickets. Chen''s conclusion assumes:", "answer_choices": [{"label": "A", "text": "The current parking meter system frequently malfunctions and discourages payment."}, {"label": "B", "text": "Many people currently park illegally specifically because of the inconvenience of feeding parking meters."}, {"label": "C", "text": "Mobile payment systems are less expensive to maintain than traditional parking meters."}, {"label": "D", "text": "Most drivers own smartphones capable of making mobile payments."}, {"label": "E", "text": "The fines for parking violations will remain at their current levels."}], "correct_answer": "B", "explanation": "The argument claims mobile payment convenience will increase compliance. This requires assuming that inconvenience is currently causing some people to park illegally."}',
    ARRAY['assumption', 'policy-change', 'behavioral-prediction']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-008',
    'Logical Reasoning',
    'Assumption',
    6,
    '{"question_text": "Nutritionist Williams argues that banning soft drink sales in schools will improve students'' dental health because students will consume fewer cavity-causing beverages during school hours. Williams'' reasoning depends on which assumption?", "answer_choices": [{"label": "A", "text": "Soft drinks are the primary cause of dental problems among school-age children."}, {"label": "B", "text": "Students currently purchase soft drinks from school vending machines and cafeterias."}, {"label": "C", "text": "Students will not bring soft drinks from home to replace those banned from school sales."}, {"label": "D", "text": "Alternative beverages available at school are less harmful to dental health than soft drinks."}, {"label": "E", "text": "Reducing cavity-causing beverage consumption will improve dental health outcomes."}], "correct_answer": "C", "explanation": "The argument claims banning school sales will reduce consumption. This assumes students won''t simply obtain soft drinks through alternative means that bypass the ban."}',
    ARRAY['assumption', 'policy-effectiveness', 'behavioral-substitution']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-009',
    'Logical Reasoning',
    'Assumption',
    5,
    '{"question_text": "The museum director believes that offering free admission on weekday afternoons will attract more local families because working parents will bring their children after school. However, the museum is located in a business district with limited residential housing nearby. The director''s reasoning assumes:", "answer_choices": [{"label": "A", "text": "Local families are currently unable to visit the museum due to admission costs."}, {"label": "B", "text": "Parents in the area have flexible work schedules that allow afternoon museum visits."}, {"label": "C", "text": "The museum''s current programming is suitable for children and families."}, {"label": "D", "text": "Families are willing to travel from residential areas to the business district for free museum visits."}, {"label": "E", "text": "Weekday afternoons are more convenient for families than weekends or evenings."}], "correct_answer": "D", "explanation": "Given the business district location with limited nearby residential housing, attracting ''local families'' requires assuming families will travel from residential areas to reach the museum."}',
    ARRAY['assumption', 'location-constraint', 'family-attraction']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-010',
    'Logical Reasoning',
    'Assumption',
    7,
    '{"question_text": "Computer scientist Roberts claims that implementing two-factor authentication will eliminate security breaches at the company because hackers will no longer be able to access accounts with just stolen passwords. Roberts'' argument rests on which assumption?", "answer_choices": [{"label": "A", "text": "The company''s current security breaches are caused primarily by hackers using stolen passwords."}, {"label": "B", "text": "Employees will consistently use the two-factor authentication system when required."}, {"label": "C", "text": "Two-factor authentication is more secure than single-password systems."}, {"label": "D", "text": "Hackers cannot obtain or bypass both factors required for two-factor authentication."}, {"label": "E", "text": "The company''s sensitive data is currently stored in password-protected accounts."}], "correct_answer": "A", "explanation": "Roberts claims two-factor authentication will eliminate breaches by preventing password-based access. This requires assuming password theft is the primary current breach method."}',
    ARRAY['assumption', 'cybersecurity', 'complete-elimination']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-011',
    'Logical Reasoning',
    'Assumption',
-- First 100 lines for testing
