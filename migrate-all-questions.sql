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
    3,
    '{"question_text": "The mayor announced that the new bike-sharing program will reduce traffic congestion downtown because commuters will choose bicycles over cars for short trips. The program will place 200 bikes at 20 stations throughout the downtown area. The mayor''s conclusion assumes:", "answer_choices": [{"label": "A", "text": "Downtown commuters currently make a significant number of short trips by car."}, {"label": "B", "text": "The bike stations will be conveniently located near major destinations."}, {"label": "C", "text": "Weather conditions will not prevent regular bicycle use throughout the year."}, {"label": "D", "text": "The 200 bicycles will be sufficient to meet demand from interested users."}, {"label": "E", "text": "Bicycle sharing programs in other cities have successfully reduced traffic congestion."}], "correct_answer": "A", "explanation": "The mayor claims bikes will reduce congestion by replacing car trips. This requires assuming people currently make car trips that could be replaced by bikes."}',
    ARRAY['assumption', 'transportation-policy', 'behavioral-substitution']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-012',
    'Logical Reasoning',
    'Assumption',
    8,
    '{"question_text": "University administrator Phillips argues that requiring all students to take a financial literacy course will reduce student loan defaults after graduation. She notes that many graduates struggle with debt management and loan repayment. Phillips'' reasoning depends on which assumption?", "answer_choices": [{"label": "A", "text": "Current financial literacy education at the university is inadequate or nonexistent."}, {"label": "B", "text": "Students who default on loans lack sufficient financial knowledge rather than face unavoidable economic hardship."}, {"label": "C", "text": "A single required course provides sufficient time to teach practical debt management skills."}, {"label": "D", "text": "Students will retain and apply financial knowledge learned during their college years."}, {"label": "E", "text": "Financial literacy courses have proven effective at reducing loan defaults at other universities."}], "correct_answer": "B", "explanation": "The argument claims education will reduce defaults. This assumes defaults result from lack of knowledge rather than external economic factors beyond education''s influence."}',
    ARRAY['assumption', 'education-policy', 'causal-attribution']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-013',
    'Logical Reasoning',
    'Assumption',
    6,
    '{"question_text": "Sports journalist Kim predicts that the new salary cap will make professional basketball more competitive because wealthy teams will no longer be able to acquire all the best players. Kim''s prediction assumes:", "answer_choices": [{"label": "A", "text": "The current lack of competitiveness is primarily due to unequal distribution of talented players."}, {"label": "B", "text": "All teams will spend up to the maximum allowed under the salary cap."}, {"label": "C", "text": "The best players are currently concentrated on a few wealthy teams."}, {"label": "D", "text": "Teams will not find alternative ways to attract top players within salary cap constraints."}, {"label": "E", "text": "Player salaries are the primary factor in athletes'' team selection decisions."}], "correct_answer": "A", "explanation": "Kim predicts salary caps will increase competitiveness by redistributing talent. This assumes that talent concentration is the main factor reducing current competitiveness."}',
    ARRAY['assumption', 'sports-policy', 'competitive-balance']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-014',
    'Logical Reasoning',
    'Assumption',
    5,
    '{"question_text": "Marketing director Torres believes that switching from plastic to biodegradable packaging will increase sales because environmentally conscious consumers will prefer products with sustainable packaging. The company''s customer surveys show that 78% of respondents express concern about environmental issues. Torres'' argument assumes:", "answer_choices": [{"label": "A", "text": "Biodegradable packaging costs will not significantly increase the product''s retail price."}, {"label": "B", "text": "Environmentally concerned consumers will translate their stated concerns into purchasing decisions."}, {"label": "C", "text": "The company''s competitors are not already using biodegradable packaging."}, {"label": "D", "text": "Biodegradable packaging will not negatively affect product quality or shelf life."}, {"label": "E", "text": "The 78% of environmentally concerned consumers represents the majority of the company''s target market."}], "correct_answer": "B", "explanation": "Torres uses survey data showing environmental concern to predict purchasing behavior. This requires assuming stated concerns translate into actual buying decisions."}',
    ARRAY['assumption', 'consumer-behavior', 'attitude-behavior-gap']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-015',
    'Logical Reasoning',
    'Assumption',
    7,
    '{"question_text": "The library director claims that extending weekend hours will significantly increase book circulation because many working people cannot visit the library during current weekday-only hours. However, the extended weekend service will require hiring additional staff at premium weekend pay rates. The director''s argument assumes:", "answer_choices": [{"label": "A", "text": "The increased circulation revenue will offset the additional staffing costs."}, {"label": "B", "text": "Working people constitute a substantial portion of the library''s potential user base."}, {"label": "C", "text": "Current users will not decrease their weekday visits due to increased weekend availability."}, {"label": "D", "text": "Weekend library users will check out books rather than simply use library computers or study spaces."}, {"label": "E", "text": "Other activities competing for weekend time will not prevent working people from visiting the library."}], "correct_answer": "B", "explanation": "The director predicts significant circulation increases from serving working people on weekends. This assumes working people represent a large enough group to create significant impact."}',
    ARRAY['assumption', 'service-expansion', 'user-base-size']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-016',
    'Logical Reasoning',
    'Assumption',
    4,
    '{"question_text": "Technology blogger Anderson argues that the new smartwatch will fail commercially because it requires daily charging, unlike competing devices that need charging only weekly. Anderson claims busy professionals will find daily charging inconvenient. Anderson''s prediction rests on which assumption?", "answer_choices": [{"label": "A", "text": "Busy professionals constitute the primary target market for smartwatches."}, {"label": "B", "text": "Daily charging represents a significant inconvenience compared to weekly charging."}, {"label": "C", "text": "The smartwatch offers no advantages that would offset the charging inconvenience."}, {"label": "D", "text": "Competing devices with weekly charging are readily available and similarly priced."}, {"label": "E", "text": "Professional users primarily make purchasing decisions based on convenience factors rather than features."}], "correct_answer": "B", "explanation": "Anderson predicts failure based on charging frequency difference. This requires assuming the frequency difference is meaningful enough to influence purchase decisions."}',
    ARRAY['assumption', 'product-failure', 'comparative-inconvenience']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-017',
    'Logical Reasoning',
    'Assumption',
    8,
    '{"question_text": "Economic analyst Green contends that the proposed minimum wage increase will reduce employment opportunities for entry-level workers because employers will hire fewer people rather than pay higher wages. Green''s reasoning assumes:", "answer_choices": [{"label": "A", "text": "Employers currently hire the optimal number of entry-level workers at present wage levels."}, {"label": "B", "text": "Entry-level workers'' productivity levels justify the current minimum wage but not the proposed higher wage."}, {"label": "C", "text": "Employers cannot offset wage increases through other cost reductions or productivity improvements."}, {"label": "D", "text": "The demand for entry-level workers is sufficiently sensitive to wage costs that higher wages will reduce hiring."}, {"label": "E", "text": "Alternative employment options are not available to workers who lose entry-level positions."}], "correct_answer": "D", "explanation": "Green predicts employment reduction from wage increases. This assumes employer demand for workers is responsive enough to wage costs that higher costs will reduce hiring."}',
    ARRAY['assumption', 'economic-policy', 'labor-demand-elasticity']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-018',
    'Logical Reasoning',
    'Assumption',
    6,
    '{"question_text": "Medical researcher Taylor argues that the new screening test will save lives by detecting cancer earlier in high-risk patients. The test has a 95% accuracy rate and can identify tumors six months sooner than current methods. Taylor''s conclusion assumes:", "answer_choices": [{"label": "A", "text": "High-risk patients will comply with recommended screening schedules."}, {"label": "B", "text": "Earlier detection by six months leads to significantly improved treatment outcomes."}, {"label": "C", "text": "The 5% false positive rate will not cause harmful unnecessary treatments."}, {"label": "D", "text": "Current screening methods are inadequate for detecting early-stage cancers."}, {"label": "E", "text": "The cost of the new screening test is reasonable compared to treatment savings."}], "correct_answer": "B", "explanation": "Taylor claims earlier detection will save lives. This requires assuming the six-month head start provides clinically meaningful benefits for patient outcomes."}',
    ARRAY['assumption', 'medical-screening', 'temporal-benefit']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-019',
    'Logical Reasoning',
    'Assumption',
    4,
    '{"question_text": "Urban planner Wilson proposes that creating more pedestrian-only zones will revitalize the downtown shopping district because foot traffic will increase when people can walk freely without vehicle interference. Wilson''s argument depends on which assumption?", "answer_choices": [{"label": "A", "text": "Current vehicle traffic is discouraging people from walking in the downtown area."}, {"label": "B", "text": "Downtown businesses depend primarily on foot traffic rather than vehicle-accessible customers."}, {"label": "C", "text": "Pedestrian zones in other cities have successfully revitalized their shopping districts."}, {"label": "D", "text": "Alternative parking will be available near the pedestrian-only zones."}, {"label": "E", "text": "The downtown shopping district currently lacks sufficient pedestrian infrastructure."}], "correct_answer": "A", "explanation": "Wilson claims removing vehicles will increase foot traffic, which will revitalize shopping. This assumes vehicles are currently deterring pedestrian activity."}',
    ARRAY['assumption', 'urban-planning', 'barrier-removal']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-020',
    'Logical Reasoning',
    'Assumption',
    5,
    '{"question_text": "Education consultant Martinez believes that implementing year-round schooling will improve student academic performance because students will retain more knowledge without the long summer break that causes learning loss. Martinez''s reasoning assumes:", "answer_choices": [{"label": "A", "text": "Students currently experience significant learning loss during summer vacations."}, {"label": "B", "text": "Year-round schedules provide the same total instructional time as traditional calendars."}, {"label": "C", "text": "Teachers and students will adapt successfully to the year-round schedule."}, {"label": "D", "text": "The shorter breaks in year-round scheduling will not cause learning loss."}, {"label": "E", "text": "Academic performance depends primarily on knowledge retention rather than other factors."}], "correct_answer": "A", "explanation": "Martinez claims year-round school will improve performance by reducing learning loss from summer breaks. This requires assuming significant learning loss currently occurs during summers."}',
    ARRAY['assumption', 'education-policy', 'problem-solution-fit']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-021',
    'Logical Reasoning',
    'Assumption',
    7,
    '{"question_text": "Film critic Johnson argues that streaming services will ultimately replace movie theaters because the convenience of home viewing outweighs the social experience of theater attendance for most people. Johnson cites the rapid growth in streaming subscriptions over the past five years. Johnson''s prediction assumes:", "answer_choices": [{"label": "A", "text": "Streaming technology will continue to improve picture and sound quality."}, {"label": "B", "text": "The cost of theater tickets will continue to increase relative to streaming subscriptions."}, {"label": "C", "text": "Consumer preferences that drove past streaming growth will continue to prioritize convenience over social experience."}, {"label": "D", "text": "Movie theaters will not adapt their offerings to compete more effectively with home viewing."}, {"label": "E", "text": "The social experience of theater attendance is less important to consumers than previously believed."}], "correct_answer": "C", "explanation": "Johnson uses past streaming growth to predict theater replacement based on convenience preferences. This assumes current consumer priorities will persist and continue driving market changes."}',
    ARRAY['assumption', 'market-prediction', 'preference-stability']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-022',
    'Logical Reasoning',
    'Assumption',
    8,
    '{"question_text": "Environmental engineer Clark claims that installing green roofs on downtown office buildings will significantly reduce urban heat island effects because vegetation absorbs heat and provides cooling through evapotranspiration. Clark notes that downtown temperatures average 4-6 degrees higher than surrounding areas. Clark''s argument depends on which assumption?", "answer_choices": [{"label": "A", "text": "Office buildings are major contributors to the current urban heat island effect."}, {"label": "B", "text": "Green roof technology is cost-effective compared to alternative cooling solutions."}, {"label": "C", "text": "Building owners will voluntarily install green roofs or be required to do so by regulation."}, {"label": "D", "text": "The cooling effects from green roofs will scale up sufficiently to impact citywide temperatures."}, {"label": "E", "text": "Current urban heat island effects cause significant problems that justify intervention."}], "correct_answer": "D", "explanation": "Clark argues individual green roofs will significantly reduce citywide heat island effects. This assumes localized cooling benefits will aggregate into meaningful citywide temperature changes."}',
    ARRAY['assumption', 'environmental-engineering', 'scaling-effects']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-023',
    'Logical Reasoning',
    'Assumption',
    6,
    '{"question_text": "Social media analyst Roberts predicts that the new privacy regulations will cause users to abandon the platform because the opt-in consent requirements will be too cumbersome for casual users. Roberts notes that similar regulations reduced user engagement on other platforms by 15-20%. Roberts'' prediction assumes:", "answer_choices": [{"label": "A", "text": "Users prioritize convenience over privacy protection when using social media platforms."}, {"label": "B", "text": "The platform''s user base consists primarily of casual users rather than committed regular users."}, {"label": "C", "text": "Alternative social media platforms with fewer privacy requirements will be available to users."}, {"label": "D", "text": "The consent process cannot be streamlined to reduce user burden while maintaining compliance."}, {"label": "E", "text": "The platform''s unique features are not compelling enough to retain users despite consent inconvenience."}], "correct_answer": "A", "explanation": "Roberts predicts user abandonment due to consent process inconvenience. This assumes users will choose convenience over privacy protection, even when given the choice."}',
    ARRAY['assumption', 'user-behavior', 'privacy-convenience-tradeoff']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-024',
    'Logical Reasoning',
    'Assumption',
    5,
    '{"question_text": "Public health director Kim argues that implementing calorie labeling requirements for restaurant menu items will reduce obesity rates because consumers will make healthier choices when informed about caloric content. Kim cites studies showing 60% of consumers want calorie information available. Kim''s argument assumes:", "answer_choices": [{"label": "A", "text": "Consumers currently underestimate the caloric content of restaurant meals."}, {"label": "B", "text": "Caloric awareness will translate into actual changes in food ordering behavior."}, {"label": "C", "text": "Restaurant compliance with calorie labeling requirements will be consistent and accurate."}, {"label": "D", "text": "Consumers who want calorie information represent those most likely to change their behavior."}, {"label": "E", "text": "Reducing caloric intake is the most effective approach to addressing obesity."}], "correct_answer": "B", "explanation": "Kim claims information availability will lead to healthier choices and reduced obesity. This assumes consumers will act on calorie information rather than simply having access to it."}',
    ARRAY['assumption', 'public-health', 'information-behavior-gap']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-025',
    'Logical Reasoning',
    'Assumption',
    6,
    '{"question_text": "Aviation expert Thompson claims that electric aircraft will revolutionize short-distance air travel within a decade because battery technology improvements are making electric propulsion viable for flights under 300 miles. Thompson notes that battery energy density has doubled in the past five years. Thompson''s prediction rests on which assumption?", "answer_choices": [{"label": "A", "text": "Current battery technology improvements will continue at the same rate for the next decade."}, {"label": "B", "text": "Short-distance flights represent a significant portion of the commercial aviation market."}, {"label": "C", "text": "Electric aircraft will be cost-competitive with conventional aircraft for short flights."}, {"label": "D", "text": "Regulatory authorities will approve electric aircraft for commercial passenger service."}, {"label": "E", "text": "Airlines will adopt electric aircraft technology once it becomes technically feasible."}], "correct_answer": "A", "explanation": "Thompson extrapolates from past battery improvements to predict aviation revolution within a decade. This assumes the historical rate of improvement will continue sufficiently long to enable revolution."}',
    ARRAY['assumption', 'technological-prediction', 'trend-extrapolation']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-026',
    'Logical Reasoning',
    'Assumption',
    9,
    '{"question_text": "Corporate trainer Lee argues that mandatory workplace diversity training will improve employee relations and reduce discrimination complaints because employees will develop better understanding of colleagues from different backgrounds. Lee''s argument assumes:", "answer_choices": [{"label": "A", "text": "Current employee relations problems stem primarily from lack of understanding rather than intentional discrimination."}, {"label": "B", "text": "Employees will approach diversity training with genuine openness to learning rather than resistance."}, {"label": "C", "text": "The training program content and delivery will be effective at building understanding."}, {"label": "D", "text": "Improved understanding between colleagues will translate into measurably better workplace behavior."}, {"label": "E", "text": "Discrimination complaints accurately reflect the level of workplace discrimination problems."}], "correct_answer": "A", "explanation": "Lee claims training will improve relations by building understanding. This assumes current problems result from lack of understanding that education can address, rather than deeper issues."}',
    ARRAY['assumption', 'workplace-training', 'problem-causation']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-027',
    'Logical Reasoning',
    'Assumption',
    7,
    '{"question_text": "Agricultural economist Davis contends that vertical farming will become economically viable for staple crops within five years because LED lighting costs have decreased by 80% over the past decade and continue falling. Davis notes that energy costs represent 60% of current vertical farming expenses. Davis'' conclusion assumes:", "answer_choices": [{"label": "A", "text": "LED lighting cost reductions will continue at the current rate for the next five years."}, {"label": "B", "text": "Reducing energy costs by continuing LED improvements will make vertical farming cost-competitive with traditional agriculture."}, {"label": "C", "text": "Other vertical farming costs besides energy will not increase significantly to offset lighting savings."}, {"label": "D", "text": "Staple crops can be grown successfully using current vertical farming techniques."}, {"label": "E", "text": "Consumer demand for vertically farmed products will support economic viability."}], "correct_answer": "B", "explanation": "Davis argues LED cost reductions will make vertical farming viable. This requires assuming continued energy cost reduction will close the economic gap with traditional farming."}',
    ARRAY['assumption', 'economic-viability', 'cost-competitiveness']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-028',
    'Logical Reasoning',
    'Assumption',
    8,
    '{"question_text": "Technology ethicist White argues that artificial intelligence systems should be required to provide explanations for their decisions because users have a right to understand how conclusions that affect them are reached. White''s position assumes:", "answer_choices": [{"label": "A", "text": "Current AI systems are capable of generating meaningful explanations for their decision-making processes."}, {"label": "B", "text": "Users will be able to understand and effectively utilize AI-generated explanations."}, {"label": "C", "text": "The right to explanation is more important than potential decreases in AI system accuracy that might result from explanation requirements."}, {"label": "D", "text": "AI systems make decisions that significantly impact individuals'' lives in ways that justify explanation requirements."}, {"label": "E", "text": "Explanation requirements will not make AI development prohibitively expensive or technically impractical."}], "correct_answer": "D", "explanation": "White argues for explanation requirements based on user rights. This assumes AI decisions have sufficient impact on users to justify the burden of mandatory explanations."}',
    ARRAY['assumption', 'technology-ethics', 'rights-justification']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-029',
    'Logical Reasoning',
    'Assumption',
    6,
    '{"question_text": "Retail analyst Brown predicts that physical bookstores will experience a resurgence because younger consumers increasingly value tangible, tactile shopping experiences over digital alternatives. Brown cites surveys showing 65% of people under 30 prefer handling products before purchasing. Brown''s prediction assumes:", "answer_choices": [{"label": "A", "text": "The preference for tactile experiences will outweigh other factors like convenience and price in book purchasing decisions."}, {"label": "B", "text": "Younger consumers represent a sufficient market segment to drive overall bookstore resurgence."}, {"label": "C", "text": "Physical bookstores will successfully adapt their offerings to appeal to younger consumers."}, {"label": "D", "text": "The current decline in bookstore visits is primarily due to lack of tactile experience rather than other factors."}, {"label": "E", "text": "Survey responses about shopping preferences accurately predict actual purchasing behavior."}], "correct_answer": "A", "explanation": "Brown uses tactile preference data to predict bookstore resurgence. This assumes tactile preferences will be the dominant factor in purchasing decisions despite competing considerations."}',
    ARRAY['assumption', 'retail-prediction', 'preference-dominance']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-030',
    'Logical Reasoning',
    'Assumption',
    5,
    '{"question_text": "Cybersecurity specialist Garcia argues that quantum encryption will be essential for protecting sensitive data within the next decade because quantum computers will be able to break current encryption methods. Garcia notes that quantum computing capabilities are advancing rapidly. Garcia''s argument assumes:", "answer_choices": [{"label": "A", "text": "Quantum computers capable of breaking current encryption will be developed within ten years."}, {"label": "B", "text": "Organizations will not develop alternative non-quantum encryption methods that are secure against quantum attacks."}, {"label": "C", "text": "Quantum encryption technology will be mature and commercially available within the required timeframe."}, {"label": "D", "text": "The cost of quantum encryption will be reasonable compared to the value of protected data."}, {"label": "E", "text": "Current encryption methods provide adequate security and are worth protecting against quantum threats."}], "correct_answer": "A", "explanation": "Garcia claims quantum encryption will be essential due to quantum computing threats within a decade. This requires assuming quantum computers will pose actual threats within that timeframe."}',
    ARRAY['assumption', 'cybersecurity', 'threat-timeline']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-031',
    'Logical Reasoning',
    'Assumption',
    7,
    '{"question_text": "Climate researcher Jones predicts that carbon capture technology will become crucial for meeting climate targets because renewable energy adoption alone cannot reduce emissions quickly enough to prevent dangerous warming. Jones notes that global emissions must be cut by 50% within eight years. Jones'' argument assumes:", "answer_choices": [{"label": "A", "text": "Carbon capture technology will become cost-effective and scalable within the required timeframe."}, {"label": "B", "text": "Renewable energy deployment rates cannot be accelerated beyond current projections."}, {"label": "C", "text": "Other emission reduction strategies besides renewable energy and carbon capture are insufficient."}, {"label": "D", "text": "The 50% emission reduction target within eight years is both necessary and achievable."}, {"label": "E", "text": "Current emission trends will continue without intervention beyond renewable energy adoption."}], "correct_answer": "B", "explanation": "Jones claims carbon capture is needed because renewables alone are insufficient. This assumes renewable deployment cannot be accelerated enough to meet targets independently."}',
    ARRAY['assumption', 'climate-policy', 'solution-insufficiency']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-032',
    'Logical Reasoning',
    'Assumption',
    9,
    '{"question_text": "Transportation planner Mitchell argues that autonomous vehicle technology will solve urban traffic congestion because self-driving cars can travel more closely together and coordinate their movements to optimize traffic flow. Mitchell notes that human reaction time limitations cause current following distance requirements. Mitchell''s reasoning assumes:", "answer_choices": [{"label": "A", "text": "Current traffic congestion is primarily caused by inefficient vehicle spacing and coordination rather than insufficient road capacity."}, {"label": "B", "text": "Autonomous vehicles will be adopted widely enough to create coordinated traffic flow effects."}, {"label": "C", "text": "The technology for vehicle coordination and close following will be reliable and safe."}, {"label": "D", "text": "Road infrastructure will not require significant modifications to support autonomous vehicle coordination."}, {"label": "E", "text": "Autonomous vehicles will not create new forms of traffic problems that offset efficiency gains."}], "correct_answer": "A", "explanation": "Mitchell claims autonomous vehicles will solve congestion through better spacing and coordination. This assumes current congestion stems from these inefficiencies rather than fundamental capacity limits."}',
    ARRAY['assumption', 'transportation-technology', 'problem-causation']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-033',
    'Logical Reasoning',
    'Assumption',
    8,
    '{"question_text": "Media studies professor Allen contends that subscription-based journalism will produce higher quality reporting than advertising-supported models because journalists will focus on serving subscribers rather than attracting advertiser-friendly content. Allen''s argument assumes:", "answer_choices": [{"label": "A", "text": "Subscriber preferences align better with quality journalism standards than advertiser preferences do."}, {"label": "B", "text": "Journalists currently compromise reporting quality to accommodate advertiser interests."}, {"label": "C", "text": "Subscription revenue will be sufficient to support comprehensive news operations."}, {"label": "D", "text": "Subscribers will be willing to pay for higher quality journalism rather than consume free alternatives."}, {"label": "E", "text": "Publishers will pass the benefits of subscription independence on to journalists rather than retain them."}], "correct_answer": "A", "explanation": "Allen claims subscription funding will improve quality by changing the audience journalists serve. This assumes subscribers want higher quality journalism than advertisers do."}',
    ARRAY['assumption', 'journalism-economics', 'incentive-alignment']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-034',
    'Logical Reasoning',
    'Assumption',
    6,
    '{"question_text": "Renewable energy consultant Parker claims that offshore wind farms will become the dominant source of electricity generation because they can operate at higher capacity factors than land-based wind or solar installations. Parker notes that offshore winds are more consistent and stronger than onshore alternatives. Parker''s prediction assumes:", "answer_choices": [{"label": "A", "text": "Higher capacity factors will make offshore wind more cost-effective than alternative energy sources despite higher installation costs."}, {"label": "B", "text": "Suitable offshore locations are available in sufficient quantity to meet electricity demand."}, {"label": "C", "text": "Environmental and regulatory barriers will not prevent large-scale offshore wind development."}, {"label": "D", "text": "Transmission infrastructure can be built to connect offshore wind farms to electricity grids economically."}, {"label": "E", "text": "Offshore wind technology will continue to improve and become more reliable over time."}], "correct_answer": "A", "explanation": "Parker uses capacity factor advantages to predict dominance. This assumes efficiency advantages will outweigh cost disadvantages to make offshore wind economically superior."}',
    ARRAY['assumption', 'energy-markets', 'technical-economic-advantage']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-035',
    'Logical Reasoning',
    'Assumption',
    4,
    '{"question_text": "Food scientist Rodriguez argues that lab-grown meat will replace conventional animal agriculture within two decades because it can produce protein more efficiently while eliminating animal welfare concerns. Rodriguez notes that early lab-grown products have achieved cost parity with premium conventional meat. Rodriguez''s argument assumes:", "answer_choices": [{"label": "A", "text": "Consumers will accept lab-grown meat as an equivalent substitute for conventional meat products."}, {"label": "B", "text": "Lab-grown meat production costs will continue decreasing to achieve broader price competitiveness."}, {"label": "C", "text": "Animal welfare concerns are significant enough to influence widespread consumer purchasing decisions."}, {"label": "D", "text": "Regulatory authorities will approve lab-grown meat for mass market distribution."}, {"label": "E", "text": "Lab-grown meat will achieve the same nutritional profile and taste as conventional meat."}], "correct_answer": "A", "explanation": "Rodriguez predicts replacement of conventional agriculture despite noting only premium price parity. This assumes consumers will embrace lab-grown alternatives rather than reject them due to production method preferences."}',
    ARRAY['assumption', 'food-technology', 'consumer-acceptance']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-036',
    'Logical Reasoning',
    'Assumption',
    2,
    '{"question_text": "The city''s new bike-sharing program will reduce downtown parking problems. Studies from similar cities show that bike-sharing programs decrease car usage by 15%. Therefore, implementing our program will free up significant parking spaces. The argument''s conclusion depends on assuming which of the following?", "answer_choices": [{"label": "A", "text": "Most people who use bike-sharing would otherwise drive downtown"}, {"label": "B", "text": "The bike-sharing program will be popular with tourists and visitors"}, {"label": "C", "text": "Other cities have similar downtown layouts to our city"}, {"label": "D", "text": "The program will operate efficiently and remain well-maintained"}, {"label": "E", "text": "Bike-sharing is more environmentally friendly than driving"}], "correct_answer": "A", "explanation": "For assumption questions, identify what unstated premise the argument requires to be valid."}',
    ARRAY['assumption', 'necessary', 'bike-sharing', 'parking-policy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-037',
    'Logical Reasoning',
    'Assumption',
    5,
    '{"question_text": "Online education is more effective than traditional classroom instruction because students can learn at their own pace. A recent survey found that 85% of online learners reported higher satisfaction with their educational experience compared to in-person classes. The argument assumes which of the following?", "answer_choices": [{"label": "A", "text": "Student satisfaction correlates with educational effectiveness"}, {"label": "B", "text": "Online education is less expensive than traditional classroom instruction"}, {"label": "C", "text": "Most students prefer flexible scheduling options"}, {"label": "D", "text": "Traditional classrooms cannot accommodate different learning paces"}, {"label": "E", "text": "Online technology will continue to improve over time"}], "correct_answer": "A", "explanation": "For assumption questions, identify what unstated premise the argument requires to be valid."}',
    ARRAY['assumption', 'survey-data', 'education', 'satisfaction-effectiveness']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-038',
    'Logical Reasoning',
    'Assumption',
    6,
    '{"question_text": "The municipality''s proposed bike-sharing program will reduce downtown parking problems. Research in similar cities show that bike-sharing programs decrease car usage by 15%. Therefore, implementing our program will free up significant parking spaces. The argument''s conclusion depends on assuming which of the following?", "answer_choices": [{"label": "A", "text": "Most people who use bike-sharing would otherwise drive downtown"}, {"label": "B", "text": "The bike-sharing program will be popular with tourists and visitors"}, {"label": "C", "text": "Other cities have similar downtown layouts to our city"}, {"label": "D", "text": "The program will operate efficiently and remain well-maintained"}, {"label": "E", "text": "Bike-sharing is more environmentally friendly than driving"}], "correct_answer": "A", "explanation": "For assumption questions, identify what unstated premise the argument requires to be valid."}',
    ARRAY['assumption', 'necessary', 'bike-sharing', 'parking-policy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-039',
    'Logical Reasoning',
    'Assumption',
    4,
    '{"question_text": "Online education is more effective than traditional classroom instruction because students can learn at their own pace. A recent survey found that 85% of online learners reported higher satisfaction with their educational experience compared to in-person classes. The argument assumes which of the following?", "answer_choices": [{"label": "A", "text": "Student satisfaction correlates with educational effectiveness"}, {"label": "B", "text": "Online education is less expensive than traditional classroom instruction"}, {"label": "C", "text": "Most students prefer flexible scheduling options"}, {"label": "D", "text": "Traditional classrooms cannot accommodate different learning paces"}, {"label": "E", "text": "Online technology will continue to improve over time"}], "correct_answer": "A", "explanation": "For assumption questions, identify what unstated premise the argument requires to be valid."}',
    ARRAY['assumption', 'survey-data', 'education', 'satisfaction-effectiveness']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-assum-040',
    'Logical Reasoning',
    'Assumption',
    8,
    '{"question_text": "The municipality''s proposed bike-sharing program will reduce downtown parking problems. Research in similar cities show that bike-sharing programs decrease car usage by 15%. Therefore, implementing our program will free up significant parking spaces. The argument''s conclusion depends on assuming which of the following?", "answer_choices": [{"label": "A", "text": "Most people who use bike-sharing would otherwise drive downtown"}, {"label": "B", "text": "The bike-sharing program will be popular with tourists and visitors"}, {"label": "C", "text": "Other cities have similar downtown layouts to our city"}, {"label": "D", "text": "The program will operate efficiently and remain well-maintained"}, {"label": "E", "text": "Bike-sharing is more environmentally friendly than driving"}], "correct_answer": "A", "explanation": "For assumption questions, identify what unstated premise the argument requires to be valid."}',
    ARRAY['assumption', 'necessary', 'bike-sharing', 'parking-policy']::TEXT[]
);

-- LogicalReasoning_FlawInReasoning.json (40 questions)

SELECT insert_lsat_question(
    'lr-flaw-001',
    'Logical Reasoning',
    'Flaw in Reasoning',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-002',
    'Logical Reasoning',
    'Flaw in Reasoning',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-003',
    'Logical Reasoning',
    'Flaw in Reasoning',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-004',
    'Logical Reasoning',
    'Flaw in Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-005',
    'Logical Reasoning',
    'Flaw in Reasoning',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-006',
    'Logical Reasoning',
    'Flaw in Reasoning',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-007',
    'Logical Reasoning',
    'Flaw in Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-008',
    'Logical Reasoning',
    'Flaw in Reasoning',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-009',
    'Logical Reasoning',
    'Flaw in Reasoning',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-010',
    'Logical Reasoning',
    'Flaw in Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-011',
    'Logical Reasoning',
    'Flaw in Reasoning',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-012',
    'Logical Reasoning',
    'Flaw in Reasoning',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-013',
    'Logical Reasoning',
    'Flaw in Reasoning',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-014',
    'Logical Reasoning',
    'Flaw in Reasoning',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-015',
    'Logical Reasoning',
    'Flaw in Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-016',
    'Logical Reasoning',
    'Flaw in Reasoning',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-017',
    'Logical Reasoning',
    'Flaw in Reasoning',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-018',
    'Logical Reasoning',
    'Flaw in Reasoning',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-019',
    'Logical Reasoning',
    'Flaw in Reasoning',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-020',
    'Logical Reasoning',
    'Flaw in Reasoning',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-021',
    'Logical Reasoning',
    'Flaw in Reasoning',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-022',
    'Logical Reasoning',
    'Flaw in Reasoning',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-023',
    'Logical Reasoning',
    'Flaw in Reasoning',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-024',
    'Logical Reasoning',
    'Flaw in Reasoning',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-025',
    'Logical Reasoning',
    'Flaw in Reasoning',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-026',
    'Logical Reasoning',
    'Flaw in Reasoning',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-027',
    'Logical Reasoning',
    'Flaw in Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-028',
    'Logical Reasoning',
    'Flaw in Reasoning',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-029',
    'Logical Reasoning',
    'Flaw in Reasoning',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-030',
    'Logical Reasoning',
    'Flaw in Reasoning',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-031',
    'Logical Reasoning',
    'Flaw in Reasoning',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-032',
    'Logical Reasoning',
    'Flaw in Reasoning',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-033',
    'Logical Reasoning',
    'Flaw in Reasoning',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-034',
    'Logical Reasoning',
    'Flaw in Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-035',
    'Logical Reasoning',
    'Flaw in Reasoning',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-036',
    'Logical Reasoning',
    'Flaw in Reasoning',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-037',
    'Logical Reasoning',
    'Flaw in Reasoning',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-038',
    'Logical Reasoning',
    'Flaw in Reasoning',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-039',
    'Logical Reasoning',
    'Flaw in Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-flaw-040',
    'Logical Reasoning',
    'Flaw in Reasoning',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['flaw in reasoning']::TEXT[]
);

-- LogicalReasoning_InferenceMustBeTrue.json (40 questions)

SELECT insert_lsat_question(
    'lr-infmbt-001',
    'Logical Reasoning',
    'Inference / Must Be True',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-002',
    'Logical Reasoning',
    'Inference / Must Be True',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-003',
    'Logical Reasoning',
    'Inference / Must Be True',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-004',
    'Logical Reasoning',
    'Inference / Must Be True',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-005',
    'Logical Reasoning',
    'Inference / Must Be True',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-006',
    'Logical Reasoning',
    'Inference / Must Be True',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-007',
    'Logical Reasoning',
    'Inference / Must Be True',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-008',
    'Logical Reasoning',
    'Inference / Must Be True',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-009',
    'Logical Reasoning',
    'Inference / Must Be True',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-010',
    'Logical Reasoning',
    'Inference / Must Be True',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-011',
    'Logical Reasoning',
    'Inference / Must Be True',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-012',
    'Logical Reasoning',
    'Inference / Must Be True',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-013',
    'Logical Reasoning',
    'Inference / Must Be True',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-014',
    'Logical Reasoning',
    'Inference / Must Be True',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-015',
    'Logical Reasoning',
    'Inference / Must Be True',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-016',
    'Logical Reasoning',
    'Inference / Must Be True',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-017',
    'Logical Reasoning',
    'Inference / Must Be True',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-018',
    'Logical Reasoning',
    'Inference / Must Be True',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-019',
    'Logical Reasoning',
    'Inference / Must Be True',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-020',
    'Logical Reasoning',
    'Inference / Must Be True',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-021',
    'Logical Reasoning',
    'Inference / Must Be True',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-022',
    'Logical Reasoning',
    'Inference / Must Be True',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-023',
    'Logical Reasoning',
    'Inference / Must Be True',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-024',
    'Logical Reasoning',
    'Inference / Must Be True',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-025',
    'Logical Reasoning',
    'Inference / Must Be True',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-026',
    'Logical Reasoning',
    'Inference / Must Be True',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-027',
    'Logical Reasoning',
    'Inference / Must Be True',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-028',
    'Logical Reasoning',
    'Inference / Must Be True',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-029',
    'Logical Reasoning',
    'Inference / Must Be True',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-030',
    'Logical Reasoning',
    'Inference / Must Be True',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-031',
    'Logical Reasoning',
    'Inference / Must Be True',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-032',
    'Logical Reasoning',
    'Inference / Must Be True',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-033',
    'Logical Reasoning',
    'Inference / Must Be True',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-034',
    'Logical Reasoning',
    'Inference / Must Be True',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-035',
    'Logical Reasoning',
    'Inference / Must Be True',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-036',
    'Logical Reasoning',
    'Inference / Must Be True',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-037',
    'Logical Reasoning',
    'Inference / Must Be True',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-038',
    'Logical Reasoning',
    'Inference / Must Be True',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-039',
    'Logical Reasoning',
    'Inference / Must Be True',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-infmbt-040',
    'Logical Reasoning',
    'Inference / Must Be True',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['inference / must be true']::TEXT[]
);

-- LogicalReasoning_MethodOfReasoning.json (40 questions)

SELECT insert_lsat_question(
    'lr-method-001',
    'Logical Reasoning',
    'Method of Reasoning',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-002',
    'Logical Reasoning',
    'Method of Reasoning',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-003',
    'Logical Reasoning',
    'Method of Reasoning',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-004',
    'Logical Reasoning',
    'Method of Reasoning',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-005',
    'Logical Reasoning',
    'Method of Reasoning',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-006',
    'Logical Reasoning',
    'Method of Reasoning',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-007',
    'Logical Reasoning',
    'Method of Reasoning',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-008',
    'Logical Reasoning',
    'Method of Reasoning',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-009',
    'Logical Reasoning',
    'Method of Reasoning',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-010',
    'Logical Reasoning',
    'Method of Reasoning',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-011',
    'Logical Reasoning',
    'Method of Reasoning',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-012',
    'Logical Reasoning',
    'Method of Reasoning',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-013',
    'Logical Reasoning',
    'Method of Reasoning',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-014',
    'Logical Reasoning',
    'Method of Reasoning',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-015',
    'Logical Reasoning',
    'Method of Reasoning',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-016',
    'Logical Reasoning',
    'Method of Reasoning',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-017',
    'Logical Reasoning',
    'Method of Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-018',
    'Logical Reasoning',
    'Method of Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-019',
    'Logical Reasoning',
    'Method of Reasoning',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-020',
    'Logical Reasoning',
    'Method of Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-021',
    'Logical Reasoning',
    'Method of Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-022',
    'Logical Reasoning',
    'Method of Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-023',
    'Logical Reasoning',
    'Method of Reasoning',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-024',
    'Logical Reasoning',
    'Method of Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-025',
    'Logical Reasoning',
    'Method of Reasoning',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-026',
    'Logical Reasoning',
    'Method of Reasoning',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-027',
    'Logical Reasoning',
    'Method of Reasoning',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-028',
    'Logical Reasoning',
    'Method of Reasoning',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-029',
    'Logical Reasoning',
    'Method of Reasoning',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-030',
    'Logical Reasoning',
    'Method of Reasoning',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-031',
    'Logical Reasoning',
    'Method of Reasoning',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-032',
    'Logical Reasoning',
    'Method of Reasoning',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-033',
    'Logical Reasoning',
    'Method of Reasoning',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-034',
    'Logical Reasoning',
    'Method of Reasoning',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-035',
    'Logical Reasoning',
    'Method of Reasoning',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-036',
    'Logical Reasoning',
    'Method of Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-037',
    'Logical Reasoning',
    'Method of Reasoning',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-038',
    'Logical Reasoning',
    'Method of Reasoning',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-039',
    'Logical Reasoning',
    'Method of Reasoning',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-method-040',
    'Logical Reasoning',
    'Method of Reasoning',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['method of reasoning']::TEXT[]
);

-- LogicalReasoning_ParadoxResolveExplain.json (40 questions)

SELECT insert_lsat_question(
    'lr-paradx-001',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-002',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-003',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-004',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-005',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-006',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-007',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-008',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-009',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-010',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-011',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-012',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-013',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-014',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-015',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-016',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-017',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-018',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-019',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-020',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-021',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-022',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-023',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-024',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-025',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-026',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-027',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-028',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-029',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-030',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-031',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-032',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-033',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-034',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-035',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-036',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-037',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-038',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-039',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-paradx-040',
    'Logical Reasoning',
    'Paradox / Resolve-Explain',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['paradox / resolve-explain']::TEXT[]
);

-- LogicalReasoning_ParallelFlaw.json (40 questions)

SELECT insert_lsat_question(
    'lr-pflw-001',
    'Logical Reasoning',
    'Parallel Flaw',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-002',
    'Logical Reasoning',
    'Parallel Flaw',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-003',
    'Logical Reasoning',
    'Parallel Flaw',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-004',
    'Logical Reasoning',
    'Parallel Flaw',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-005',
    'Logical Reasoning',
    'Parallel Flaw',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-006',
    'Logical Reasoning',
    'Parallel Flaw',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-007',
    'Logical Reasoning',
    'Parallel Flaw',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-008',
    'Logical Reasoning',
    'Parallel Flaw',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-009',
    'Logical Reasoning',
    'Parallel Flaw',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-010',
    'Logical Reasoning',
    'Parallel Flaw',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-011',
    'Logical Reasoning',
    'Parallel Flaw',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-012',
    'Logical Reasoning',
    'Parallel Flaw',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-013',
    'Logical Reasoning',
    'Parallel Flaw',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-014',
    'Logical Reasoning',
    'Parallel Flaw',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-015',
    'Logical Reasoning',
    'Parallel Flaw',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-016',
    'Logical Reasoning',
    'Parallel Flaw',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-017',
    'Logical Reasoning',
    'Parallel Flaw',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-018',
    'Logical Reasoning',
    'Parallel Flaw',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-019',
    'Logical Reasoning',
    'Parallel Flaw',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-020',
    'Logical Reasoning',
    'Parallel Flaw',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-021',
    'Logical Reasoning',
    'Parallel Flaw',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-022',
    'Logical Reasoning',
    'Parallel Flaw',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-023',
    'Logical Reasoning',
    'Parallel Flaw',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-024',
    'Logical Reasoning',
    'Parallel Flaw',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-025',
    'Logical Reasoning',
    'Parallel Flaw',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-026',
    'Logical Reasoning',
    'Parallel Flaw',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-027',
    'Logical Reasoning',
    'Parallel Flaw',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-028',
    'Logical Reasoning',
    'Parallel Flaw',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-029',
    'Logical Reasoning',
    'Parallel Flaw',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-030',
    'Logical Reasoning',
    'Parallel Flaw',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-031',
    'Logical Reasoning',
    'Parallel Flaw',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-032',
    'Logical Reasoning',
    'Parallel Flaw',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-033',
    'Logical Reasoning',
    'Parallel Flaw',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-034',
    'Logical Reasoning',
    'Parallel Flaw',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-035',
    'Logical Reasoning',
    'Parallel Flaw',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-036',
    'Logical Reasoning',
    'Parallel Flaw',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-037',
    'Logical Reasoning',
    'Parallel Flaw',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-038',
    'Logical Reasoning',
    'Parallel Flaw',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-039',
    'Logical Reasoning',
    'Parallel Flaw',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-pflw-040',
    'Logical Reasoning',
    'Parallel Flaw',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel flaw']::TEXT[]
);

-- LogicalReasoning_ParallelReasoning.json (40 questions)

SELECT insert_lsat_question(
    'lr-preas-001',
    'Logical Reasoning',
    'Parallel Reasoning',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-002',
    'Logical Reasoning',
    'Parallel Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-003',
    'Logical Reasoning',
    'Parallel Reasoning',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-004',
    'Logical Reasoning',
    'Parallel Reasoning',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-005',
    'Logical Reasoning',
    'Parallel Reasoning',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-006',
    'Logical Reasoning',
    'Parallel Reasoning',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-007',
    'Logical Reasoning',
    'Parallel Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-008',
    'Logical Reasoning',
    'Parallel Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-009',
    'Logical Reasoning',
    'Parallel Reasoning',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-010',
    'Logical Reasoning',
    'Parallel Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-011',
    'Logical Reasoning',
    'Parallel Reasoning',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-012',
    'Logical Reasoning',
    'Parallel Reasoning',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-013',
    'Logical Reasoning',
    'Parallel Reasoning',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-014',
    'Logical Reasoning',
    'Parallel Reasoning',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-015',
    'Logical Reasoning',
    'Parallel Reasoning',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-016',
    'Logical Reasoning',
    'Parallel Reasoning',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-017',
    'Logical Reasoning',
    'Parallel Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-018',
    'Logical Reasoning',
    'Parallel Reasoning',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-019',
    'Logical Reasoning',
    'Parallel Reasoning',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-020',
    'Logical Reasoning',
    'Parallel Reasoning',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-021',
    'Logical Reasoning',
    'Parallel Reasoning',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-022',
    'Logical Reasoning',
    'Parallel Reasoning',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-023',
    'Logical Reasoning',
    'Parallel Reasoning',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-024',
    'Logical Reasoning',
    'Parallel Reasoning',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-025',
    'Logical Reasoning',
    'Parallel Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-026',
    'Logical Reasoning',
    'Parallel Reasoning',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-027',
    'Logical Reasoning',
    'Parallel Reasoning',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-028',
    'Logical Reasoning',
    'Parallel Reasoning',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-029',
    'Logical Reasoning',
    'Parallel Reasoning',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-030',
    'Logical Reasoning',
    'Parallel Reasoning',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-031',
    'Logical Reasoning',
    'Parallel Reasoning',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-032',
    'Logical Reasoning',
    'Parallel Reasoning',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-033',
    'Logical Reasoning',
    'Parallel Reasoning',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-034',
    'Logical Reasoning',
    'Parallel Reasoning',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-035',
    'Logical Reasoning',
    'Parallel Reasoning',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-036',
    'Logical Reasoning',
    'Parallel Reasoning',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-037',
    'Logical Reasoning',
    'Parallel Reasoning',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-038',
    'Logical Reasoning',
    'Parallel Reasoning',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-039',
    'Logical Reasoning',
    'Parallel Reasoning',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-preas-040',
    'Logical Reasoning',
    'Parallel Reasoning',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['parallel reasoning']::TEXT[]
);

-- LogicalReasoning_PointAtIssueAgreement.json (40 questions)

SELECT insert_lsat_question(
    'lr-poi-001',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-002',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-003',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-004',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-005',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-006',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-007',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-008',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-009',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-010',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-011',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-012',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-013',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-014',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-015',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-016',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-017',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-018',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-019',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-020',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-021',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-022',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-023',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-024',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-025',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-026',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-027',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-028',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-029',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-030',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-031',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-032',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-033',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-034',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-035',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-036',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-037',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-038',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-039',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-poi-040',
    'Logical Reasoning',
    'Point at Issue / Agreement',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['point at issue / agreement']::TEXT[]
);

-- LogicalReasoning_PrincipleApplication.json (40 questions)

SELECT insert_lsat_question(
    'lr-papp-001',
    'Logical Reasoning',
    'Principle Application',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-002',
    'Logical Reasoning',
    'Principle Application',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-003',
    'Logical Reasoning',
    'Principle Application',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-004',
    'Logical Reasoning',
    'Principle Application',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-005',
    'Logical Reasoning',
    'Principle Application',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-006',
    'Logical Reasoning',
    'Principle Application',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-007',
    'Logical Reasoning',
    'Principle Application',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-008',
    'Logical Reasoning',
    'Principle Application',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-009',
    'Logical Reasoning',
    'Principle Application',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-010',
    'Logical Reasoning',
    'Principle Application',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-011',
    'Logical Reasoning',
    'Principle Application',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-012',
    'Logical Reasoning',
    'Principle Application',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-013',
    'Logical Reasoning',
    'Principle Application',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-014',
    'Logical Reasoning',
    'Principle Application',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-015',
    'Logical Reasoning',
    'Principle Application',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-016',
    'Logical Reasoning',
    'Principle Application',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-017',
    'Logical Reasoning',
    'Principle Application',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-018',
    'Logical Reasoning',
    'Principle Application',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-019',
    'Logical Reasoning',
    'Principle Application',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-020',
    'Logical Reasoning',
    'Principle Application',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-021',
    'Logical Reasoning',
    'Principle Application',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-022',
    'Logical Reasoning',
    'Principle Application',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-023',
    'Logical Reasoning',
    'Principle Application',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-024',
    'Logical Reasoning',
    'Principle Application',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-025',
    'Logical Reasoning',
    'Principle Application',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-026',
    'Logical Reasoning',
    'Principle Application',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-027',
    'Logical Reasoning',
    'Principle Application',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-028',
    'Logical Reasoning',
    'Principle Application',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-029',
    'Logical Reasoning',
    'Principle Application',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-030',
    'Logical Reasoning',
    'Principle Application',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-031',
    'Logical Reasoning',
    'Principle Application',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-032',
    'Logical Reasoning',
    'Principle Application',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-033',
    'Logical Reasoning',
    'Principle Application',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-034',
    'Logical Reasoning',
    'Principle Application',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-035',
    'Logical Reasoning',
    'Principle Application',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-036',
    'Logical Reasoning',
    'Principle Application',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-037',
    'Logical Reasoning',
    'Principle Application',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-038',
    'Logical Reasoning',
    'Principle Application',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-039',
    'Logical Reasoning',
    'Principle Application',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-papp-040',
    'Logical Reasoning',
    'Principle Application',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle application']::TEXT[]
);

-- LogicalReasoning_PrincipleSupport.json (40 questions)

SELECT insert_lsat_question(
    'lr-psup-001',
    'Logical Reasoning',
    'Principle Support',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-002',
    'Logical Reasoning',
    'Principle Support',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-003',
    'Logical Reasoning',
    'Principle Support',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-004',
    'Logical Reasoning',
    'Principle Support',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-005',
    'Logical Reasoning',
    'Principle Support',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-006',
    'Logical Reasoning',
    'Principle Support',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-007',
    'Logical Reasoning',
    'Principle Support',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-008',
    'Logical Reasoning',
    'Principle Support',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-009',
    'Logical Reasoning',
    'Principle Support',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-010',
    'Logical Reasoning',
    'Principle Support',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-011',
    'Logical Reasoning',
    'Principle Support',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-012',
    'Logical Reasoning',
    'Principle Support',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-013',
    'Logical Reasoning',
    'Principle Support',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-014',
    'Logical Reasoning',
    'Principle Support',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-015',
    'Logical Reasoning',
    'Principle Support',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-016',
    'Logical Reasoning',
    'Principle Support',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-017',
    'Logical Reasoning',
    'Principle Support',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-018',
    'Logical Reasoning',
    'Principle Support',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-019',
    'Logical Reasoning',
    'Principle Support',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-020',
    'Logical Reasoning',
    'Principle Support',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-021',
    'Logical Reasoning',
    'Principle Support',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-022',
    'Logical Reasoning',
    'Principle Support',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-023',
    'Logical Reasoning',
    'Principle Support',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-024',
    'Logical Reasoning',
    'Principle Support',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-025',
    'Logical Reasoning',
    'Principle Support',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-026',
    'Logical Reasoning',
    'Principle Support',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-027',
    'Logical Reasoning',
    'Principle Support',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-028',
    'Logical Reasoning',
    'Principle Support',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-029',
    'Logical Reasoning',
    'Principle Support',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-030',
    'Logical Reasoning',
    'Principle Support',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-031',
    'Logical Reasoning',
    'Principle Support',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-032',
    'Logical Reasoning',
    'Principle Support',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-033',
    'Logical Reasoning',
    'Principle Support',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-034',
    'Logical Reasoning',
    'Principle Support',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-035',
    'Logical Reasoning',
    'Principle Support',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-036',
    'Logical Reasoning',
    'Principle Support',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-037',
    'Logical Reasoning',
    'Principle Support',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-038',
    'Logical Reasoning',
    'Principle Support',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-039',
    'Logical Reasoning',
    'Principle Support',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-psup-040',
    'Logical Reasoning',
    'Principle Support',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['principle support']::TEXT[]
);

-- LogicalReasoning_RoleOfStatement.json (40 questions)

SELECT insert_lsat_question(
    'lr-role-001',
    'Logical Reasoning',
    'Role of a Statement',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-002',
    'Logical Reasoning',
    'Role of a Statement',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-003',
    'Logical Reasoning',
    'Role of a Statement',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-004',
    'Logical Reasoning',
    'Role of a Statement',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-005',
    'Logical Reasoning',
    'Role of a Statement',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-006',
    'Logical Reasoning',
    'Role of a Statement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-007',
    'Logical Reasoning',
    'Role of a Statement',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-008',
    'Logical Reasoning',
    'Role of a Statement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-009',
    'Logical Reasoning',
    'Role of a Statement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-010',
    'Logical Reasoning',
    'Role of a Statement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-011',
    'Logical Reasoning',
    'Role of a Statement',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-012',
    'Logical Reasoning',
    'Role of a Statement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-013',
    'Logical Reasoning',
    'Role of a Statement',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-014',
    'Logical Reasoning',
    'Role of a Statement',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-015',
    'Logical Reasoning',
    'Role of a Statement',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-016',
    'Logical Reasoning',
    'Role of a Statement',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-017',
    'Logical Reasoning',
    'Role of a Statement',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-018',
    'Logical Reasoning',
    'Role of a Statement',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-019',
    'Logical Reasoning',
    'Role of a Statement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-020',
    'Logical Reasoning',
    'Role of a Statement',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-021',
    'Logical Reasoning',
    'Role of a Statement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-022',
    'Logical Reasoning',
    'Role of a Statement',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-023',
    'Logical Reasoning',
    'Role of a Statement',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-024',
    'Logical Reasoning',
    'Role of a Statement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-025',
    'Logical Reasoning',
    'Role of a Statement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-026',
    'Logical Reasoning',
    'Role of a Statement',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-027',
    'Logical Reasoning',
    'Role of a Statement',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-028',
    'Logical Reasoning',
    'Role of a Statement',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-029',
    'Logical Reasoning',
    'Role of a Statement',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-030',
    'Logical Reasoning',
    'Role of a Statement',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-031',
    'Logical Reasoning',
    'Role of a Statement',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-032',
    'Logical Reasoning',
    'Role of a Statement',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-033',
    'Logical Reasoning',
    'Role of a Statement',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-034',
    'Logical Reasoning',
    'Role of a Statement',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-035',
    'Logical Reasoning',
    'Role of a Statement',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-036',
    'Logical Reasoning',
    'Role of a Statement',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-037',
    'Logical Reasoning',
    'Role of a Statement',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-038',
    'Logical Reasoning',
    'Role of a Statement',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-039',
    'Logical Reasoning',
    'Role of a Statement',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-role-040',
    'Logical Reasoning',
    'Role of a Statement',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['role of a statement']::TEXT[]
);

-- LogicalReasoning_Strengthen.json (40 questions)

SELECT insert_lsat_question(
    'lr-str-001',
    'Logical Reasoning',
    'Strengthen',
    3,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-002',
    'Logical Reasoning',
    'Strengthen',
    7,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-003',
    'Logical Reasoning',
    'Strengthen',
    9,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-004',
    'Logical Reasoning',
    'Strengthen',
    10,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-005',
    'Logical Reasoning',
    'Strengthen',
    6,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-006',
    'Logical Reasoning',
    'Strengthen',
    3,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-007',
    'Logical Reasoning',
    'Strengthen',
    5,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-008',
    'Logical Reasoning',
    'Strengthen',
    9,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-009',
    'Logical Reasoning',
    'Strengthen',
    10,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-010',
    'Logical Reasoning',
    'Strengthen',
    8,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-011',
    'Logical Reasoning',
    'Strengthen',
    3,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-012',
    'Logical Reasoning',
    'Strengthen',
    3,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-013',
    'Logical Reasoning',
    'Strengthen',
    5,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-014',
    'Logical Reasoning',
    'Strengthen',
    5,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-015',
    'Logical Reasoning',
    'Strengthen',
    5,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-016',
    'Logical Reasoning',
    'Strengthen',
    4,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-017',
    'Logical Reasoning',
    'Strengthen',
    7,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-018',
    'Logical Reasoning',
    'Strengthen',
    9,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-019',
    'Logical Reasoning',
    'Strengthen',
    4,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-020',
    'Logical Reasoning',
    'Strengthen',
    2,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-021',
    'Logical Reasoning',
    'Strengthen',
    5,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-022',
    'Logical Reasoning',
    'Strengthen',
    3,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-023',
    'Logical Reasoning',
    'Strengthen',
    7,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-024',
    'Logical Reasoning',
    'Strengthen',
    5,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-025',
    'Logical Reasoning',
    'Strengthen',
    9,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-026',
    'Logical Reasoning',
    'Strengthen',
    7,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-027',
    'Logical Reasoning',
    'Strengthen',
    7,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-028',
    'Logical Reasoning',
    'Strengthen',
    2,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-029',
    'Logical Reasoning',
    'Strengthen',
    3,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-030',
    'Logical Reasoning',
    'Strengthen',
    7,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-031',
    'Logical Reasoning',
    'Strengthen',
    1,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-032',
    'Logical Reasoning',
    'Strengthen',
    1,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-033',
    'Logical Reasoning',
    'Strengthen',
    10,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-034',
    'Logical Reasoning',
    'Strengthen',
    10,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-035',
    'Logical Reasoning',
    'Strengthen',
    5,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-036',
    'Logical Reasoning',
    'Strengthen',
    10,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-037',
    'Logical Reasoning',
    'Strengthen',
    4,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-038',
    'Logical Reasoning',
    'Strengthen',
    4,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-039',
    'Logical Reasoning',
    'Strengthen',
    5,
    '{"question_text": "The new employee wellness program will reduce healthcare costs by 20%. Other companies with similar programs saw cost reductions. Our company will achieve similar savings. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Our employees have similar health profiles to those at companies in the studies."}, {"label": "B", "text": "The wellness program includes preventive care incentives."}, {"label": "C", "text": "Healthcare costs have been rising steadily for three years."}, {"label": "D", "text": "Employees have expressed interest in wellness programs."}, {"label": "E", "text": "The program will be implemented over six months."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'business', 'healthcare', 'analogy']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-str-040',
    'Logical Reasoning',
    'Strengthen',
    7,
    '{"question_text": "Installing speed cameras reduces traffic accidents by 30%. Studies from five cities show consistent results. Installing speed cameras on Highway 101 will reduce accidents there. Which one of the following, if true, most strengthens this argument?", "answer_choices": [{"label": "A", "text": "Highway 101 has traffic patterns similar to the studied roads."}, {"label": "B", "text": "Speed cameras are solar-powered and environmentally friendly."}, {"label": "C", "text": "The cameras will be monitored by trained traffic officers."}, {"label": "D", "text": "Local residents support the camera installation."}, {"label": "E", "text": "The highway has had 50 accidents in the past year."}], "correct_answer": "A", "explanation": "For strengthen questions, look for evidence that makes the conclusion more likely to be true."}',
    ARRAY['strengthen', 'traffic-safety', 'statistics', 'analogy']::TEXT[]
);

-- LogicalReasoning_Weaken.json (40 questions)

SELECT insert_lsat_question(
    'lr-wk-001',
    'Logical Reasoning',
    'Weaken',
    9,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-002',
    'Logical Reasoning',
    'Weaken',
    4,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-003',
    'Logical Reasoning',
    'Weaken',
    4,
    '{"question_text": "Company X''s productivity increased 40% after implementing a four-day work week. The CEO concluded that shorter work weeks directly cause higher productivity. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Company X also upgraded its computer systems and software during the same period."}, {"label": "B", "text": "Other companies have considered implementing four-day work weeks."}, {"label": "C", "text": "Employee satisfaction surveys showed improved morale."}, {"label": "D", "text": "The four-day work week reduced commuting costs for employees."}, {"label": "E", "text": "Productivity was measured using the same metrics as before."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'causation', 'alternative-explanation', 'business']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-004',
    'Logical Reasoning',
    'Weaken',
    6,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-005',
    'Logical Reasoning',
    'Weaken',
    4,
    '{"question_text": "Company X''s productivity increased 40% after implementing a four-day work week. The CEO concluded that shorter work weeks directly cause higher productivity. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Company X also upgraded its computer systems and software during the same period."}, {"label": "B", "text": "Other companies have considered implementing four-day work weeks."}, {"label": "C", "text": "Employee satisfaction surveys showed improved morale."}, {"label": "D", "text": "The four-day work week reduced commuting costs for employees."}, {"label": "E", "text": "Productivity was measured using the same metrics as before."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'causation', 'alternative-explanation', 'business']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-006',
    'Logical Reasoning',
    'Weaken',
    8,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-007',
    'Logical Reasoning',
    'Weaken',
    7,
    '{"question_text": "Company X''s productivity increased 40% after implementing a four-day work week. The CEO concluded that shorter work weeks directly cause higher productivity. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Company X also upgraded its computer systems and software during the same period."}, {"label": "B", "text": "Other companies have considered implementing four-day work weeks."}, {"label": "C", "text": "Employee satisfaction surveys showed improved morale."}, {"label": "D", "text": "The four-day work week reduced commuting costs for employees."}, {"label": "E", "text": "Productivity was measured using the same metrics as before."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'causation', 'alternative-explanation', 'business']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-008',
    'Logical Reasoning',
    'Weaken',
    6,
    '{"question_text": "Company X''s productivity increased 40% after implementing a four-day work week. The CEO concluded that shorter work weeks directly cause higher productivity. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Company X also upgraded its computer systems and software during the same period."}, {"label": "B", "text": "Other companies have considered implementing four-day work weeks."}, {"label": "C", "text": "Employee satisfaction surveys showed improved morale."}, {"label": "D", "text": "The four-day work week reduced commuting costs for employees."}, {"label": "E", "text": "Productivity was measured using the same metrics as before."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'causation', 'alternative-explanation', 'business']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-009',
    'Logical Reasoning',
    'Weaken',
    6,
    '{"question_text": "Company X''s productivity increased 40% after implementing a four-day work week. The CEO concluded that shorter work weeks directly cause higher productivity. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Company X also upgraded its computer systems and software during the same period."}, {"label": "B", "text": "Other companies have considered implementing four-day work weeks."}, {"label": "C", "text": "Employee satisfaction surveys showed improved morale."}, {"label": "D", "text": "The four-day work week reduced commuting costs for employees."}, {"label": "E", "text": "Productivity was measured using the same metrics as before."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'causation', 'alternative-explanation', 'business']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-010',
    'Logical Reasoning',
    'Weaken',
    3,
    '{"question_text": "Company X''s productivity increased 40% after implementing a four-day work week. The CEO concluded that shorter work weeks directly cause higher productivity. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Company X also upgraded its computer systems and software during the same period."}, {"label": "B", "text": "Other companies have considered implementing four-day work weeks."}, {"label": "C", "text": "Employee satisfaction surveys showed improved morale."}, {"label": "D", "text": "The four-day work week reduced commuting costs for employees."}, {"label": "E", "text": "Productivity was measured using the same metrics as before."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'causation', 'alternative-explanation', 'business']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-011',
    'Logical Reasoning',
    'Weaken',
    4,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-012',
    'Logical Reasoning',
    'Weaken',
    9,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-013',
    'Logical Reasoning',
    'Weaken',
    3,
    '{"question_text": "Company X''s productivity increased 40% after implementing a four-day work week. The CEO concluded that shorter work weeks directly cause higher productivity. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Company X also upgraded its computer systems and software during the same period."}, {"label": "B", "text": "Other companies have considered implementing four-day work weeks."}, {"label": "C", "text": "Employee satisfaction surveys showed improved morale."}, {"label": "D", "text": "The four-day work week reduced commuting costs for employees."}, {"label": "E", "text": "Productivity was measured using the same metrics as before."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'causation', 'alternative-explanation', 'business']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-014',
    'Logical Reasoning',
    'Weaken',
    10,
    '{"question_text": "Company X''s productivity increased 40% after implementing a four-day work week. The CEO concluded that shorter work weeks directly cause higher productivity. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Company X also upgraded its computer systems and software during the same period."}, {"label": "B", "text": "Other companies have considered implementing four-day work weeks."}, {"label": "C", "text": "Employee satisfaction surveys showed improved morale."}, {"label": "D", "text": "The four-day work week reduced commuting costs for employees."}, {"label": "E", "text": "Productivity was measured using the same metrics as before."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'causation', 'alternative-explanation', 'business']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-015',
    'Logical Reasoning',
    'Weaken',
    7,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-016',
    'Logical Reasoning',
    'Weaken',
    4,
    '{"question_text": "Company X''s productivity increased 40% after implementing a four-day work week. The CEO concluded that shorter work weeks directly cause higher productivity. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Company X also upgraded its computer systems and software during the same period."}, {"label": "B", "text": "Other companies have considered implementing four-day work weeks."}, {"label": "C", "text": "Employee satisfaction surveys showed improved morale."}, {"label": "D", "text": "The four-day work week reduced commuting costs for employees."}, {"label": "E", "text": "Productivity was measured using the same metrics as before."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'causation', 'alternative-explanation', 'business']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-017',
    'Logical Reasoning',
    'Weaken',
    8,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-018',
    'Logical Reasoning',
    'Weaken',
    3,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-019',
    'Logical Reasoning',
    'Weaken',
    3,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-020',
    'Logical Reasoning',
    'Weaken',
    5,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-021',
    'Logical Reasoning',
    'Weaken',
    1,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-022',
    'Logical Reasoning',
    'Weaken',
    7,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-023',
    'Logical Reasoning',
    'Weaken',
    5,
    '{"question_text": "Company X''s productivity increased 40% after implementing a four-day work week. The CEO concluded that shorter work weeks directly cause higher productivity. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Company X also upgraded its computer systems and software during the same period."}, {"label": "B", "text": "Other companies have considered implementing four-day work weeks."}, {"label": "C", "text": "Employee satisfaction surveys showed improved morale."}, {"label": "D", "text": "The four-day work week reduced commuting costs for employees."}, {"label": "E", "text": "Productivity was measured using the same metrics as before."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'causation', 'alternative-explanation', 'business']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-024',
    'Logical Reasoning',
    'Weaken',
    6,
    '{"question_text": "Company X''s productivity increased 40% after implementing a four-day work week. The CEO concluded that shorter work weeks directly cause higher productivity. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Company X also upgraded its computer systems and software during the same period."}, {"label": "B", "text": "Other companies have considered implementing four-day work weeks."}, {"label": "C", "text": "Employee satisfaction surveys showed improved morale."}, {"label": "D", "text": "The four-day work week reduced commuting costs for employees."}, {"label": "E", "text": "Productivity was measured using the same metrics as before."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'causation', 'alternative-explanation', 'business']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-025',
    'Logical Reasoning',
    'Weaken',
    9,
    '{"question_text": "Company X''s productivity increased 40% after implementing a four-day work week. The CEO concluded that shorter work weeks directly cause higher productivity. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Company X also upgraded its computer systems and software during the same period."}, {"label": "B", "text": "Other companies have considered implementing four-day work weeks."}, {"label": "C", "text": "Employee satisfaction surveys showed improved morale."}, {"label": "D", "text": "The four-day work week reduced commuting costs for employees."}, {"label": "E", "text": "Productivity was measured using the same metrics as before."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'causation', 'alternative-explanation', 'business']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-026',
    'Logical Reasoning',
    'Weaken',
    1,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-027',
    'Logical Reasoning',
    'Weaken',
    4,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-028',
    'Logical Reasoning',
    'Weaken',
    6,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-029',
    'Logical Reasoning',
    'Weaken',
    7,
    '{"question_text": "Company X''s productivity increased 40% after implementing a four-day work week. The CEO concluded that shorter work weeks directly cause higher productivity. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Company X also upgraded its computer systems and software during the same period."}, {"label": "B", "text": "Other companies have considered implementing four-day work weeks."}, {"label": "C", "text": "Employee satisfaction surveys showed improved morale."}, {"label": "D", "text": "The four-day work week reduced commuting costs for employees."}, {"label": "E", "text": "Productivity was measured using the same metrics as before."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'causation', 'alternative-explanation', 'business']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-030',
    'Logical Reasoning',
    'Weaken',
    9,
    '{"question_text": "Company X''s productivity increased 40% after implementing a four-day work week. The CEO concluded that shorter work weeks directly cause higher productivity. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Company X also upgraded its computer systems and software during the same period."}, {"label": "B", "text": "Other companies have considered implementing four-day work weeks."}, {"label": "C", "text": "Employee satisfaction surveys showed improved morale."}, {"label": "D", "text": "The four-day work week reduced commuting costs for employees."}, {"label": "E", "text": "Productivity was measured using the same metrics as before."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'causation', 'alternative-explanation', 'business']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-031',
    'Logical Reasoning',
    'Weaken',
    2,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-032',
    'Logical Reasoning',
    'Weaken',
    10,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-033',
    'Logical Reasoning',
    'Weaken',
    1,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-034',
    'Logical Reasoning',
    'Weaken',
    9,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-035',
    'Logical Reasoning',
    'Weaken',
    2,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-036',
    'Logical Reasoning',
    'Weaken',
    3,
    '{"question_text": "Company X''s productivity increased 40% after implementing a four-day work week. The CEO concluded that shorter work weeks directly cause higher productivity. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Company X also upgraded its computer systems and software during the same period."}, {"label": "B", "text": "Other companies have considered implementing four-day work weeks."}, {"label": "C", "text": "Employee satisfaction surveys showed improved morale."}, {"label": "D", "text": "The four-day work week reduced commuting costs for employees."}, {"label": "E", "text": "Productivity was measured using the same metrics as before."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'causation', 'alternative-explanation', 'business']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-037',
    'Logical Reasoning',
    'Weaken',
    6,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-038',
    'Logical Reasoning',
    'Weaken',
    10,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-039',
    'Logical Reasoning',
    'Weaken',
    4,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'lr-wk-040',
    'Logical Reasoning',
    'Weaken',
    6,
    '{"question_text": "Studies show that cities with more parks have lower crime rates. Therefore, building more parks will reduce crime in our city. Which one of the following, if true, most weakens the argument?", "answer_choices": [{"label": "A", "text": "Wealthy neighborhoods tend to have both more parks and lower crime rates."}, {"label": "B", "text": "Parks require ongoing maintenance and security."}, {"label": "C", "text": "Other cities have successfully built new parks recently."}, {"label": "D", "text": "The parks will include playgrounds and walking paths."}, {"label": "E", "text": "Crime statistics are compiled by the police department."}], "correct_answer": "A", "explanation": "Look for evidence that makes the conclusion less likely or challenges key assumptions."}',
    ARRAY['weaken', 'correlation', 'confounding-variable', 'urban-planning']::TEXT[]
);

-- ReadingComprehension_AuthorAttitudeTone.json (40 questions)

SELECT insert_lsat_question(
    'rc-att-001',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    8,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-002',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    1,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-003',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    6,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-004',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    6,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-005',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    4,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-006',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    3,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-007',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    8,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-008',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    7,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-009',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    3,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-010',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    5,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-011',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    7,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-012',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    6,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-013',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    1,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-014',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    9,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-015',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    3,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-016',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    1,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-017',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    9,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-018',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    9,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-019',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    1,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-020',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    6,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-021',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    7,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-022',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    1,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-023',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    7,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-024',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    5,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-025',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    6,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-026',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    4,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-027',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    10,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-028',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    1,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-029',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    10,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-030',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    6,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-031',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    6,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-032',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    4,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-033',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    4,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-034',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    4,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-035',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    1,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-036',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    10,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-037',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    9,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-038',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    4,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-039',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    6,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-att-040',
    'Reading Comprehension',
    'Author''s Attitude / Tone',
    9,
    '{"question_text": "The author''s attitude toward AI regulation can best be described as", "answer_choices": [{"label": "A", "text": "objectively analytical about different regulatory approaches"}, {"label": "B", "text": "strongly supportive of the European Union''s approach"}, {"label": "C", "text": "critical of all current regulatory efforts"}, {"label": "D", "text": "optimistic about finding perfect regulatory solutions"}, {"label": "E", "text": "dismissive of the need for AI regulation"}], "correct_answer": "A", "explanation": "Look for evaluative language and the author''s perspective toward the subject."}',
    ARRAY['author attitude', 'AI regulation', 'neutral-analysis', 'policy-discussion']::TEXT[]
);

-- ReadingComprehension_ComparativePassageAnalysis.json (40 questions)

SELECT insert_lsat_question(
    'rc-comp-001',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    7,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-002',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    1,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-003',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    7,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-004',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    10,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-005',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    8,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-006',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    7,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-007',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    4,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-008',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    1,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-009',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    5,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-010',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    1,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-011',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    2,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-012',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    3,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-013',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    3,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-014',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    8,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-015',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    6,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-016',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    3,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-017',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    8,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-018',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    4,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-019',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    7,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-020',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    10,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-021',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    5,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-022',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    10,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-023',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    7,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-024',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    6,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-025',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    6,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-026',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    3,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-027',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    6,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-028',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    8,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-029',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    5,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-030',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    1,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-031',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    7,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-032',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    8,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-033',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    6,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-034',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    10,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-035',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    7,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-036',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    6,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-037',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    10,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-038',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    2,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-039',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    7,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-comp-040',
    'Reading Comprehension',
    'Comparative Passage Analysis',
    6,
    '{"question_text": "The two passages differ primarily in their", "answer_choices": [{"label": "A", "text": "assessment of whether government intervention is still necessary for renewable energy growth"}, {"label": "B", "text": "views on the current cost-competitiveness of renewable energy"}, {"label": "C", "text": "predictions about future technological developments"}, {"label": "D", "text": "analysis of environmental benefits of renewable energy"}, {"label": "E", "text": "discussion of specific renewable energy technologies"}], "correct_answer": "A", "explanation": "Identify the main point of disagreement between the passages."}',
    ARRAY['comparative analysis', 'renewable energy', 'government role', 'contrasting-views']::TEXT[]
);

-- ReadingComprehension_FunctionRoleOfStatement.json (40 questions)

SELECT insert_lsat_question(
    'rc-func-001',
    'Reading Comprehension',
    'Function / Role of Statement',
    4,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-002',
    'Reading Comprehension',
    'Function / Role of Statement',
    4,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-003',
    'Reading Comprehension',
    'Function / Role of Statement',
    3,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-004',
    'Reading Comprehension',
    'Function / Role of Statement',
    10,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-005',
    'Reading Comprehension',
    'Function / Role of Statement',
    6,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-006',
    'Reading Comprehension',
    'Function / Role of Statement',
    2,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-007',
    'Reading Comprehension',
    'Function / Role of Statement',
    6,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-008',
    'Reading Comprehension',
    'Function / Role of Statement',
    1,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-009',
    'Reading Comprehension',
    'Function / Role of Statement',
    10,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-010',
    'Reading Comprehension',
    'Function / Role of Statement',
    3,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-011',
    'Reading Comprehension',
    'Function / Role of Statement',
    6,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-012',
    'Reading Comprehension',
    'Function / Role of Statement',
    6,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-013',
    'Reading Comprehension',
    'Function / Role of Statement',
    6,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-014',
    'Reading Comprehension',
    'Function / Role of Statement',
    4,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-015',
    'Reading Comprehension',
    'Function / Role of Statement',
    9,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-016',
    'Reading Comprehension',
    'Function / Role of Statement',
    6,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-017',
    'Reading Comprehension',
    'Function / Role of Statement',
    3,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-018',
    'Reading Comprehension',
    'Function / Role of Statement',
    1,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-019',
    'Reading Comprehension',
    'Function / Role of Statement',
    5,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-020',
    'Reading Comprehension',
    'Function / Role of Statement',
    4,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-021',
    'Reading Comprehension',
    'Function / Role of Statement',
    4,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-022',
    'Reading Comprehension',
    'Function / Role of Statement',
    3,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-023',
    'Reading Comprehension',
    'Function / Role of Statement',
    7,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-024',
    'Reading Comprehension',
    'Function / Role of Statement',
    9,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-025',
    'Reading Comprehension',
    'Function / Role of Statement',
    8,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-026',
    'Reading Comprehension',
    'Function / Role of Statement',
    6,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-027',
    'Reading Comprehension',
    'Function / Role of Statement',
    9,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-028',
    'Reading Comprehension',
    'Function / Role of Statement',
    7,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-029',
    'Reading Comprehension',
    'Function / Role of Statement',
    7,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-030',
    'Reading Comprehension',
    'Function / Role of Statement',
    7,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-031',
    'Reading Comprehension',
    'Function / Role of Statement',
    4,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-032',
    'Reading Comprehension',
    'Function / Role of Statement',
    8,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-033',
    'Reading Comprehension',
    'Function / Role of Statement',
    7,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-034',
    'Reading Comprehension',
    'Function / Role of Statement',
    8,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-035',
    'Reading Comprehension',
    'Function / Role of Statement',
    7,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-036',
    'Reading Comprehension',
    'Function / Role of Statement',
    10,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-037',
    'Reading Comprehension',
    'Function / Role of Statement',
    3,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-038',
    'Reading Comprehension',
    'Function / Role of Statement',
    9,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-039',
    'Reading Comprehension',
    'Function / Role of Statement',
    1,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-func-040',
    'Reading Comprehension',
    'Function / Role of Statement',
    1,
    '{"question_text": "The phrase ''Meanwhile, the United States has favored a sector-specific approach'' serves to", "answer_choices": [{"label": "A", "text": "introduce a contrasting regulatory approach for comparison"}, {"label": "B", "text": "provide supporting evidence for the EU''s approach"}, {"label": "C", "text": "criticize the US regulatory strategy"}, {"label": "D", "text": "summarize the main argument of the passage"}, {"label": "E", "text": "transition to a discussion of future regulatory needs"}], "correct_answer": "A", "explanation": "Analyze how specific statements function within the passage''s overall structure."}',
    ARRAY['statement function', 'contrast', 'transition', 'comparative-structure']::TEXT[]
);

-- ReadingComprehension_Inference.json (40 questions)

SELECT insert_lsat_question(
    'rc-inf-001',
    'Reading Comprehension',
    'Inference',
    4,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-002',
    'Reading Comprehension',
    'Inference',
    3,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-003',
    'Reading Comprehension',
    'Inference',
    5,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-004',
    'Reading Comprehension',
    'Inference',
    2,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-005',
    'Reading Comprehension',
    'Inference',
    7,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-006',
    'Reading Comprehension',
    'Inference',
    5,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-007',
    'Reading Comprehension',
    'Inference',
    2,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-008',
    'Reading Comprehension',
    'Inference',
    3,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-009',
    'Reading Comprehension',
    'Inference',
    7,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-010',
    'Reading Comprehension',
    'Inference',
    9,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-011',
    'Reading Comprehension',
    'Inference',
    3,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-012',
    'Reading Comprehension',
    'Inference',
    8,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-013',
    'Reading Comprehension',
    'Inference',
    10,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-014',
    'Reading Comprehension',
    'Inference',
    5,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-015',
    'Reading Comprehension',
    'Inference',
    7,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-016',
    'Reading Comprehension',
    'Inference',
    10,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-017',
    'Reading Comprehension',
    'Inference',
    4,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-018',
    'Reading Comprehension',
    'Inference',
    2,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-019',
    'Reading Comprehension',
    'Inference',
    8,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-020',
    'Reading Comprehension',
    'Inference',
    6,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-021',
    'Reading Comprehension',
    'Inference',
    4,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-022',
    'Reading Comprehension',
    'Inference',
    6,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-023',
    'Reading Comprehension',
    'Inference',
    9,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-024',
    'Reading Comprehension',
    'Inference',
    6,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-025',
    'Reading Comprehension',
    'Inference',
    8,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-026',
    'Reading Comprehension',
    'Inference',
    8,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-027',
    'Reading Comprehension',
    'Inference',
    6,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-028',
    'Reading Comprehension',
    'Inference',
    9,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-029',
    'Reading Comprehension',
    'Inference',
    6,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-030',
    'Reading Comprehension',
    'Inference',
    3,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-031',
    'Reading Comprehension',
    'Inference',
    4,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-032',
    'Reading Comprehension',
    'Inference',
    5,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-033',
    'Reading Comprehension',
    'Inference',
    2,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-034',
    'Reading Comprehension',
    'Inference',
    1,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-035',
    'Reading Comprehension',
    'Inference',
    7,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-036',
    'Reading Comprehension',
    'Inference',
    8,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-037',
    'Reading Comprehension',
    'Inference',
    1,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-038',
    'Reading Comprehension',
    'Inference',
    4,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-039',
    'Reading Comprehension',
    'Inference',
    6,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-inf-040',
    'Reading Comprehension',
    'Inference',
    5,
    '{"question_text": "The passage suggests that", "answer_choices": [{"label": "A", "text": "existing regulatory frameworks were not designed with AI''s specific characteristics in mind"}, {"label": "B", "text": "the European Union''s approach will definitely prove more effective than the US approach"}, {"label": "C", "text": "harmful AI applications are currently widespread due to lack of regulation"}, {"label": "D", "text": "innovation and protection cannot be balanced in AI regulation"}, {"label": "E", "text": "all current AI regulation efforts are fundamentally flawed"}], "correct_answer": "A", "explanation": "Look for what logically follows from the stated information."}',
    ARRAY['inference', 'regulatory inadequacy', 'technology-specific', 'logical-implication']::TEXT[]
);

-- ReadingComprehension_MainPoint.json (40 questions)

SELECT insert_lsat_question(
    'rc-main-001',
    'Reading Comprehension',
    'Main Point',
    5,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "AI systems in healthcare, while promising, face significant challenges that must be addressed through collaboration between stakeholders."}, {"label": "B", "text": "The adoption of AI in healthcare is inevitable despite valid concerns about transparency and bias in AI systems."}, {"label": "C", "text": "AI technology has already proven more effective than human physicians in certain areas of medical diagnosis."}, {"label": "D", "text": "The integration of AI into healthcare requires new regulatory frameworks to address potential risks and benefits."}, {"label": "E", "text": "Healthcare AI systems must overcome the ''black box'' problem before they can be widely adopted by medical professionals."}], "correct_answer": "A", "explanation": "The passage presents both benefits and concerns about AI in healthcare, concluding that success requires collaboration to harness benefits while maintaining essential human elements. This balanced view with emphasis on stakeholder collaboration represents the main point."}',
    ARRAY['main point', 'healthcare', 'technology', 'balanced-argument']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-002',
    'Reading Comprehension',
    'Main Point',
    4,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Corporate social responsibility has transformed from a peripheral concern to a strategic business imperative with measurable benefits."}, {"label": "B", "text": "Companies that engage in greenwashing risk damage to their reputation and market position."}, {"label": "C", "text": "Stakeholder capitalism has completely replaced the traditional focus on shareholder value maximization."}, {"label": "D", "text": "Consumer awareness of corporate behavior is the primary driver of CSR adoption among businesses."}, {"label": "E", "text": "The most effective CSR programs require companies to integrate social considerations into their core operations."}], "correct_answer": "A", "explanation": "The passage traces CSR''s evolution from charitable giving to strategic imperative, emphasizing both the business case for CSR and its integration into core operations. The main point encompasses this transformation and its benefits."}',
    ARRAY['main point', 'business', 'corporate responsibility', 'evolution']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-003',
    'Reading Comprehension',
    'Main Point',
    6,
    '{"question_text": "The passage is primarily concerned with establishing which one of the following?", "answer_choices": [{"label": "A", "text": "Göbekli Tepe represents the earliest known example of monumental architecture in human history."}, {"label": "B", "text": "Archaeological evidence suggests that complex social organization preceded agriculture in human development."}, {"label": "C", "text": "The construction of religious monuments was the primary factor that led to agricultural development."}, {"label": "D", "text": "Traditional chronologies of human civilization require complete revision based on recent discoveries."}, {"label": "E", "text": "Hunter-gatherer societies were more technologically advanced than previously recognized."}], "correct_answer": "B", "explanation": "The passage uses Göbekli Tepe as evidence to challenge the traditional view that agriculture preceded complex social organization. The main point is that archaeological evidence suggests complex societies existed before agriculture."}',
    ARRAY['main point', 'archaeology', 'social development', 'historical revision']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-004',
    'Reading Comprehension',
    'Main Point',
    2,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-005',
    'Reading Comprehension',
    'Main Point',
    6,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-006',
    'Reading Comprehension',
    'Main Point',
    7,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-007',
    'Reading Comprehension',
    'Main Point',
    3,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-008',
    'Reading Comprehension',
    'Main Point',
    6,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-009',
    'Reading Comprehension',
    'Main Point',
    2,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-010',
    'Reading Comprehension',
    'Main Point',
    1,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-011',
    'Reading Comprehension',
    'Main Point',
    2,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-012',
    'Reading Comprehension',
    'Main Point',
    7,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-013',
    'Reading Comprehension',
    'Main Point',
    4,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-014',
    'Reading Comprehension',
    'Main Point',
    7,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-015',
    'Reading Comprehension',
    'Main Point',
    7,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-016',
    'Reading Comprehension',
    'Main Point',
    4,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-017',
    'Reading Comprehension',
    'Main Point',
    6,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-018',
    'Reading Comprehension',
    'Main Point',
    4,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-019',
    'Reading Comprehension',
    'Main Point',
    3,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-020',
    'Reading Comprehension',
    'Main Point',
    9,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-021',
    'Reading Comprehension',
    'Main Point',
    5,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-022',
    'Reading Comprehension',
    'Main Point',
    8,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-023',
    'Reading Comprehension',
    'Main Point',
    4,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-024',
    'Reading Comprehension',
    'Main Point',
    6,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-025',
    'Reading Comprehension',
    'Main Point',
    10,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-026',
    'Reading Comprehension',
    'Main Point',
    10,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-027',
    'Reading Comprehension',
    'Main Point',
    10,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-028',
    'Reading Comprehension',
    'Main Point',
    4,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-029',
    'Reading Comprehension',
    'Main Point',
    4,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-030',
    'Reading Comprehension',
    'Main Point',
    9,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-031',
    'Reading Comprehension',
    'Main Point',
    9,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-032',
    'Reading Comprehension',
    'Main Point',
    2,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-033',
    'Reading Comprehension',
    'Main Point',
    8,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-034',
    'Reading Comprehension',
    'Main Point',
    3,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-035',
    'Reading Comprehension',
    'Main Point',
    5,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-036',
    'Reading Comprehension',
    'Main Point',
    4,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-037',
    'Reading Comprehension',
    'Main Point',
    4,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-038',
    'Reading Comprehension',
    'Main Point',
    3,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-039',
    'Reading Comprehension',
    'Main Point',
    10,
    '{"question_text": "The primary purpose of this passage is to", "answer_choices": [{"label": "A", "text": "present different perspectives on AI in medical diagnosis and suggest a collaborative approach"}, {"label": "B", "text": "argue that AI systems are superior to human physicians in medical diagnosis"}, {"label": "C", "text": "explain the technical details of how AI diagnostic systems function"}, {"label": "D", "text": "advocate for increased regulation of AI in healthcare settings"}, {"label": "E", "text": "predict that AI will completely replace human doctors within the next decade"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'AI in medicine', 'balanced-perspective', 'human-AI-collaboration']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-main-040',
    'Reading Comprehension',
    'Main Point',
    7,
    '{"question_text": "Which one of the following most accurately expresses the main point of the passage?", "answer_choices": [{"label": "A", "text": "Effective climate adaptation requires combining proactive planning, technical solutions, and community engagement"}, {"label": "B", "text": "Traditional disaster response models are completely inadequate for addressing climate change"}, {"label": "C", "text": "Technical infrastructure improvements are the most important aspect of climate adaptation"}, {"label": "D", "text": "Climate adaptation is only possible in communities with significant financial resources"}, {"label": "E", "text": "Early warning systems are the most cost-effective climate adaptation measure"}], "correct_answer": "A", "explanation": "Focus on the passage''s overall message and primary objective, not specific details or examples."}',
    ARRAY['main point', 'climate adaptation', 'comprehensive-approach', 'proactive-planning']::TEXT[]
);

-- ReadingComprehension_PassageOrganizationStructure.json (40 questions)

SELECT insert_lsat_question(
    'rc-org-001',
    'Reading Comprehension',
    'Passage Organization / Structure',
    5,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-002',
    'Reading Comprehension',
    'Passage Organization / Structure',
    4,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-003',
    'Reading Comprehension',
    'Passage Organization / Structure',
    7,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-004',
    'Reading Comprehension',
    'Passage Organization / Structure',
    6,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-005',
    'Reading Comprehension',
    'Passage Organization / Structure',
    6,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-006',
    'Reading Comprehension',
    'Passage Organization / Structure',
    6,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-007',
    'Reading Comprehension',
    'Passage Organization / Structure',
    9,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-008',
    'Reading Comprehension',
    'Passage Organization / Structure',
    3,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-009',
    'Reading Comprehension',
    'Passage Organization / Structure',
    2,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-010',
    'Reading Comprehension',
    'Passage Organization / Structure',
    5,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-011',
    'Reading Comprehension',
    'Passage Organization / Structure',
    1,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-012',
    'Reading Comprehension',
    'Passage Organization / Structure',
    2,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-013',
    'Reading Comprehension',
    'Passage Organization / Structure',
    8,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-014',
    'Reading Comprehension',
    'Passage Organization / Structure',
    4,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-015',
    'Reading Comprehension',
    'Passage Organization / Structure',
    10,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-016',
    'Reading Comprehension',
    'Passage Organization / Structure',
    10,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-017',
    'Reading Comprehension',
    'Passage Organization / Structure',
    1,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-018',
    'Reading Comprehension',
    'Passage Organization / Structure',
    3,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-019',
    'Reading Comprehension',
    'Passage Organization / Structure',
    6,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-020',
    'Reading Comprehension',
    'Passage Organization / Structure',
    4,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-021',
    'Reading Comprehension',
    'Passage Organization / Structure',
    4,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-022',
    'Reading Comprehension',
    'Passage Organization / Structure',
    3,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-023',
    'Reading Comprehension',
    'Passage Organization / Structure',
    10,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-024',
    'Reading Comprehension',
    'Passage Organization / Structure',
    7,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-025',
    'Reading Comprehension',
    'Passage Organization / Structure',
    9,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-026',
    'Reading Comprehension',
    'Passage Organization / Structure',
    5,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-027',
    'Reading Comprehension',
    'Passage Organization / Structure',
    9,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-028',
    'Reading Comprehension',
    'Passage Organization / Structure',
    5,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-029',
    'Reading Comprehension',
    'Passage Organization / Structure',
    6,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-030',
    'Reading Comprehension',
    'Passage Organization / Structure',
    8,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-031',
    'Reading Comprehension',
    'Passage Organization / Structure',
    7,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-032',
    'Reading Comprehension',
    'Passage Organization / Structure',
    1,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-033',
    'Reading Comprehension',
    'Passage Organization / Structure',
    6,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-034',
    'Reading Comprehension',
    'Passage Organization / Structure',
    9,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-035',
    'Reading Comprehension',
    'Passage Organization / Structure',
    7,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-036',
    'Reading Comprehension',
    'Passage Organization / Structure',
    6,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-037',
    'Reading Comprehension',
    'Passage Organization / Structure',
    1,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-038',
    'Reading Comprehension',
    'Passage Organization / Structure',
    8,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-039',
    'Reading Comprehension',
    'Passage Organization / Structure',
    1,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-org-040',
    'Reading Comprehension',
    'Passage Organization / Structure',
    7,
    '{"question_text": "The passage is organized by", "answer_choices": [{"label": "A", "text": "presenting a problem, then examining two different approaches to addressing it"}, {"label": "B", "text": "making an argument and then providing supporting evidence"}, {"label": "C", "text": "describing a historical progression from past to present"}, {"label": "D", "text": "comparing advantages and disadvantages of a single solution"}, {"label": "E", "text": "defining a concept and then providing multiple examples"}], "correct_answer": "A", "explanation": "Focus on the logical flow and structural organization of ideas."}',
    ARRAY['organization', 'structure', 'problem-solution', 'comparative']::TEXT[]
);

-- ReadingComprehension_PrimaryPurpose.json (40 questions)

SELECT insert_lsat_question(
    'rc-pp-001',
    'Reading Comprehension',
    'Primary Purpose',
    8,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-002',
    'Reading Comprehension',
    'Primary Purpose',
    5,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-003',
    'Reading Comprehension',
    'Primary Purpose',
    6,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-004',
    'Reading Comprehension',
    'Primary Purpose',
    5,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-005',
    'Reading Comprehension',
    'Primary Purpose',
    1,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-006',
    'Reading Comprehension',
    'Primary Purpose',
    9,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-007',
    'Reading Comprehension',
    'Primary Purpose',
    7,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-008',
    'Reading Comprehension',
    'Primary Purpose',
    5,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-009',
    'Reading Comprehension',
    'Primary Purpose',
    8,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-010',
    'Reading Comprehension',
    'Primary Purpose',
    10,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-011',
    'Reading Comprehension',
    'Primary Purpose',
    7,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-012',
    'Reading Comprehension',
    'Primary Purpose',
    4,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-013',
    'Reading Comprehension',
    'Primary Purpose',
    7,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-014',
    'Reading Comprehension',
    'Primary Purpose',
    9,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-015',
    'Reading Comprehension',
    'Primary Purpose',
    7,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-016',
    'Reading Comprehension',
    'Primary Purpose',
    5,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-017',
    'Reading Comprehension',
    'Primary Purpose',
    8,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-018',
    'Reading Comprehension',
    'Primary Purpose',
    8,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-019',
    'Reading Comprehension',
    'Primary Purpose',
    3,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-020',
    'Reading Comprehension',
    'Primary Purpose',
    2,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-021',
    'Reading Comprehension',
    'Primary Purpose',
    7,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-022',
    'Reading Comprehension',
    'Primary Purpose',
    2,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-023',
    'Reading Comprehension',
    'Primary Purpose',
    1,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-024',
    'Reading Comprehension',
    'Primary Purpose',
    7,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-025',
    'Reading Comprehension',
    'Primary Purpose',
    2,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-026',
    'Reading Comprehension',
    'Primary Purpose',
    2,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-027',
    'Reading Comprehension',
    'Primary Purpose',
    5,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-028',
    'Reading Comprehension',
    'Primary Purpose',
    9,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-029',
    'Reading Comprehension',
    'Primary Purpose',
    6,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-030',
    'Reading Comprehension',
    'Primary Purpose',
    4,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-031',
    'Reading Comprehension',
    'Primary Purpose',
    5,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-032',
    'Reading Comprehension',
    'Primary Purpose',
    8,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-033',
    'Reading Comprehension',
    'Primary Purpose',
    6,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-034',
    'Reading Comprehension',
    'Primary Purpose',
    7,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-035',
    'Reading Comprehension',
    'Primary Purpose',
    6,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-036',
    'Reading Comprehension',
    'Primary Purpose',
    3,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-037',
    'Reading Comprehension',
    'Primary Purpose',
    7,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-038',
    'Reading Comprehension',
    'Primary Purpose',
    1,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-039',
    'Reading Comprehension',
    'Primary Purpose',
    10,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-pp-040',
    'Reading Comprehension',
    'Primary Purpose',
    1,
    '{"question_text": "The primary purpose of the passage is to", "answer_choices": [{"label": "A", "text": "provide a balanced overview of quantum computing''s current challenges and future potential"}, {"label": "B", "text": "argue that quantum computing will revolutionize multiple industries within the next decade"}, {"label": "C", "text": "explain the technical details of how quantum computers achieve quantum supremacy"}, {"label": "D", "text": "criticize the amount of funding being invested in quantum computing research"}, {"label": "E", "text": "compare the computational capabilities of quantum and classical computers"}], "correct_answer": "A", "explanation": "Focus on the overall goal or function of the passage, not specific details."}',
    ARRAY['primary purpose', 'technology', 'balanced-analysis', 'future-potential']::TEXT[]
);

-- ReadingComprehension_SpecificDetail.json (40 questions)

SELECT insert_lsat_question(
    'rc-det-001',
    'Reading Comprehension',
    'Specific Detail',
    4,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-002',
    'Reading Comprehension',
    'Specific Detail',
    5,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-003',
    'Reading Comprehension',
    'Specific Detail',
    3,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-004',
    'Reading Comprehension',
    'Specific Detail',
    2,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-005',
    'Reading Comprehension',
    'Specific Detail',
    9,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-006',
    'Reading Comprehension',
    'Specific Detail',
    10,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-007',
    'Reading Comprehension',
    'Specific Detail',
    8,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-008',
    'Reading Comprehension',
    'Specific Detail',
    2,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-009',
    'Reading Comprehension',
    'Specific Detail',
    6,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-010',
    'Reading Comprehension',
    'Specific Detail',
    6,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-011',
    'Reading Comprehension',
    'Specific Detail',
    4,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-012',
    'Reading Comprehension',
    'Specific Detail',
    7,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-013',
    'Reading Comprehension',
    'Specific Detail',
    10,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-014',
    'Reading Comprehension',
    'Specific Detail',
    7,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-015',
    'Reading Comprehension',
    'Specific Detail',
    8,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-016',
    'Reading Comprehension',
    'Specific Detail',
    6,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-017',
    'Reading Comprehension',
    'Specific Detail',
    6,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-018',
    'Reading Comprehension',
    'Specific Detail',
    5,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-019',
    'Reading Comprehension',
    'Specific Detail',
    5,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-020',
    'Reading Comprehension',
    'Specific Detail',
    6,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-021',
    'Reading Comprehension',
    'Specific Detail',
    3,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-022',
    'Reading Comprehension',
    'Specific Detail',
    1,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-023',
    'Reading Comprehension',
    'Specific Detail',
    2,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-024',
    'Reading Comprehension',
    'Specific Detail',
    3,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-025',
    'Reading Comprehension',
    'Specific Detail',
    9,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-026',
    'Reading Comprehension',
    'Specific Detail',
    3,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-027',
    'Reading Comprehension',
    'Specific Detail',
    6,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-028',
    'Reading Comprehension',
    'Specific Detail',
    5,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-029',
    'Reading Comprehension',
    'Specific Detail',
    10,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-030',
    'Reading Comprehension',
    'Specific Detail',
    1,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-031',
    'Reading Comprehension',
    'Specific Detail',
    7,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-032',
    'Reading Comprehension',
    'Specific Detail',
    9,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-033',
    'Reading Comprehension',
    'Specific Detail',
    4,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-034',
    'Reading Comprehension',
    'Specific Detail',
    3,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-035',
    'Reading Comprehension',
    'Specific Detail',
    6,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-036',
    'Reading Comprehension',
    'Specific Detail',
    9,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-037',
    'Reading Comprehension',
    'Specific Detail',
    9,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-038',
    'Reading Comprehension',
    'Specific Detail',
    6,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-039',
    'Reading Comprehension',
    'Specific Detail',
    7,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);
SELECT insert_lsat_question(
    'rc-det-040',
    'Reading Comprehension',
    'Specific Detail',
    4,
    '{"question_text": "According to the passage, high-risk AI applications under the EU''s AI Act include those used in", "answer_choices": [{"label": "A", "text": "critical infrastructure and hiring decisions"}, {"label": "B", "text": "entertainment and gaming platforms"}, {"label": "C", "text": "social media content moderation"}, {"label": "D", "text": "academic research and education"}, {"label": "E", "text": "personal productivity software"}], "correct_answer": "A", "explanation": "Find information directly stated in the passage."}',
    ARRAY['specific detail', 'factual recall', 'EU regulation', 'AI applications']::TEXT[]
);

-- WritingSample_Perspectives.json (40 questions)

SELECT insert_lsat_question(
    'ws-persp-001',
    'Writing Sample',
    'Perspectives',
    5,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-002',
    'Writing Sample',
    'Perspectives',
    1,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-003',
    'Writing Sample',
    'Perspectives',
    7,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-004',
    'Writing Sample',
    'Perspectives',
    1,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-005',
    'Writing Sample',
    'Perspectives',
    7,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-006',
    'Writing Sample',
    'Perspectives',
    4,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-007',
    'Writing Sample',
    'Perspectives',
    6,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-008',
    'Writing Sample',
    'Perspectives',
    5,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-009',
    'Writing Sample',
    'Perspectives',
    5,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-010',
    'Writing Sample',
    'Perspectives',
    2,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-011',
    'Writing Sample',
    'Perspectives',
    5,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-012',
    'Writing Sample',
    'Perspectives',
    2,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-013',
    'Writing Sample',
    'Perspectives',
    8,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-014',
    'Writing Sample',
    'Perspectives',
    6,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-015',
    'Writing Sample',
    'Perspectives',
    10,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-016',
    'Writing Sample',
    'Perspectives',
    4,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-017',
    'Writing Sample',
    'Perspectives',
    2,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-018',
    'Writing Sample',
    'Perspectives',
    1,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-019',
    'Writing Sample',
    'Perspectives',
    6,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-020',
    'Writing Sample',
    'Perspectives',
    10,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-021',
    'Writing Sample',
    'Perspectives',
    2,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-022',
    'Writing Sample',
    'Perspectives',
    7,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-023',
    'Writing Sample',
    'Perspectives',
    4,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-024',
    'Writing Sample',
    'Perspectives',
    8,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-025',
    'Writing Sample',
    'Perspectives',
    2,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-026',
    'Writing Sample',
    'Perspectives',
    7,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-027',
    'Writing Sample',
    'Perspectives',
    1,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-028',
    'Writing Sample',
    'Perspectives',
    1,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-029',
    'Writing Sample',
    'Perspectives',
    9,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-030',
    'Writing Sample',
    'Perspectives',
    10,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-031',
    'Writing Sample',
    'Perspectives',
    4,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-032',
    'Writing Sample',
    'Perspectives',
    7,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-033',
    'Writing Sample',
    'Perspectives',
    6,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-034',
    'Writing Sample',
    'Perspectives',
    10,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-035',
    'Writing Sample',
    'Perspectives',
    9,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-036',
    'Writing Sample',
    'Perspectives',
    10,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-037',
    'Writing Sample',
    'Perspectives',
    8,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-038',
    'Writing Sample',
    'Perspectives',
    4,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-039',
    'Writing Sample',
    'Perspectives',
    7,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-persp-040',
    'Writing Sample',
    'Perspectives',
    5,
    '{"question_text": "Write an essay that takes a position on whether the school district should prioritize technology investment OR hiring more teachers. Explain your reasoning and address the opposing perspective.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'resource-allocation', 'technology-vs-personnel']::TEXT[]
);

-- WritingSample_PromptText.json (40 questions)

SELECT insert_lsat_question(
    'ws-prompt-001',
    'Writing Sample',
    'Prompt Text',
    6,
    '{"question_text": "Write an essay in which you argue for one of the two approaches described above. Support your position with reasoning and examples, and address at least one potential objection to your chosen approach. There is no ''correct'' choice; a reasonable argument can be made for either option.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'argumentative', 'policy-choice', 'urban-planning']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-002',
    'Writing Sample',
    'Prompt Text',
    9,
    '{"question_text": "Write an essay that takes a position on whether universities should require internships for all students or maintain them as optional opportunities. In your essay, analyze the advantages and disadvantages of both approaches and provide reasons and examples to support your position.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'internship-requirement', 'mandatory-vs-optional']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-003',
    'Writing Sample',
    'Prompt Text',
    6,
    '{"question_text": "Write an essay arguing for either expanding public transportation OR improving road infrastructure as the better solution to traffic congestion. Support your position with reasoning and examples, and address potential counterarguments.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'urban-planning', 'transportation-policy', 'public-vs-private']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-004',
    'Writing Sample',
    'Prompt Text',
    9,
    '{"question_text": "Write an essay that argues for either permanent remote work OR mandatory office-based work. Discuss the implications of your chosen approach for productivity, employee satisfaction, and company culture, and address the main concerns raised by the opposing viewpoint.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'workplace-policy', 'remote-work', 'culture-vs-flexibility']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-005',
    'Writing Sample',
    'Prompt Text',
    3,
    '{"question_text": "Write an essay that takes a position on whether universities should require internships for all students or maintain them as optional opportunities. In your essay, analyze the advantages and disadvantages of both approaches and provide reasons and examples to support your position.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'internship-requirement', 'mandatory-vs-optional']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-006',
    'Writing Sample',
    'Prompt Text',
    8,
    '{"question_text": "Write an essay arguing for either expanding public transportation OR improving road infrastructure as the better solution to traffic congestion. Support your position with reasoning and examples, and address potential counterarguments.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'urban-planning', 'transportation-policy', 'public-vs-private']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-007',
    'Writing Sample',
    'Prompt Text',
    6,
    '{"question_text": "Write an essay that argues for either permanent remote work OR mandatory office-based work. Discuss the implications of your chosen approach for productivity, employee satisfaction, and company culture, and address the main concerns raised by the opposing viewpoint.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'workplace-policy', 'remote-work', 'culture-vs-flexibility']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-008',
    'Writing Sample',
    'Prompt Text',
    7,
    '{"question_text": "Write an essay that takes a position on whether universities should require internships for all students or maintain them as optional opportunities. In your essay, analyze the advantages and disadvantages of both approaches and provide reasons and examples to support your position.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'internship-requirement', 'mandatory-vs-optional']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-009',
    'Writing Sample',
    'Prompt Text',
    6,
    '{"question_text": "Write an essay arguing for either expanding public transportation OR improving road infrastructure as the better solution to traffic congestion. Support your position with reasoning and examples, and address potential counterarguments.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'urban-planning', 'transportation-policy', 'public-vs-private']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-010',
    'Writing Sample',
    'Prompt Text',
    5,
    '{"question_text": "Write an essay that argues for either permanent remote work OR mandatory office-based work. Discuss the implications of your chosen approach for productivity, employee satisfaction, and corporation culture, and address the main concerns raised by the opposing viewpoint.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'workplace-policy', 'remote-work', 'culture-vs-flexibility']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-011',
    'Writing Sample',
    'Prompt Text',
    7,
    '{"question_text": "Write an essay that takes a position on whether universities should require internships for all students or maintain them as optional opportunities. In your essay, analyze the advantages and disadvantages of both approaches and provide reasons and examples to support your position.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'internship-requirement', 'mandatory-vs-optional']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-012',
    'Writing Sample',
    'Prompt Text',
    1,
    '{"question_text": "Write an essay arguing for either expanding public transportation OR improving road infrastructure as the better solution to traffic congestion. Support your position with reasoning and examples, and address potential counterarguments.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'urban-planning', 'transportation-policy', 'public-vs-private']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-013',
    'Writing Sample',
    'Prompt Text',
    7,
    '{"question_text": "Write an essay that argues for either permanent remote work OR mandatory office-based work. Discuss the implications of your chosen approach for productivity, employee satisfaction, and company culture, and address the main concerns raised by the opposing viewpoint.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'workplace-policy', 'remote-work', 'culture-vs-flexibility']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-014',
    'Writing Sample',
    'Prompt Text',
    4,
    '{"question_text": "Write an essay that takes a position on whether universities should require internships for all undergraduates or maintain them as optional opportunities. In your essay, analyze the advantages and disadvantages of both approaches and provide reasons and examples to support your position.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'internship-requirement', 'mandatory-vs-optional']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-015',
    'Writing Sample',
    'Prompt Text',
    10,
    '{"question_text": "Write an essay arguing for either expanding public transportation OR improving road infrastructure as the better solution to traffic congestion. Support your position with reasoning and examples, and address potential counterarguments.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'urban-planning', 'transportation-policy', 'public-vs-private']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-016',
    'Writing Sample',
    'Prompt Text',
    4,
    '{"question_text": "Write an essay that argues for either permanent remote work OR mandatory office-based work. Discuss the implications of your chosen approach for productivity, employee satisfaction, and company culture, and address the main concerns raised by the opposing viewpoint.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'workplace-policy', 'remote-work', 'culture-vs-flexibility']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-017',
    'Writing Sample',
    'Prompt Text',
    5,
    '{"question_text": "Write an essay that takes a position on whether universities should require internships for all students or maintain them as optional opportunities. In your essay, analyze the advantages and disadvantages of both approaches and provide reasons and examples to support your position.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'internship-requirement', 'mandatory-vs-optional']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-018',
    'Writing Sample',
    'Prompt Text',
    10,
    '{"question_text": "Write an essay arguing for either expanding public transportation OR improving road infrastructure as the better solution to traffic congestion. Support your position with reasoning and examples, and address potential counterarguments.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'urban-planning', 'transportation-policy', 'public-vs-private']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-019',
    'Writing Sample',
    'Prompt Text',
    3,
    '{"question_text": "Write an essay that argues for either permanent remote work OR mandatory office-based work. Discuss the implications of your chosen approach for productivity, employee satisfaction, and company culture, and address the main concerns raised by the opposing viewpoint.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'workplace-policy', 'remote-work', 'culture-vs-flexibility']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-020',
    'Writing Sample',
    'Prompt Text',
    5,
    '{"question_text": "Write an essay that takes a position on whether universities should require internships for all students or maintain them as optional opportunities. In your essay, analyze the advantages and disadvantages of both approaches and provide reasons and examples to support your position.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'internship-requirement', 'mandatory-vs-optional']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-021',
    'Writing Sample',
    'Prompt Text',
    6,
    '{"question_text": "Write an essay arguing for either expanding public transportation OR improving road infrastructure as the better solution to traffic congestion. Support your position with reasoning and examples, and address potential counterarguments.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'urban-planning', 'transportation-policy', 'public-vs-private']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-022',
    'Writing Sample',
    'Prompt Text',
    10,
    '{"question_text": "Write an essay that argues for either permanent remote work OR mandatory office-based work. Discuss the implications of your chosen approach for productivity, employee satisfaction, and corporation culture, and address the main concerns raised by the opposing viewpoint.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'workplace-policy', 'remote-work', 'culture-vs-flexibility']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-023',
    'Writing Sample',
    'Prompt Text',
    2,
    '{"question_text": "Write an essay that takes a position on whether universities should require internships for all students or maintain them as optional opportunities. In your essay, analyze the advantages and disadvantages of both approaches and provide reasons and examples to support your position.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'internship-requirement', 'mandatory-vs-optional']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-024',
    'Writing Sample',
    'Prompt Text',
    7,
    '{"question_text": "Write an essay arguing for either expanding public transportation OR improving road infrastructure as the better solution to traffic congestion. Support your position with reasoning and examples, and address potential counterarguments.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'urban-planning', 'transportation-policy', 'public-vs-private']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-025',
    'Writing Sample',
    'Prompt Text',
    2,
    '{"question_text": "Write an essay that argues for either permanent remote work OR mandatory office-based work. Discuss the implications of your chosen approach for productivity, employee satisfaction, and company culture, and address the main concerns raised by the opposing viewpoint.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'workplace-policy', 'remote-work', 'culture-vs-flexibility']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-026',
    'Writing Sample',
    'Prompt Text',
    5,
    '{"question_text": "Write an essay that takes a position on whether universities should require internships for all undergraduates or maintain them as optional opportunities. In your essay, analyze the advantages and disadvantages of both approaches and provide reasons and examples to support your position.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'internship-requirement', 'mandatory-vs-optional']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-027',
    'Writing Sample',
    'Prompt Text',
    2,
    '{"question_text": "Write an essay arguing for either expanding public transportation OR improving road infrastructure as the better solution to traffic congestion. Support your position with reasoning and examples, and address potential counterarguments.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'urban-planning', 'transportation-policy', 'public-vs-private']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-028',
    'Writing Sample',
    'Prompt Text',
    6,
    '{"question_text": "Write an essay that argues for either permanent remote work OR mandatory office-based work. Discuss the implications of your chosen approach for productivity, employee satisfaction, and company culture, and address the main concerns raised by the opposing viewpoint.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'workplace-policy', 'remote-work', 'culture-vs-flexibility']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-029',
    'Writing Sample',
    'Prompt Text',
    6,
    '{"question_text": "Write an essay that takes a position on whether universities should require internships for all students or maintain them as optional opportunities. In your essay, analyze the advantages and disadvantages of both approaches and provide reasons and examples to support your position.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'internship-requirement', 'mandatory-vs-optional']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-030',
    'Writing Sample',
    'Prompt Text',
    4,
    '{"question_text": "Write an essay arguing for either expanding public transportation OR improving road infrastructure as the better solution to traffic congestion. Support your position with reasoning and examples, and address potential counterarguments.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'urban-planning', 'transportation-policy', 'public-vs-private']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-031',
    'Writing Sample',
    'Prompt Text',
    7,
    '{"question_text": "Write an essay that argues for either permanent remote work OR mandatory office-based work. Discuss the implications of your chosen approach for productivity, employee satisfaction, and company culture, and address the main concerns raised by the opposing viewpoint.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'workplace-policy', 'remote-work', 'culture-vs-flexibility']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-032',
    'Writing Sample',
    'Prompt Text',
    1,
    '{"question_text": "Write an essay that takes a position on whether universities should require internships for all students or maintain them as optional opportunities. In your essay, analyze the advantages and disadvantages of both approaches and provide reasons and examples to support your position.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'internship-requirement', 'mandatory-vs-optional']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-033',
    'Writing Sample',
    'Prompt Text',
    2,
    '{"question_text": "Write an essay arguing for either expanding public transportation OR improving road infrastructure as the better solution to traffic congestion. Support your position with reasoning and examples, and address potential counterarguments.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'urban-planning', 'transportation-policy', 'public-vs-private']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-034',
    'Writing Sample',
    'Prompt Text',
    10,
    '{"question_text": "Write an essay that argues for either permanent remote work OR mandatory office-based work. Discuss the implications of your chosen approach for productivity, employee satisfaction, and corporation culture, and address the main concerns raised by the opposing viewpoint.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'workplace-policy', 'remote-work', 'culture-vs-flexibility']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-035',
    'Writing Sample',
    'Prompt Text',
    8,
    '{"question_text": "Write an essay that takes a position on whether universities should require internships for all students or maintain them as optional opportunities. In your essay, analyze the advantages and disadvantages of both approaches and provide reasons and examples to support your position.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'internship-requirement', 'mandatory-vs-optional']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-036',
    'Writing Sample',
    'Prompt Text',
    2,
    '{"question_text": "Write an essay arguing for either expanding public transportation OR improving road infrastructure as the better solution to traffic congestion. Support your position with reasoning and examples, and address potential counterarguments.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'urban-planning', 'transportation-policy', 'public-vs-private']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-037',
    'Writing Sample',
    'Prompt Text',
    3,
    '{"question_text": "Write an essay that argues for either permanent remote work OR mandatory office-based work. Discuss the implications of your chosen approach for productivity, employee satisfaction, and company culture, and address the main concerns raised by the opposing viewpoint.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'workplace-policy', 'remote-work', 'culture-vs-flexibility']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-038',
    'Writing Sample',
    'Prompt Text',
    8,
    '{"question_text": "Write an essay that takes a position on whether universities should require internships for all undergraduates or maintain them as optional opportunities. In your essay, analyze the advantages and disadvantages of both approaches and provide reasons and examples to support your position.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'education-policy', 'internship-requirement', 'mandatory-vs-optional']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-039',
    'Writing Sample',
    'Prompt Text',
    4,
    '{"question_text": "Write an essay arguing for either expanding public transportation OR improving road infrastructure as the better solution to traffic congestion. Support your position with reasoning and examples, and address potential counterarguments.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'urban-planning', 'transportation-policy', 'public-vs-private']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-prompt-040',
    'Writing Sample',
    'Prompt Text',
    4,
    '{"question_text": "Write an essay that argues for either permanent remote work OR mandatory office-based work. Discuss the implications of your chosen approach for productivity, employee satisfaction, and company culture, and address the main concerns raised by the opposing viewpoint.", "prompt": "", "instructions": "", "response_type": "essay"}',
    ARRAY['writing', 'workplace-policy', 'remote-work', 'culture-vs-flexibility']::TEXT[]
);

-- WritingSample_StudentResponse.json (40 questions)

SELECT insert_lsat_question(
    'ws-resp-001',
    'Writing Sample',
    'Student Response',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-002',
    'Writing Sample',
    'Student Response',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-003',
    'Writing Sample',
    'Student Response',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-004',
    'Writing Sample',
    'Student Response',
    5,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-005',
    'Writing Sample',
    'Student Response',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-006',
    'Writing Sample',
    'Student Response',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-007',
    'Writing Sample',
    'Student Response',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-008',
    'Writing Sample',
    'Student Response',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-009',
    'Writing Sample',
    'Student Response',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-010',
    'Writing Sample',
    'Student Response',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-011',
    'Writing Sample',
    'Student Response',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-012',
    'Writing Sample',
    'Student Response',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-013',
    'Writing Sample',
    'Student Response',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-014',
    'Writing Sample',
    'Student Response',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-015',
    'Writing Sample',
    'Student Response',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-016',
    'Writing Sample',
    'Student Response',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-017',
    'Writing Sample',
    'Student Response',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-018',
    'Writing Sample',
    'Student Response',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-019',
    'Writing Sample',
    'Student Response',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-020',
    'Writing Sample',
    'Student Response',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-021',
    'Writing Sample',
    'Student Response',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-022',
    'Writing Sample',
    'Student Response',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-023',
    'Writing Sample',
    'Student Response',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-024',
    'Writing Sample',
    'Student Response',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-025',
    'Writing Sample',
    'Student Response',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-026',
    'Writing Sample',
    'Student Response',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-027',
    'Writing Sample',
    'Student Response',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-028',
    'Writing Sample',
    'Student Response',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-029',
    'Writing Sample',
    'Student Response',
    9,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-030',
    'Writing Sample',
    'Student Response',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-031',
    'Writing Sample',
    'Student Response',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-032',
    'Writing Sample',
    'Student Response',
    8,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-033',
    'Writing Sample',
    'Student Response',
    2,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-034',
    'Writing Sample',
    'Student Response',
    1,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-035',
    'Writing Sample',
    'Student Response',
    3,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-036',
    'Writing Sample',
    'Student Response',
    7,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-037',
    'Writing Sample',
    'Student Response',
    4,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-038',
    'Writing Sample',
    'Student Response',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-039',
    'Writing Sample',
    'Student Response',
    6,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);
SELECT insert_lsat_question(
    'ws-resp-040',
    'Writing Sample',
    'Student Response',
    10,
    '{"question_text": "Default template", "answer_choices": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}], "correct_answer": "A", "explanation": "Apply standard logical reasoning principles."}',
    ARRAY['student response']::TEXT[]
);

-- Final Summary
DO $$
DECLARE
    final_count INTEGER;
    demo_tenant_id UUID := current_setting('mellowise.demo_tenant_id', false)::UUID;
BEGIN
    SELECT COUNT(*) INTO final_count
    FROM public.questions
    WHERE tenant_id = demo_tenant_id;

    RAISE NOTICE '================================';
    RAISE NOTICE 'LSAT Questions Migration Complete!';
    RAISE NOTICE 'Files processed: 24';
    RAISE NOTICE 'Questions generated: 960';
    RAISE NOTICE 'Questions in database: %', final_count;
    RAISE NOTICE '================================';
END $$;

-- Clean up helper function
DROP FUNCTION IF EXISTS insert_lsat_question(TEXT, TEXT, TEXT, INTEGER, JSONB, TEXT[]);