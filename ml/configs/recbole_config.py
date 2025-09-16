"""
Mellowise RecBole Configuration
Recommendation system configuration for LSAT question recommendations
"""

from recbole.config import Config
from recbole.data import create_dataset, data_preparation
from recbole.model.general_recommender import ItemKNN, BPR, NeuMF
from typing import Dict, Any


class MellowiseRecBoleConfig:
    """RecBole configuration for Mellowise recommendation system"""

    @staticmethod
    def get_base_config() -> Dict[str, Any]:
        """Base RecBole configuration for Mellowise"""

        config_dict = {
            # Dataset configuration
            'data_path': './ml/data/processed',
            'dataset': 'mellowise_interactions',
            'load_col': {
                'inter': ['user_id', 'item_id', 'rating', 'timestamp'],
                'user': ['user_id', 'learning_style', 'performance_level', 'streak_count'],
                'item': ['item_id', 'question_type', 'difficulty', 'topic', 'subtopic']
            },

            # Data preprocessing
            'user_inter_num_interval': "[10,inf)",  # Users with at least 10 interactions
            'item_inter_num_interval': "[5,inf)",   # Items with at least 5 interactions
            'val_interval': {'rating': "[3,inf)"},  # Only consider ratings >= 3 as positive

            # Training configuration
            'epochs': 100,
            'train_batch_size': 1024,
            'eval_batch_size': 2048,
            'learning_rate': 0.001,
            'weight_decay': 1e-4,
            'stopping_step': 10,
            'checkpoint_dir': './ml/models/checkpoints',

            # Evaluation configuration
            'eval_args': {
                'split': {'RS': [0.8, 0.1, 0.1]},  # Random split: 80% train, 10% val, 10% test
                'group_by': 'user',
                'order': 'TO',  # Time-ordered split (more realistic)
                'mode': 'full'   # Full ranking evaluation
            },

            # Metrics to evaluate
            'metrics': ['Recall', 'NDCG', 'Hit', 'Precision', 'MAP', 'MRR'],
            'topk': [5, 10, 20, 50],  # Top-K recommendations to evaluate
            'valid_metric': 'NDCG@10',  # Primary metric for model selection

            # System configuration
            'device': 'cuda',  # Use GPU for training
            'benchmark': True,  # Enable CUDA benchmark mode
            'reproducibility': True,
            'seed': 2023,

            # Logging
            'log_wandb': False,  # Set to True to enable W&B logging
            'wandb_project': 'mellowise-recommendations'
        }

        return config_dict

    @staticmethod
    def get_model_configs() -> Dict[str, Dict[str, Any]]:
        """Model-specific configurations"""

        return {
            'itemknn': {
                'model': 'ItemKNN',
                'k': 20,           # Number of similar items
                'shrink': 100,     # Shrinkage parameter
                'normalize': True, # L2 normalization
                'similarity': 'cosine'  # Similarity metric
            },

            'bpr': {
                'model': 'BPR',
                'embedding_size': 64,    # Embedding dimension
                'reg_weight': 1e-4,      # L2 regularization
                'learning_rate': 0.001,
                'train_neg_sample_args': {
                    'distribution': 'uniform',
                    'sample_num': 1,
                    'alpha': 1.0,
                    'dynamic': False,
                    'candidate_num': 0
                }
            },

            'neumf': {
                'model': 'NeuMF',
                'mf_embedding_size': 64,      # MF embedding size
                'mlp_embedding_size': 64,     # MLP embedding size
                'mlp_hidden_size': [128, 64, 32],  # MLP hidden layers
                'dropout_prob': 0.2,          # Dropout probability
                'learning_rate': 0.001,
                'train_neg_sample_args': {
                    'distribution': 'uniform',
                    'sample_num': 4,
                    'alpha': 1.0,
                    'dynamic': False,
                    'candidate_num': 0
                }
            },

            # Advanced models for future experimentation
            'lightgcn': {
                'model': 'LightGCN',
                'embedding_size': 64,
                'n_layers': 3,
                'reg_weight': 1e-4,
                'learning_rate': 0.001
            },

            'sasrec': {
                'model': 'SASRec',
                'hidden_size': 50,
                'inner_size': 256,
                'n_layers': 2,
                'n_heads': 1,
                'hidden_dropout_prob': 0.5,
                'attn_dropout_prob': 0.5,
                'hidden_act': 'gelu',
                'layer_norm_eps': 1e-12,
                'initializer_range': 0.02,
                'max_seq_length': 50,
                'learning_rate': 0.001
            }
        }

    @staticmethod
    def get_experiment_config(model_name: str, experiment_name: str) -> Config:
        """Get complete RecBole config for specific experiment"""

        base_config = MellowiseRecBoleConfig.get_base_config()
        model_configs = MellowiseRecBoleConfig.get_model_configs()

        if model_name not in model_configs:
            raise ValueError(f"Model {model_name} not found. Available models: {list(model_configs.keys())}")

        model_config = model_configs[model_name]

        # Merge configurations
        config_dict = {**base_config, **model_config}

        # Add experiment-specific settings
        config_dict.update({
            'experiment_name': experiment_name,
            'checkpoint_dir': f'./ml/models/checkpoints/{experiment_name}',
            'saved_model_file': f'./ml/models/{experiment_name}_{model_name}.pth'
        })

        # Create RecBole Config object
        config = Config(
            model=model_config['model'],
            dataset='mellowise_interactions',
            config_dict=config_dict
        )

        return config

    @staticmethod
    def get_hyperparameter_grid(model_name: str) -> Dict[str, list]:
        """Get hyperparameter grid for model tuning"""

        grids = {
            'itemknn': {
                'k': [10, 20, 50, 100],
                'shrink': [0, 50, 100, 200],
                'similarity': ['cosine', 'pearson', 'jaccard']
            },

            'bpr': {
                'embedding_size': [32, 64, 128],
                'learning_rate': [0.0001, 0.001, 0.01],
                'reg_weight': [1e-5, 1e-4, 1e-3]
            },

            'neumf': {
                'mf_embedding_size': [32, 64, 128],
                'mlp_embedding_size': [32, 64, 128],
                'mlp_hidden_size': [[64, 32], [128, 64, 32], [256, 128, 64]],
                'dropout_prob': [0.1, 0.2, 0.3],
                'learning_rate': [0.0001, 0.001, 0.01]
            }
        }

        return grids.get(model_name, {})

    @staticmethod
    def create_mellowise_dataset_config() -> Dict[str, Any]:
        """Configuration for processing Mellowise data into RecBole format"""

        return {
            'database_config': {
                'host': 'your-supabase-host',
                'database': 'postgres',
                'user': 'postgres',
                'password': 'your-password'
            },

            'data_extraction': {
                'interaction_query': '''
                    SELECT
                        user_id::text as user_id,
                        question_id::text as item_id,
                        CASE
                            WHEN is_correct = true THEN 5
                            WHEN time_spent < 30 THEN 1
                            ELSE 3
                        END as rating,
                        EXTRACT(epoch FROM created_at) as timestamp
                    FROM user_answers
                    WHERE created_at >= NOW() - INTERVAL '6 months'
                ''',

                'user_query': '''
                    SELECT
                        id::text as user_id,
                        learning_style,
                        CASE
                            WHEN avg_score >= 80 THEN 'high'
                            WHEN avg_score >= 60 THEN 'medium'
                            ELSE 'low'
                        END as performance_level,
                        streak_count
                    FROM users u
                    LEFT JOIN user_stats us ON u.id = us.user_id
                ''',

                'item_query': '''
                    SELECT
                        id::text as item_id,
                        question_type,
                        difficulty,
                        topic,
                        subtopic
                    FROM questions
                    WHERE is_active = true
                '''
            },

            'preprocessing': {
                'min_interactions_per_user': 10,
                'min_interactions_per_item': 5,
                'min_rating_threshold': 3,
                'max_sequence_length': 100  # For sequential models
            }
        }


# Utility functions for easy configuration access
def get_quick_config(model_name: str, experiment_name: str = "default") -> Config:
    """Quick way to get a RecBole config"""
    return MellowiseRecBoleConfig.get_experiment_config(model_name, experiment_name)


def list_available_models() -> list:
    """List all available model configurations"""
    return list(MellowiseRecBoleConfig.get_model_configs().keys())


if __name__ == "__main__":
    # Example usage
    print("Available models:", list_available_models())

    # Create a config for ItemKNN
    config = get_quick_config("itemknn", "test_experiment")
    print(f"Created config for {config['model']} model")
    print(f"Embedding size: {config.get('embedding_size', 'N/A')}")
    print(f"Dataset: {config['dataset']}")