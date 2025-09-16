"""
Mellowise Recommendation Model Training Script
Main training pipeline for RecBole-based recommendation models
"""

import argparse
import yaml
import torch
import mlflow
import mlflow.pytorch
import logging
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

# RecBole imports
from recbole.config import Config
from recbole.data import create_dataset, data_preparation
from recbole.model.general_recommender import ItemKNN, BPR, NeuMF
from recbole.trainer import Trainer
from recbole.utils import init_logger, get_model, get_trainer, init_seed, set_color

# Mellowise imports
import sys
sys.path.append('..')
from configs.recbole_config import MellowiseRecBoleConfig, get_quick_config


class MellowiseTrainer:
    """Main training class for Mellowise recommendation models"""

    def __init__(self, config_path: str, model_name: str, gpu_id: int = 0):
        self.config_path = config_path
        self.model_name = model_name
        self.gpu_id = gpu_id
        self.experiment_config = self._load_experiment_config()
        self.training_start_time = None

    def _load_experiment_config(self) -> Dict[str, Any]:
        """Load experiment configuration from YAML file"""
        try:
            with open(self.config_path, 'r') as f:
                config = yaml.safe_load(f)
            return config
        except FileNotFoundError:
            logging.error(f"Configuration file not found: {self.config_path}")
            raise
        except yaml.YAMLError as e:
            logging.error(f"Error parsing YAML config: {e}")
            raise

    def setup_logging(self):
        """Setup logging for the training session"""
        log_dir = Path("ml/logs")
        log_dir.mkdir(exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file = log_dir / f"training_{self.model_name}_{timestamp}.log"

        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )

        logging.info(f"Training session started for {self.model_name}")
        logging.info(f"Configuration: {self.config_path}")
        logging.info(f"Log file: {log_file}")

    def setup_mlflow(self):
        """Setup MLflow experiment tracking"""
        experiment_name = self.experiment_config['experiment']['name']
        mlflow.set_experiment(experiment_name)

        # Set tracking URI if specified
        if 'mlflow_tracking_uri' in self.experiment_config.get('logging', {}):
            mlflow.set_tracking_uri(self.experiment_config['logging']['mlflow_tracking_uri'])

        logging.info(f"MLflow experiment: {experiment_name}")

    def create_recbole_config(self) -> Config:
        """Create RecBole configuration from experiment config"""

        # Get base configuration
        config = get_quick_config(
            self.model_name,
            self.experiment_config['experiment']['name']
        )

        # Override with experiment-specific settings
        if 'training' in self.experiment_config:
            training_config = self.experiment_config['training']
            for key, value in training_config.items():
                if hasattr(config, key):
                    setattr(config, key, value)

        # Set GPU
        if torch.cuda.is_available():
            config['device'] = f'cuda:{self.gpu_id}'
            logging.info(f"Using GPU: {config['device']}")
        else:
            config['device'] = 'cpu'
            logging.warning("CUDA not available, using CPU")

        return config

    def prepare_data(self, config: Config):
        """Prepare dataset and data loaders"""
        logging.info("Preparing dataset...")

        # Create dataset
        dataset = create_dataset(config)
        logging.info(f"Dataset created: {len(dataset.inter_feat)} interactions")

        # Create data splits
        train_data, valid_data, test_data = data_preparation(config, dataset)

        logging.info(f"Data splits - Train: {len(train_data.dataset.inter_feat)}, "
                    f"Valid: {len(valid_data.dataset.inter_feat)}, "
                    f"Test: {len(test_data.dataset.inter_feat)}")

        return dataset, train_data, valid_data, test_data

    def create_model_and_trainer(self, config: Config, train_data):
        """Create model and trainer instances"""
        logging.info(f"Creating {self.model_name} model...")

        # Get model
        model = get_model(config['model'])(config, train_data.dataset).to(config['device'])

        # Count parameters
        total_params = sum(p.numel() for p in model.parameters())
        trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

        logging.info(f"Model parameters - Total: {total_params:,}, Trainable: {trainable_params:,}")

        # Get trainer
        trainer = get_trainer(config['MODEL_TYPE'], config['model'])(config, model)

        return model, trainer

    def train_model(self):
        """Main training loop"""
        self.training_start_time = time.time()

        # Setup logging and tracking
        self.setup_logging()
        self.setup_mlflow()

        # Create configuration
        config = self.create_recbole_config()

        # Initialize RecBole logging and random seed
        init_logger(config)
        init_seed(config['seed'], config['reproducibility'])

        with mlflow.start_run(run_name=f"{self.model_name}_{datetime.now().strftime('%H%M%S')}"):

            # Log experiment configuration
            mlflow.log_params({
                "model_name": self.model_name,
                "dataset": config['dataset'],
                "epochs": config['epochs'],
                "learning_rate": config['learning_rate'],
                "batch_size": config['train_batch_size'],
                "device": str(config['device'])
            })

            # Log experiment config from YAML
            mlflow.log_params(self.experiment_config['experiment'])
            if 'training' in self.experiment_config:
                mlflow.log_params(self.experiment_config['training'])

            try:
                # Prepare data
                dataset, train_data, valid_data, test_data = self.prepare_data(config)

                # Create model and trainer
                model, trainer = self.create_model_and_trainer(config, train_data)

                # Training
                logging.info("Starting training...")
                best_valid_score, best_valid_result = trainer.fit(
                    train_data, valid_data, show_progress=True
                )

                # Log training results
                mlflow.log_metrics(best_valid_result)
                mlflow.log_metric("best_valid_score", best_valid_score)

                # Testing
                logging.info("Evaluating on test set...")
                test_result = trainer.evaluate(test_data)
                mlflow.log_metrics({f"test_{k}": v for k, v in test_result.items()})

                # Calculate training time
                training_time = time.time() - self.training_start_time
                mlflow.log_metric("training_time_seconds", training_time)

                # Save model
                self._save_model(model, config, best_valid_score)

                # Log model artifact
                mlflow.pytorch.log_model(model, "model")

                # Create results summary
                self._log_results_summary(best_valid_result, test_result, training_time)

                logging.info("Training completed successfully!")
                return model, best_valid_result, test_result

            except Exception as e:
                logging.error(f"Training failed: {str(e)}")
                mlflow.log_param("training_status", "failed")
                mlflow.log_param("error_message", str(e))
                raise

    def _save_model(self, model, config: Config, best_score: float):
        """Save trained model to disk"""
        model_dir = Path("ml/models")
        model_dir.mkdir(exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        model_filename = f"{self.experiment_config['experiment']['name']}_{self.model_name}_{timestamp}.pth"
        model_path = model_dir / model_filename

        # Save model state dict
        torch.save({
            'model_state_dict': model.state_dict(),
            'config': dict(config),
            'best_score': best_score,
            'model_name': self.model_name,
            'timestamp': timestamp,
            'experiment_config': self.experiment_config
        }, model_path)

        # Create symlink to latest model
        latest_path = model_dir / f"{self.model_name}_latest.pth"
        if latest_path.exists():
            latest_path.unlink()
        latest_path.symlink_to(model_filename)

        logging.info(f"Model saved: {model_path}")
        mlflow.log_artifact(str(model_path), "models")

    def _log_results_summary(self, valid_result: Dict, test_result: Dict, training_time: float):
        """Log comprehensive results summary"""
        summary = f"""
Training Summary for {self.model_name}
{'='*50}
Experiment: {self.experiment_config['experiment']['name']}
Training Time: {training_time:.2f} seconds ({training_time/60:.1f} minutes)

Validation Results:
{self._format_metrics(valid_result)}

Test Results:
{self._format_metrics(test_result)}
"""

        logging.info(summary)

        # Save summary to file
        summary_dir = Path("ml/results")
        summary_dir.mkdir(exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        summary_file = summary_dir / f"summary_{self.model_name}_{timestamp}.txt"

        with open(summary_file, 'w') as f:
            f.write(summary)

        mlflow.log_artifact(str(summary_file), "results")

    def _format_metrics(self, metrics: Dict) -> str:
        """Format metrics for readable output"""
        formatted = []
        for metric, value in metrics.items():
            if isinstance(value, float):
                formatted.append(f"  {metric}: {value:.4f}")
            else:
                formatted.append(f"  {metric}: {value}")
        return "\n".join(formatted)


def main():
    """Main training script entry point"""
    parser = argparse.ArgumentParser(description="Train Mellowise Recommendation Models")

    parser.add_argument('--config', required=True, type=str,
                       help='Path to experiment configuration YAML file')
    parser.add_argument('--model', required=True, type=str,
                       choices=['itemknn', 'bpr', 'neumf', 'lightgcn', 'sasrec'],
                       help='Model to train')
    parser.add_argument('--gpu', type=int, default=0,
                       help='GPU ID to use (default: 0)')
    parser.add_argument('--checkpoint-dir', type=str, default='ml/models/checkpoints',
                       help='Directory to save checkpoints')
    parser.add_argument('--tensorboard', action='store_true',
                       help='Enable TensorBoard logging')

    args = parser.parse_args()

    # Validate config file exists
    if not Path(args.config).exists():
        print(f"Error: Configuration file not found: {args.config}")
        return 1

    # Create trainer and run training
    try:
        trainer = MellowiseTrainer(args.config, args.model, args.gpu)
        model, valid_results, test_results = trainer.train_model()

        print("\n" + "="*60)
        print("🎉 TRAINING COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"Model: {args.model}")
        print(f"Best Validation NDCG@10: {valid_results.get('NDCG@10', 'N/A'):.4f}")
        print(f"Test NDCG@10: {test_results.get('NDCG@10', 'N/A'):.4f}")
        print("="*60)

        return 0

    except Exception as e:
        print(f"\n❌ TRAINING FAILED: {str(e)}")
        return 1


if __name__ == "__main__":
    exit_code = main()
    exit(exit_code)