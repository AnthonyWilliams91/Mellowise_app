#!/bin/bash

# Mellowise ML Development Helper Scripts
# Source this file: source ml/scripts/dev_helpers.sh

# Configuration - Update these values for your setup
WINDOWS_ML_IP="YOUR_WINDOWS_IP"
WINDOWS_ML_USER="ml-training"

# Aliases for quick access
alias mldev='cd ~/Development/Mellowise_app/ml && source venv/bin/activate && code .'
alias winconnect="ssh ${WINDOWS_ML_USER}@${WINDOWS_ML_IP}"
alias syncml='git add ml/ && git commit -m "ML: $(date +%H:%M)" && git push origin ml-dev'

# Quick experiment setup
create_experiment() {
    local exp_name=$1
    if [ -z "$exp_name" ]; then
        echo "Usage: create_experiment <experiment_name>"
        return 1
    fi

    local exp_dir="ml/experiments/exp_$(date +%Y%m%d_%H%M)_$exp_name"

    mkdir -p "$exp_dir"
    cd "$exp_dir"

    # Copy template config if it exists
    if [ -f "../../configs/template_config.yaml" ]; then
        cp ../../configs/template_config.yaml config.yaml
    else
        # Create basic config template
        cat > config.yaml << EOF
experiment:
  name: "$exp_name"
  description: "Experiment created $(date)"

model:
  type: "ItemKNN"
  params:
    k: 20
    shrink: 100

data:
  dataset: "mellowise_interactions"
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
    fi

    # Create experiment notebook
    cat > experiment.ipynb << EOF
{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Experiment: $exp_name\\n",
    "\\n",
    "**Created:** $(date)\\n",
    "**Objective:** [Describe your experiment objective here]\\n",
    "\\n",
    "## Setup"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "source": [
    "import pandas as pd\\n",
    "import numpy as np\\n",
    "import matplotlib.pyplot as plt\\n",
    "import seaborn as sns\\n",
    "\\n",
    "# RecBole imports\\n",
    "from recbole.config import Config\\n",
    "from recbole.data import create_dataset, data_preparation\\n",
    "\\n",
    "# Mellowise ML imports\\n",
    "import sys\\n",
    "sys.path.append('../../')\\n",
    "from configs.recbole_config import MellowiseRecBoleConfig"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "name": "python",
   "version": "3.10.0"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}
EOF

    echo "✅ Experiment created: $exp_dir"
    echo "📝 Config: $exp_dir/config.yaml"
    echo "📓 Notebook: $exp_dir/experiment.ipynb"

    # Open in VS Code if available
    if command -v code &> /dev/null; then
        code experiment.ipynb
    fi

    cd - > /dev/null
}

# Quick training start
start_training() {
    local model=$1
    local config=$2

    if [ -z "$model" ] || [ -z "$config" ]; then
        echo "Usage: start_training <model_name> <config_path>"
        echo "Available models: itemknn, bpr, neumf"
        return 1
    fi

    echo "🚀 Starting training: $model with config $config"

    # Sync to Windows
    echo "📤 Syncing code to Windows..."
    git add . && git commit -m "Training: $model $(date +%H:%M)" && git push origin ml-dev

    # Execute on Windows
    echo "🖥️  Executing training on Windows..."
    ssh ${WINDOWS_ML_USER}@${WINDOWS_ML_IP} "
        cd C:/mellowise-ml &&
        git pull origin ml-dev &&
        conda activate mellowise &&
        python ml/training/train_recommender.py --config $config --model $model --gpu 0
    "
}

# Monitor training progress
monitor_training() {
    echo "🔍 Setting up training monitoring..."

    # Start TensorBoard tunnel
    echo "📊 Opening TensorBoard tunnel..."
    ssh -L 6006:localhost:6006 ${WINDOWS_ML_USER}@${WINDOWS_ML_IP} -N &
    TUNNEL_PID=$!

    sleep 3

    # Open TensorBoard in browser (macOS)
    if command -v open &> /dev/null; then
        open http://localhost:6006
    else
        echo "🌐 TensorBoard available at: http://localhost:6006"
    fi

    echo "⚡ Monitoring GPU usage (Ctrl+C to stop)..."
    echo "📊 TensorBoard PID: $TUNNEL_PID (kill with: kill $TUNNEL_PID)"

    # Monitor GPU usage
    trap "kill $TUNNEL_PID 2>/dev/null" EXIT
    watch -n 2 "ssh ${WINDOWS_ML_USER}@${WINDOWS_ML_IP} 'nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,nounits,noheader'"
}

# Quick status check
ml_status() {
    echo "🔍 Mellowise ML Environment Status"
    echo "=================================="

    # Check if in ML directory
    if [[ $PWD == *"/ml"* ]]; then
        echo "📁 Directory: ✅ In ML workspace"
    else
        echo "📁 Directory: ⚠️  Not in ML workspace"
    fi

    # Check Python environment
    if [[ "$VIRTUAL_ENV" != "" ]]; then
        echo "🐍 Python Env: ✅ Virtual environment active"
        echo "   Path: $VIRTUAL_ENV"
    else
        echo "🐍 Python Env: ⚠️  No virtual environment active"
    fi

    # Check Windows connection
    if ssh -o BatchMode=yes -o ConnectTimeout=5 ${WINDOWS_ML_USER}@${WINDOWS_ML_IP} exit 2>/dev/null; then
        echo "🖥️  Windows ML: ✅ Connection available"

        # Check GPU status
        gpu_status=$(ssh ${WINDOWS_ML_USER}@${WINDOWS_ML_IP} "nvidia-smi --query-gpu=utilization.gpu --format=csv,nounits,noheader" 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo "🚀 GPU Status: ✅ RTX 3090 available (${gpu_status}% utilization)"
        else
            echo "🚀 GPU Status: ⚠️  Cannot check GPU"
        fi
    else
        echo "🖥️  Windows ML: ❌ Connection failed"
    fi

    # Check Git status
    git_status=$(git status --porcelain ml/ 2>/dev/null)
    if [ -z "$git_status" ]; then
        echo "📦 Git Status: ✅ ML directory clean"
    else
        echo "📦 Git Status: ⚠️  Uncommitted changes in ml/"
    fi

    # Check experiments
    exp_count=$(find ml/experiments -maxdepth 1 -type d -name "exp_*" 2>/dev/null | wc -l)
    echo "🧪 Experiments: $exp_count total"

    echo ""
    echo "🚀 Quick Commands:"
    echo "   mldev              - Setup development environment"
    echo "   create_experiment  - Create new experiment"
    echo "   start_training     - Start remote training"
    echo "   monitor_training   - Monitor training progress"
    echo "   ml_status          - Show this status"
}

# Setup development environment
setup_ml_env() {
    echo "🚀 Setting up Mellowise ML development environment..."

    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        echo "🐍 Creating Python virtual environment..."
        python3 -m venv venv
    fi

    # Activate virtual environment
    source venv/bin/activate

    # Install dependencies
    echo "📦 Installing ML dependencies..."
    pip install --upgrade pip
    pip install -r requirements-dev.txt

    # Create .gitkeep files
    touch data/raw/.gitkeep
    touch data/processed/.gitkeep
    touch models/.gitkeep
    touch experiments/.gitkeep
    touch logs/.gitkeep

    echo "✅ ML development environment ready!"
    echo "🎯 Run 'ml_status' to check your setup"
}

# Export functions
export -f create_experiment start_training monitor_training ml_status setup_ml_env

echo "🎯 Mellowise ML Development Helpers Loaded!"
echo "📚 Available commands: create_experiment, start_training, monitor_training, ml_status, setup_ml_env"
echo "🔧 Update WINDOWS_ML_IP and WINDOWS_ML_USER in this file for your setup"