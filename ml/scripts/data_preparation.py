#!/usr/bin/env python3
"""
Mellowise Data Preparation Pipeline
Extracts data from Supabase and formats it for RecBole training
"""

import pandas as pd
import numpy as np
from pathlib import Path
import logging
from datetime import datetime, timedelta
import os
from typing import Dict, List, Tuple
import argparse

# Supabase client (uncomment when ready to use)
# from supabase import create_client, Client


class MellowiseDataPipeline:
    """Data pipeline for preparing Mellowise data for ML training"""

    def __init__(self, output_dir: str = "ml/data/processed"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.setup_logging()

        # Database configuration (load from environment)
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_ANON_KEY')

    def setup_logging(self):
        """Setup logging for the data pipeline"""
        log_dir = Path("ml/logs")
        log_dir.mkdir(exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file = log_dir / f"data_preparation_{timestamp}.log"

        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )

        logging.info("Data preparation pipeline started")

    def extract_interactions_from_supabase(self) -> pd.DataFrame:
        """Extract user-question interactions from Supabase"""
        logging.info("Extracting user interactions from Supabase...")

        # TODO: Implement actual Supabase connection
        # For now, creating sample data structure

        # Sample interaction data (replace with actual Supabase query)
        sample_interactions = self._create_sample_interactions()

        logging.info(f"Extracted {len(sample_interactions)} interactions")
        return sample_interactions

    def _create_sample_interactions(self) -> pd.DataFrame:
        """Create sample interaction data for testing (remove in production)"""
        np.random.seed(42)

        # Generate sample data
        n_users = 1000
        n_questions = 2000
        n_interactions = 50000

        user_ids = [f"user_{i:04d}" for i in range(1, n_users + 1)]
        question_ids = [f"q_{i:04d}" for i in range(1, n_questions + 1)]

        interactions = []
        base_time = datetime.now() - timedelta(days=180)

        for _ in range(n_interactions):
            user_id = np.random.choice(user_ids)
            question_id = np.random.choice(question_ids)

            # Simulate realistic rating based on difficulty
            difficulty = hash(question_id) % 10 + 1  # 1-10
            user_skill = hash(user_id) % 10 + 1     # 1-10

            # Higher skill users more likely to answer difficult questions correctly
            prob_correct = max(0.1, min(0.9, (user_skill - difficulty + 5) / 10))
            is_correct = np.random.random() < prob_correct

            # Rating based on correctness and time spent
            if is_correct:
                rating = np.random.choice([4, 5], p=[0.3, 0.7])  # Correct answers
            else:
                rating = np.random.choice([1, 2, 3], p=[0.4, 0.3, 0.3])  # Incorrect answers

            # Random timestamp within last 6 months
            timestamp = base_time + timedelta(seconds=np.random.randint(0, 180*24*3600))

            interactions.append({
                'user_id': user_id,
                'item_id': question_id,
                'rating': rating,
                'timestamp': int(timestamp.timestamp())
            })

        df = pd.DataFrame(interactions)

        # Remove duplicates (same user-question pair, keep latest)
        df = df.sort_values('timestamp').drop_duplicates(['user_id', 'item_id'], keep='last')

        return df

    def extract_users_from_supabase(self) -> pd.DataFrame:
        """Extract user features from Supabase"""
        logging.info("Extracting user features from Supabase...")

        # TODO: Implement actual Supabase query
        # Sample user data
        sample_users = self._create_sample_users()

        logging.info(f"Extracted {len(sample_users)} users")
        return sample_users

    def _create_sample_users(self) -> pd.DataFrame:
        """Create sample user data for testing"""
        np.random.seed(42)

        n_users = 1000
        user_ids = [f"user_{i:04d}" for i in range(1, n_users + 1)]

        learning_styles = ['visual', 'auditory', 'kinesthetic', 'mixed']
        performance_levels = ['beginner', 'intermediate', 'advanced']

        users = []
        for user_id in user_ids:
            users.append({
                'user_id': user_id,
                'learning_style': np.random.choice(learning_styles),
                'performance_level': np.random.choice(performance_levels),
                'streak_count': np.random.randint(0, 100)
            })

        return pd.DataFrame(users)

    def extract_questions_from_supabase(self) -> pd.DataFrame:
        """Extract question features from Supabase"""
        logging.info("Extracting question features from Supabase...")

        # TODO: Implement actual Supabase query
        # Sample question data
        sample_questions = self._create_sample_questions()

        logging.info(f"Extracted {len(sample_questions)} questions")
        return sample_questions

    def _create_sample_questions(self) -> pd.DataFrame:
        """Create sample question data for testing"""
        np.random.seed(42)

        n_questions = 2000
        question_ids = [f"q_{i:04d}" for i in range(1, n_questions + 1)]

        question_types = ['logical_reasoning', 'reading_comprehension', 'logic_games']
        topics = ['assumptions', 'weakening', 'strengthening', 'inference', 'main_point']

        questions = []
        for question_id in question_ids:
            questions.append({
                'item_id': question_id,
                'question_type': np.random.choice(question_types),
                'difficulty': np.random.randint(1, 11),  # 1-10
                'topic': np.random.choice(topics),
                'subtopic': np.random.choice(topics)  # Simplified
            })

        return pd.DataFrame(questions)

    def filter_data(self, interactions: pd.DataFrame, users: pd.DataFrame,
                   questions: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Apply filtering rules to improve data quality"""
        logging.info("Applying data filtering rules...")

        initial_interactions = len(interactions)
        initial_users = len(users)
        initial_questions = len(questions)

        # Filter interactions by rating threshold
        interactions = interactions[interactions['rating'] >= 3]

        # User filtering: minimum interactions per user
        user_interaction_counts = interactions['user_id'].value_counts()
        valid_users = user_interaction_counts[user_interaction_counts >= 10].index
        interactions = interactions[interactions['user_id'].isin(valid_users)]
        users = users[users['user_id'].isin(valid_users)]

        # Question filtering: minimum interactions per question
        question_interaction_counts = interactions['item_id'].value_counts()
        valid_questions = question_interaction_counts[question_interaction_counts >= 5].index
        interactions = interactions[interactions['item_id'].isin(valid_questions)]
        questions = questions[questions['item_id'].isin(valid_questions)]

        # Remove users/questions that no longer have interactions after filtering
        remaining_users = interactions['user_id'].unique()
        remaining_questions = interactions['item_id'].unique()

        users = users[users['user_id'].isin(remaining_users)]
        questions = questions[questions['item_id'].isin(remaining_questions)]

        logging.info(f"Filtering results:")
        logging.info(f"  Interactions: {initial_interactions} → {len(interactions)} "
                    f"({len(interactions)/initial_interactions:.1%} retained)")
        logging.info(f"  Users: {initial_users} → {len(users)} "
                    f"({len(users)/initial_users:.1%} retained)")
        logging.info(f"  Questions: {initial_questions} → {len(questions)} "
                    f"({len(questions)/initial_questions:.1%} retained)")

        return interactions, users, questions

    def create_recbole_format(self, interactions: pd.DataFrame, users: pd.DataFrame,
                             questions: pd.DataFrame) -> None:
        """Save data in RecBole format"""
        logging.info("Saving data in RecBole format...")

        # Interactions file (.inter)
        interactions_recbole = interactions[['user_id', 'item_id', 'rating', 'timestamp']].copy()
        interactions_file = self.output_dir / "mellowise_interactions.inter"
        interactions_recbole.to_csv(interactions_file, sep='\t', index=False)
        logging.info(f"Saved {len(interactions_recbole)} interactions to {interactions_file}")

        # Users file (.user)
        users_recbole = users[['user_id', 'learning_style', 'performance_level', 'streak_count']].copy()
        users_file = self.output_dir / "mellowise_interactions.user"
        users_recbole.to_csv(users_file, sep='\t', index=False)
        logging.info(f"Saved {len(users_recbole)} users to {users_file}")

        # Items/Questions file (.item)
        questions_recbole = questions[['item_id', 'question_type', 'difficulty', 'topic', 'subtopic']].copy()
        questions_file = self.output_dir / "mellowise_interactions.item"
        questions_recbole.to_csv(questions_file, sep='\t', index=False)
        logging.info(f"Saved {len(questions_recbole)} questions to {questions_file}")

    def generate_data_statistics(self, interactions: pd.DataFrame, users: pd.DataFrame,
                                questions: pd.DataFrame) -> Dict:
        """Generate and save data statistics"""
        logging.info("Generating data statistics...")

        stats = {
            'dataset_summary': {
                'total_interactions': len(interactions),
                'unique_users': len(users),
                'unique_questions': len(questions),
                'sparsity': 1 - (len(interactions) / (len(users) * len(questions))),
                'avg_interactions_per_user': len(interactions) / len(users),
                'avg_interactions_per_question': len(interactions) / len(questions)
            },
            'rating_distribution': interactions['rating'].value_counts().to_dict(),
            'user_features': {
                'learning_style_distribution': users['learning_style'].value_counts().to_dict(),
                'performance_level_distribution': users['performance_level'].value_counts().to_dict(),
                'avg_streak_count': float(users['streak_count'].mean())
            },
            'question_features': {
                'question_type_distribution': questions['question_type'].value_counts().to_dict(),
                'difficulty_distribution': questions['difficulty'].value_counts().to_dict(),
                'topic_distribution': questions['topic'].value_counts().to_dict()
            }
        }

        # Save statistics
        import json
        stats_file = self.output_dir / "dataset_statistics.json"
        with open(stats_file, 'w') as f:
            json.dump(stats, f, indent=2)

        # Log key statistics
        logging.info("Dataset Statistics:")
        logging.info(f"  Total interactions: {stats['dataset_summary']['total_interactions']:,}")
        logging.info(f"  Unique users: {stats['dataset_summary']['unique_users']:,}")
        logging.info(f"  Unique questions: {stats['dataset_summary']['unique_questions']:,}")
        logging.info(f"  Sparsity: {stats['dataset_summary']['sparsity']:.3f}")
        logging.info(f"  Avg interactions/user: {stats['dataset_summary']['avg_interactions_per_user']:.1f}")

        return stats

    def validate_recbole_format(self) -> bool:
        """Validate that the generated files are in correct RecBole format"""
        logging.info("Validating RecBole format...")

        required_files = [
            "mellowise_interactions.inter",
            "mellowise_interactions.user",
            "mellowise_interactions.item"
        ]

        for filename in required_files:
            filepath = self.output_dir / filename
            if not filepath.exists():
                logging.error(f"Missing required file: {filename}")
                return False

            # Basic format validation
            try:
                df = pd.read_csv(filepath, sep='\t')
                if len(df) == 0:
                    logging.error(f"Empty file: {filename}")
                    return False
                logging.info(f"✅ {filename}: {len(df)} records")
            except Exception as e:
                logging.error(f"Invalid format in {filename}: {e}")
                return False

        logging.info("✅ All RecBole files validated successfully")
        return True

    def run_pipeline(self) -> bool:
        """Run the complete data preparation pipeline"""
        try:
            # Extract data
            interactions = self.extract_interactions_from_supabase()
            users = self.extract_users_from_supabase()
            questions = self.extract_questions_from_supabase()

            # Filter and clean data
            interactions, users, questions = self.filter_data(interactions, users, questions)

            # Save in RecBole format
            self.create_recbole_format(interactions, users, questions)

            # Generate statistics
            self.generate_data_statistics(interactions, users, questions)

            # Validate output
            if not self.validate_recbole_format():
                return False

            logging.info("🎉 Data preparation pipeline completed successfully!")
            return True

        except Exception as e:
            logging.error(f"❌ Pipeline failed: {str(e)}")
            return False


def main():
    """Main function for command-line usage"""
    parser = argparse.ArgumentParser(description="Mellowise Data Preparation Pipeline")
    parser.add_argument('--output-dir', default='ml/data/processed',
                       help='Output directory for processed data')
    parser.add_argument('--sample-data', action='store_true',
                       help='Use sample data instead of Supabase (for testing)')

    args = parser.parse_args()

    pipeline = MellowiseDataPipeline(args.output_dir)

    if args.sample_data:
        logging.info("Using sample data for testing")

    success = pipeline.run_pipeline()
    return 0 if success else 1


if __name__ == "__main__":
    exit(main())