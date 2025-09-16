#!/bin/bash

echo '🐍 Setting up Mellowise ML Environment'
echo '======================================'
echo ''

# Activate conda
source ~/miniconda3/bin/activate

# Create environment
echo '1. Creating mellowise_ml environment with Python 3.9...'
conda create -n mellowise_ml python=3.9 -y

# Activate environment
echo '2. Activating mellowise_ml environment...'
conda activate mellowise_ml

# Install PyTorch with CUDA support
echo '3. Installing PyTorch with CUDA 11.8 support...'
conda install pytorch torchvision torchaudio pytorch-cuda=11.8 -c pytorch -c nvidia -y

# Install ML libraries
echo '4. Installing ML libraries...'
pip install recbole tensorboard jupyter pandas numpy scikit-learn matplotlib seaborn

# Create test script
echo '5. Creating GPU test script...'
cat > ~/test_gpu.py << 'PYTEST'
import torch
import sys

print("Python version:", sys.version)
print("PyTorch version:", torch.__version__)
print("CUDA available:", torch.cuda.is_available())

if torch.cuda.is_available():
    print("GPU device:", torch.cuda.get_device_name(0))
    print("CUDA version:", torch.version.cuda)
    
    # Quick GPU test
    x = torch.randn(1000, 1000).cuda()
    y = torch.randn(1000, 1000).cuda()
    z = torch.matmul(x, y)
    print("GPU computation successful:", z.shape)
else:
    print("No GPU detected. Please check CUDA installation.")

# Test RecBole import
try:
    import recbole
    print("RecBole version:", recbole.__version__)
    print("RecBole import successful!")
except ImportError as e:
    print("RecBole import failed:", e)
PYTEST

echo ''
echo '✅ Environment setup complete!'
echo ''
echo 'To activate and test:'
echo '  conda activate mellowise_ml'
echo '  python ~/test_gpu.py'
