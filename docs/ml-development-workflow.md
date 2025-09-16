# ML Development Workflow Guide
## M1 MacBook (Development) ↔ Windows RTX 3090 (Training)

### 🎯 Overview
This guide establishes a seamless ML development workflow for Mellowise's recommendation engine using:
- **M1 MacBook**: Primary development, code writing, experimentation
- **Windows RTX 3090**: Model training, heavy computations, batch processing
- **Integrated Workflow**: Git-based sync, remote development, automated deployments

---

## 🏗️ Architecture Overview

```
M1 MacBook (Development)           Windows RTX 3090 (Training)
├── VS Code + Extensions           ├── Python ML Environment
├── Git Repository (Source)        ├── CUDA + GPU Training
├── Jupyter Notebooks             ├── TensorBoard Monitoring
├── RecBole Development            ├── Model Artifacts Storage
├── Quick Prototyping              └── Automated Training Scripts
└── Remote SSH to Windows
```

---

## 🚀 Quick Start Commands

### Daily Workflow (Copy-Paste Ready)
```bash
# M1 MacBook - Start Development Session
alias mldev='cd ~/Development/Mellowise_app/ml && source venv/bin/activate && code .'
alias winconnect='ssh ml-training@YOUR_WINDOWS_IP'
alias syncml='git add ml/ && git commit -m "ML: $(date +%H:%M)" && git push origin ml-dev'

# Windows - Start Training Session
alias mlstart='cd C:\mellowise-ml && conda activate mellowise && tensorboard --logdir=./experiments --port=6006'
alias synccode='git pull origin ml-dev && python scripts/setup_experiments.py'
```

---

## 💻 M1 MacBook Setup

### 1. Development Environment
```bash
# Create ML directory in existing Mellowise project
cd /Users/awill314/Development/Mellowise_app
mkdir -p ml/{experiments,models,data,notebooks,scripts,configs}

# Python environment setup
python3 -m venv ml/venv
source ml/venv/bin/activate

# Install development dependencies
cat > ml/requirements-dev.txt << EOF
# Core ML Libraries
numpy>=1.24.0
pandas>=2.0.0
scikit-learn>=1.3.0
matplotlib>=3.7.0
seaborn>=0.12.0

# Deep Learning
torch>=2.0.0
torchvision>=0.15.0

# Experiment Tracking
tensorboard>=2.13.0
mlflow>=2.5.0
wandb>=0.15.0

# RecBole Framework
recbole>=1.1.1

# Jupyter & Development
jupyter>=1.0.0
ipywidgets>=8.0.0
jupyterlab>=4.0.0

# Data Processing
scipy>=1.11.0
pyarrow>=12.0.0
polars>=0.18.0

# Visualization
plotly>=5.15.0
streamlit>=1.25.0

# Development Tools
black>=23.0.0
isort>=5.12.0
pytest>=7.4.0
pre-commit>=3.3.0
EOF

pip install -r ml/requirements-dev.txt
```

### 2. VS Code Configuration
```bash
# Install VS Code extensions
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
code --install-extension ms-toolsai.jupyter
code --install-extension ms-vscode-remote.remote-ssh
code --install-extension ms-vscode-remote.remote-ssh-edit
code --install-extension mechatroner.rainbow-csv
code --install-extension ms-python.black-formatter
```

### 3. VS Code Settings (M1 Optimized)
```json
# .vscode/settings.json
{
  "python.defaultInterpreterPath": "./ml/venv/bin/python",
  "python.terminal.activateEnvironment": true,
  "jupyter.kernels.excludePythonPathFromSysPrefix": true,

  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,

  "files.watcherExclude": {
    "**/ml/experiments/**": true,
    "**/ml/models/**": true,
    "**/ml/data/cache/**": true
  },

  "remote.SSH.remotePlatform": {
    "YOUR_WINDOWS_IP": "windows"
  },

  "tensorboard.logDirectory": "./ml/experiments"
}
```

### 4. Git Workflow Configuration
```bash
# Create ML-specific branch
git checkout -b ml-dev
git push -u origin ml-dev

# Git configuration for ML workflow
cat >> .gitignore << EOF

# ML Development
ml/data/raw/
ml/data/processed/
ml/models/*.pth
ml/models/*.pkl
ml/experiments/*/checkpoints/
ml/venv/
**/.ipynb_checkpoints
**/__pycache__/
*.pyc
.mlflow/
wandb/

# Keep structure and configs
!ml/data/.gitkeep
!ml/models/.gitkeep
!ml/experiments/.gitkeep
EOF

# Create directory structure
touch ml/data/.gitkeep
touch ml/models/.gitkeep
touch ml/experiments/.gitkeep
```

---

## 🖥️ Windows RTX 3090 Setup

### 1. SSH Server Configuration
```powershell
# Enable OpenSSH Server (Run as Administrator)
Add-WindowsCapability -Online -Name OpenSSH.Server
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'

# Create ML user account
net user ml-training "YourSecurePassword" /add
net localgroup "Remote Desktop Users" ml-training /add
```

### 2. Python Environment Setup
```cmd
# Install Miniconda
# Download from: https://docs.conda.io/en/latest/miniconda.html

# Create Mellowise environment
conda create -n mellowise python=3.10
conda activate mellowise

# Install CUDA-enabled PyTorch
conda install pytorch torchvision torchaudio pytorch-cuda=11.8 -c pytorch -c nvidia

# Install training dependencies
pip install recbole tensorboard mlflow wandb accelerate
```

### 3. Project Setup
```cmd
# Clone repository
cd C:\
git clone https://github.com/YOUR_USERNAME/Mellowise_app.git mellowise-ml
cd mellowise-ml
git checkout ml-dev

# Training environment setup
mkdir experiments\runs
mkdir models\checkpoints
mkdir data\processed
```

### 4. Automation Scripts
```python
# scripts/windows_training_setup.py
import os
import subprocess
import json
from pathlib import Path

def setup_training_environment():
    """Setup Windows training environment"""

    # Activate conda environment
    activate_cmd = r"C:\Users\ml-training\miniconda3\Scripts\activate.bat"

    # Set CUDA environment variables
    os.environ['CUDA_VISIBLE_DEVICES'] = '0'
    os.environ['TORCH_CUDA_ARCH_LIST'] = '8.6'  # RTX 3090

    # Create experiment directories
    exp_dir = Path("experiments") / "current"
    exp_dir.mkdir(parents=True, exist_ok=True)

    # Start TensorBoard
    subprocess.Popen([
        "tensorboard",
        "--logdir=experiments",
        "--port=6006",
        "--bind_all"
    ])

    print("Training environment ready!")
    print("TensorBoard: http://localhost:6006")

if __name__ == "__main__":
    setup_training_environment()
```

---

## 🔄 Development Workflow

### 1. Daily Development Cycle
```bash
# Morning Setup (M1 MacBook)
mldev                              # Activate environment + VS Code
git pull origin ml-dev             # Sync latest changes
jupyter lab --port=8888           # Start Jupyter for experimentation

# Connect to Windows for training
winconnect                         # SSH to Windows machine
# On Windows: conda activate mellowise && python scripts/windows_training_setup.py
```

### 2. Experiment Development Process
```bash
# M1 MacBook - Create new experiment
cd ml/experiments
mkdir experiment-$(date +%Y%m%d-%H%M)
cd experiment-$(date +%Y%m%d-%H%M)

# Create experiment config
cat > config.yaml << EOF
experiment:
  name: "recommendation_baseline"
  description: "LSAT question recommendation baseline"

model:
  type: "ItemKNN"
  params:
    k: 20
    shrink: 100

data:
  dataset: "lsat_interactions"
  split_ratio: [0.8, 0.1, 0.1]

training:
  epochs: 100
  batch_size: 1024
  learning_rate: 0.001

logging:
  tensorboard: true
  mlflow: true
  checkpoint_freq: 10
EOF

# Quick prototype notebook
jupyter notebook prototype.ipynb
```

### 3. Code Development (VS Code + Remote SSH)
```bash
# Connect to Windows from VS Code
# Cmd+Shift+P -> "Remote-SSH: Connect to Host"
# Add Windows machine IP

# Develop training scripts on Windows via Remote SSH
# File: ml/training/train_recommender.py
```

### 4. Training Execution
```bash
# Sync code to Windows
git add . && git commit -m "Experiment: $(date)" && git push origin ml-dev

# On Windows (via SSH)
cd C:\mellowise-ml
git pull origin ml-dev
conda activate mellowise

# Start training with monitoring
python ml/training/train_recommender.py \
  --config ml/experiments/experiment-$(date +%Y%m%d)/config.yaml \
  --gpu 0 \
  --tensorboard \
  --checkpoint-dir models/checkpoints
```

---

## 📊 Monitoring & Debugging

### 1. TensorBoard Setup
```bash
# M1 MacBook - Remote TensorBoard access
ssh -L 6006:localhost:6006 ml-training@YOUR_WINDOWS_IP

# Now access TensorBoard at: http://localhost:6006
```

### 2. Real-time Monitoring
```python
# scripts/monitor_training.py
import requests
import time
import json

def monitor_gpu_usage():
    """Monitor Windows GPU during training"""

    # SSH command to get GPU stats
    cmd = """
    ssh ml-training@YOUR_WINDOWS_IP '
    nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu
    --format=csv,nounits,noheader
    '
    """

    while True:
        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            gpu_stats = result.stdout.strip().split(',')

            print(f"GPU Util: {gpu_stats[0]}% | "
                  f"Memory: {gpu_stats[1]}/{gpu_stats[2]}MB | "
                  f"Temp: {gpu_stats[3]}°C")

            time.sleep(5)

        except KeyboardInterrupt:
            break

if __name__ == "__main__":
    monitor_gpu_usage()
```

### 3. Jupyter Notebook Integration
```python
# notebooks/training_dashboard.ipynb
import pandas as pd
import matplotlib.pyplot as plt
import tensorboard as tb
from tensorboard import notebook

# Load TensorBoard in Jupyter
%load_ext tensorboard
%tensorboard --logdir=../experiments --port=6007

# Real-time training metrics
def plot_training_progress():
    # Connect to remote TensorBoard data
    experiment = tb.data.experimental.ExperimentFromDev("http://YOUR_WINDOWS_IP:6006")
    df = experiment.get_scalars()

    # Plot training curves
    plt.figure(figsize=(12, 4))

    plt.subplot(1, 2, 1)
    plt.plot(df[df['tag'] == 'train/loss']['value'])
    plt.title('Training Loss')

    plt.subplot(1, 2, 2)
    plt.plot(df[df['tag'] == 'val/accuracy']['value'])
    plt.title('Validation Accuracy')

    plt.show()

# Auto-refresh every 30 seconds
import time
from IPython.display import clear_output

while True:
    clear_output(wait=True)
    plot_training_progress()
    time.sleep(30)
```

---

## 🔧 RecBole Integration

### 1. Mellowise RecBole Configuration
```python
# ml/configs/recbole_config.py
from recbole.config import Config
from recbole.data import create_dataset, data_preparation
from recbole.model.general_recommender import ItemKNN, BPR, NeuMF

class MellowiseRecBoleConfig:
    """RecBole configuration for Mellowise recommendation system"""

    @staticmethod
    def get_base_config():
        config_dict = {
            # Dataset config
            'data_path': './ml/data/processed',
            'dataset': 'mellowise_interactions',
            'load_col': {
                'inter': ['user_id', 'item_id', 'rating', 'timestamp'],
                'user': ['user_id', 'learning_style', 'performance_level'],
                'item': ['item_id', 'question_type', 'difficulty', 'topic']
            },

            # Training config
            'epochs': 100,
            'train_batch_size': 1024,
            'eval_batch_size': 2048,
            'learning_rate': 0.001,
            'weight_decay': 1e-4,

            # Evaluation config
            'eval_args': {
                'split': {'RS': [0.8, 0.1, 0.1]},
                'group_by': 'user',
                'order': 'TO',
                'mode': 'full'
            },

            'metrics': ['Recall', 'NDCG', 'Hit', 'Precision'],
            'topk': [5, 10, 20],
            'valid_metric': 'NDCG@10',

            # GPU config
            'device': 'cuda',
            'benchmark': True
        }
        return config_dict

    @staticmethod
    def get_model_configs():
        return {
            'itemknn': {
                'model': 'ItemKNN',
                'k': 20,
                'shrink': 100,
                'normalize': True
            },
            'bpr': {
                'model': 'BPR',
                'embedding_size': 64,
                'reg_weight': 1e-4
            },
            'neumf': {
                'model': 'NeuMF',
                'mf_embedding_size': 64,
                'mlp_embedding_size': 64,
                'mlp_hidden_size': [128, 64, 32],
                'dropout_prob': 0.2
            }
        }
```

### 2. Training Script Template
```python
# ml/training/train_recommender.py
import argparse
import yaml
import torch
from pathlib import Path
import mlflow
import mlflow.pytorch

from recbole.config import Config
from recbole.data import create_dataset, data_preparation
from recbole.model.general_recommender import ItemKNN, BPR, NeuMF
from recbole.trainer import Trainer
from recbole.utils import init_logger, get_model, get_trainer, init_seed, set_color

from ml.configs.recbole_config import MellowiseRecBoleConfig

def train_model(config_path: str, model_name: str, gpu_id: int = 0):
    """Train recommendation model with MLflow tracking"""

    # Load configuration
    with open(config_path, 'r') as f:
        exp_config = yaml.safe_load(f)

    # Setup RecBole config
    base_config = MellowiseRecBoleConfig.get_base_config()
    model_config = MellowiseRecBoleConfig.get_model_configs()[model_name]

    # Merge configs
    config = Config(
        model=model_config['model'],
        dataset='mellowise_interactions',
        config_dict={**base_config, **model_config}
    )

    # Initialize MLflow
    mlflow.set_experiment(exp_config['experiment']['name'])

    with mlflow.start_run():
        # Log experiment parameters
        mlflow.log_params(exp_config)
        mlflow.log_params(model_config)

        # Initialize logger
        init_logger(config)
        init_seed(config['seed'], config['reproducibility'])

        # Create dataset and data loaders
        dataset = create_dataset(config)
        train_data, valid_data, test_data = data_preparation(config, dataset)

        # Get model and trainer
        model = get_model(config['model'])(config, train_data.dataset).to(config['device'])
        trainer = get_trainer(config['MODEL_TYPE'], config['model'])(config, model)

        # Training
        best_valid_score, best_valid_result = trainer.fit(
            train_data, valid_data, show_progress=True
        )

        # Testing
        test_result = trainer.evaluate(test_data)

        # Log results
        mlflow.log_metrics(best_valid_result)
        mlflow.log_metrics(test_result)

        # Save model
        model_path = f"models/{exp_config['experiment']['name']}_{model_name}.pth"
        torch.save(model.state_dict(), model_path)
        mlflow.pytorch.log_model(model, "model")

        print(f"Training completed! Best validation: {best_valid_score}")
        print(f"Test results: {test_result}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', required=True, help='Experiment config file')
    parser.add_argument('--model', required=True, choices=['itemknn', 'bpr', 'neumf'])
    parser.add_argument('--gpu', type=int, default=0, help='GPU ID')

    args = parser.parse_args()

    train_model(args.config, args.model, args.gpu)
```

---

## 🚀 Automation & Helper Scripts

### 1. Development Productivity Scripts
```bash
# ml/scripts/dev_helpers.sh
#!/bin/bash

# Quick experiment setup
create_experiment() {
    local exp_name=$1
    local exp_dir="ml/experiments/exp_$(date +%Y%m%d)_$exp_name"

    mkdir -p "$exp_dir"
    cd "$exp_dir"

    # Copy template config
    cp ../../configs/template_config.yaml config.yaml

    # Create notebook
    cat > experiment.ipynb << EOF
{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": ["# Experiment: $exp_name\n\n"]
  }
 ],
 "metadata": {
  "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}
 },
 "nbformat": 4,
 "nbformat_minor": 4
}
EOF

    echo "Experiment created: $exp_dir"
    code experiment.ipynb
}

# Quick training start
start_training() {
    local model=$1
    local config=$2

    # Sync to Windows
    git add . && git commit -m "Training: $model $(date +%H:%M)" && git push origin ml-dev

    # Execute on Windows
    ssh ml-training@YOUR_WINDOWS_IP "
        cd C:/mellowise-ml &&
        git pull origin ml-dev &&
        conda activate mellowise &&
        python ml/training/train_recommender.py --config $config --model $model --gpu 0
    "
}

# Monitor training progress
monitor_training() {
    echo "Opening TensorBoard tunnel..."
    ssh -L 6006:localhost:6006 ml-training@YOUR_WINDOWS_IP &

    sleep 3
    open http://localhost:6006

    echo "Monitoring GPU usage..."
    watch -n 2 'ssh ml-training@YOUR_WINDOWS_IP "nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,nounits,noheader"'
}

# Export functions
export -f create_experiment start_training monitor_training
```

### 2. Data Preparation Pipeline
```python
# ml/scripts/prepare_mellowise_data.py
import pandas as pd
import numpy as np
from pathlib import Path
import json

class MellowiseDataPreparer:
    """Prepare Mellowise data for RecBole format"""

    def __init__(self, data_dir: str = "ml/data"):
        self.data_dir = Path(data_dir)
        self.raw_dir = self.data_dir / "raw"
        self.processed_dir = self.data_dir / "processed"
        self.processed_dir.mkdir(exist_ok=True)

    def extract_user_interactions(self):
        """Extract user-question interactions from Mellowise database"""

        # This would connect to your Supabase database
        # For now, creating sample data structure

        interactions = []
        users = []
        items = []

        # Sample interaction data
        # In production, query from: user_sessions, user_answers, questions tables

        # Save in RecBole format
        inter_df = pd.DataFrame(interactions, columns=['user_id', 'item_id', 'rating', 'timestamp'])
        user_df = pd.DataFrame(users, columns=['user_id', 'learning_style', 'performance_level'])
        item_df = pd.DataFrame(items, columns=['item_id', 'question_type', 'difficulty', 'topic'])

        # Save to processed directory
        inter_df.to_csv(self.processed_dir / "mellowise_interactions.inter", sep='\t', index=False)
        user_df.to_csv(self.processed_dir / "mellowise_interactions.user", sep='\t', index=False)
        item_df.to_csv(self.processed_dir / "mellowise_interactions.item", sep='\t', index=False)

        print(f"Data prepared: {len(inter_df)} interactions, {len(user_df)} users, {len(item_df)} items")

    def create_train_test_split(self):
        """Create train/test splits with proper timestamp handling"""
        pass

if __name__ == "__main__":
    preparer = MellowiseDataPreparer()
    preparer.extract_user_interactions()
```

### 3. Model Evaluation & Comparison
```python
# ml/scripts/evaluate_models.py
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import mlflow

class ModelComparator:
    """Compare and analyze different recommendation models"""

    def __init__(self, experiment_name: str):
        self.experiment_name = experiment_name
        mlflow.set_experiment(experiment_name)

    def compare_models(self, models: list):
        """Compare model performance across metrics"""

        results = []

        for model_name in models:
            # Get MLflow runs for this model
            runs = mlflow.search_runs(
                experiment_ids=[mlflow.get_experiment_by_name(self.experiment_name).experiment_id],
                filter_string=f"params.model = '{model_name}'"
            )

            if not runs.empty:
                best_run = runs.loc[runs['metrics.NDCG@10'].idxmax()]
                results.append({
                    'model': model_name,
                    'ndcg_10': best_run['metrics.NDCG@10'],
                    'recall_10': best_run['metrics.Recall@10'],
                    'precision_10': best_run['metrics.Precision@10'],
                    'training_time': best_run['metrics.training_time']
                })

        df = pd.DataFrame(results)

        # Plot comparison
        fig, axes = plt.subplots(2, 2, figsize=(12, 10))

        metrics = ['ndcg_10', 'recall_10', 'precision_10', 'training_time']
        titles = ['NDCG@10', 'Recall@10', 'Precision@10', 'Training Time (s)']

        for i, (metric, title) in enumerate(zip(metrics, titles)):
            ax = axes[i//2, i%2]
            sns.barplot(data=df, x='model', y=metric, ax=ax)
            ax.set_title(title)
            ax.tick_params(axis='x', rotation=45)

        plt.tight_layout()
        plt.savefig(f'ml/results/model_comparison_{self.experiment_name}.png')
        plt.show()

        return df

if __name__ == "__main__":
    comparator = ModelComparator("mellowise_recommendation")
    results = comparator.compare_models(['itemknn', 'bpr', 'neumf'])
    print(results)
```

---

## 🔍 Debugging & Troubleshooting

### 1. Common Issues & Solutions
```bash
# SSH Connection Issues
# Add to ~/.ssh/config on M1 MacBook:
Host windows-ml
    HostName YOUR_WINDOWS_IP
    User ml-training
    Port 22
    IdentityFile ~/.ssh/id_rsa
    ServerAliveInterval 60
    ServerAliveCountMax 3

# CUDA Memory Issues on RTX 3090
export CUDA_LAUNCH_BLOCKING=1
export TORCH_USE_CUDA_DSA=1

# RecBole Data Loading Issues
# Check data format and file permissions
ls -la ml/data/processed/
head ml/data/processed/mellowise_interactions.inter
```

### 2. Performance Monitoring
```python
# ml/scripts/performance_monitor.py
import psutil
import GPUtil
import time
import csv
from datetime import datetime

def monitor_system_resources(duration_hours: int = 1):
    """Monitor system resources during training"""

    filename = f"ml/logs/system_monitor_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"

    with open(filename, 'w', newline='') as csvfile:
        fieldnames = ['timestamp', 'cpu_percent', 'memory_percent', 'gpu_utilization', 'gpu_memory', 'gpu_temp']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        end_time = time.time() + (duration_hours * 3600)

        while time.time() < end_time:
            try:
                gpus = GPUtil.getGPUs()
                gpu = gpus[0] if gpus else None

                row = {
                    'timestamp': datetime.now().isoformat(),
                    'cpu_percent': psutil.cpu_percent(),
                    'memory_percent': psutil.virtual_memory().percent,
                    'gpu_utilization': gpu.load * 100 if gpu else 0,
                    'gpu_memory': gpu.memoryUtil * 100 if gpu else 0,
                    'gpu_temp': gpu.temperature if gpu else 0
                }

                writer.writerow(row)
                print(f"CPU: {row['cpu_percent']:.1f}% | RAM: {row['memory_percent']:.1f}% | "
                      f"GPU: {row['gpu_utilization']:.1f}% | GPU Mem: {row['gpu_memory']:.1f}%")

                time.sleep(30)  # Log every 30 seconds

            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"Monitoring error: {e}")
                time.sleep(30)

    print(f"Resource monitoring saved to: {filename}")

if __name__ == "__main__":
    monitor_system_resources(2)  # Monitor for 2 hours
```

### 3. Experiment Recovery
```python
# ml/scripts/recover_experiment.py
import mlflow
import torch
from pathlib import Path

def recover_interrupted_training(run_id: str):
    """Recover from interrupted training run"""

    # Get run information
    run = mlflow.get_run(run_id)

    # Download model checkpoint if available
    try:
        artifact_path = mlflow.artifacts.download_artifacts(f"runs:/{run_id}/model")
        print(f"Model recovered to: {artifact_path}")

        # Load checkpoint
        checkpoint = torch.load(Path(artifact_path) / "model.pth")
        print(f"Checkpoint epoch: {checkpoint.get('epoch', 'unknown')}")

        return checkpoint

    except Exception as e:
        print(f"Recovery failed: {e}")
        return None

def list_interrupted_runs(experiment_name: str):
    """Find potentially interrupted runs"""

    mlflow.set_experiment(experiment_name)
    runs = mlflow.search_runs(
        filter_string="attributes.status != 'FINISHED'"
    )

    print(f"Found {len(runs)} interrupted runs:")
    for _, run in runs.iterrows():
        print(f"  Run ID: {run['run_id'][:8]}... | Status: {run['status']} | Start: {run['start_time']}")

    return runs

if __name__ == "__main__":
    interrupted = list_interrupted_runs("mellowise_recommendation")
    if not interrupted.empty:
        latest_run = interrupted.iloc[0]['run_id']
        recover_interrupted_training(latest_run)
```

---

## 📈 Production Integration

### 1. Model Serving Preparation
```python
# ml/serving/model_server.py
from fastapi import FastAPI
import torch
import numpy as np
from typing import List, Dict
import joblib

app = FastAPI(title="Mellowise Recommendation API")

class RecommendationService:
    """Production recommendation service"""

    def __init__(self, model_path: str):
        self.model = self.load_model(model_path)
        self.item_encoder = joblib.load("ml/models/item_encoder.pkl")
        self.user_encoder = joblib.load("ml/models/user_encoder.pkl")

    def load_model(self, model_path: str):
        # Load trained RecBole model
        pass

    @app.post("/recommend")
    def get_recommendations(self, user_id: str, num_recommendations: int = 10):
        """Get recommendations for user"""

        # Encode user
        user_encoded = self.user_encoder.transform([user_id])[0]

        # Generate recommendations
        recommendations = self.model.predict(user_encoded, k=num_recommendations)

        # Decode items
        recommended_items = self.item_encoder.inverse_transform(recommendations)

        return {
            "user_id": user_id,
            "recommendations": recommended_items.tolist(),
            "model_version": "1.0.0"
        }

# Integration with Next.js API
@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": True}

if __name__ == "__main__":
    import uvicorn
    service = RecommendationService("ml/models/production_model.pth")
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 2. CI/CD Integration
```yaml
# .github/workflows/ml-pipeline.yml
name: ML Pipeline

on:
  push:
    branches: [ml-dev]
    paths: ['ml/**']

jobs:
  test-models:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'

    - name: Install dependencies
      run: |
        pip install -r ml/requirements-dev.txt

    - name: Run model tests
      run: |
        cd ml && python -m pytest tests/ -v

    - name: Data validation
      run: |
        python ml/scripts/validate_data.py

  deploy-model:
    needs: test-models
    runs-on: self-hosted  # Your Windows machine
    if: github.ref == 'refs/heads/ml-dev'
    steps:
    - name: Pull latest code
      run: git pull origin ml-dev

    - name: Activate environment
      run: conda activate mellowise

    - name: Run training pipeline
      run: python ml/scripts/automated_training.py

    - name: Update production model
      run: python ml/scripts/deploy_model.py
```

---

## 🎯 Quick Reference

### Essential Commands Cheat Sheet
```bash
# M1 MacBook Development
mldev                                    # Start ML development environment
create_experiment "baseline_itemknn"     # Create new experiment
syncml                                   # Quick commit and push ML changes
jupyter lab --port=8888                 # Start Jupyter Lab
code ml/                                # Open ML directory in VS Code

# Windows Training (via SSH)
winconnect                              # SSH to Windows machine
conda activate mellowise                # Activate Python environment
python ml/training/train_recommender.py # Start training
tensorboard --logdir=experiments       # Start TensorBoard
nvidia-smi                              # Check GPU status

# Monitoring & Debugging
ssh -L 6006:localhost:6006 ml-training@IP  # TensorBoard tunnel
python ml/scripts/monitor_training.py      # Real-time monitoring
python ml/scripts/recover_experiment.py    # Recover interrupted runs

# Production
python ml/serving/model_server.py          # Start model server
python ml/scripts/deploy_model.py          # Deploy to production
```

### File Structure Reference
```
ml/
├── configs/           # RecBole and experiment configurations
├── data/
│   ├── raw/          # Raw data from Supabase
│   └── processed/    # RecBole-formatted data
├── experiments/      # Experiment logs and configs
├── models/           # Trained model artifacts
├── notebooks/        # Jupyter notebooks for exploration
├── scripts/          # Automation and helper scripts
├── serving/          # Production model serving code
├── training/         # Training scripts and utilities
├── tests/            # Unit tests for ML code
└── requirements-dev.txt  # Python dependencies
```

This workflow provides a complete ML development environment integrated with your existing Mellowise Next.js application, optimized for the M1 MacBook + Windows RTX 3090 setup.