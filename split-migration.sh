#!/bin/bash
# Split migration into manageable batches

# Extract header and setup
head -50 migrate-all-questions.sql > batch-1-setup.sql

# Split questions into 4 batches (240 questions each)
grep -n "SELECT insert_lsat_question" migrate-all-questions.sql | head -240 | cut -d: -f2- > batch-2-lr.sql
grep -n "SELECT insert_lsat_question" migrate-all-questions.sql | head -480 | tail -240 | cut -d: -f2- > batch-3-lr-cont.sql  
grep -n "SELECT insert_lsat_question" migrate-all-questions.sql | head -720 | tail -240 | cut -d: -f2- > batch-4-rc.sql
grep -n "SELECT insert_lsat_question" migrate-all-questions.sql | tail -240 | cut -d: -f2- > batch-5-rc-ws.sql

# Extract footer
tail -20 migrate-all-questions.sql > batch-6-cleanup.sql

echo "✅ Migration split into 6 batch files:"
ls -lh batch-*.sql