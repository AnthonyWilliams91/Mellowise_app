#!/bin/bash

echo '🔥 Installing PyTorch with CUDA Support'
echo '======================================='
echo ''

# Activate conda environment
source ~/miniconda3/bin/activate
conda activate mellowise_ml

echo 'Current environment:'
echo "  - Python: $(python --version)"
echo "  - Conda env: $CONDA_DEFAULT_ENV"
echo ''

# Remove CPU-only PyTorch
echo '1. Removing CPU-only PyTorch...'
pip uninstall torch torchvision torchaudio -y

echo ''
echo '2. Installing PyTorch with CUDA 12.1 support...'
# Use CUDA 12.1 compatible version
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

echo ''
echo '3. Creating CUDA test script...'
cat > ~/test_cuda_pytorch.py << "PYTEST"
import torch
import sys

print("🧪 CUDA + PyTorch Test")
print("=" * 23)
print(f"Python version: {sys.version}")
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"CUDA version: {torch.version.cuda}")
    print(f"cuDNN version: {torch.backends.cudnn.version()}")
    print(f"GPU count: {torch.cuda.device_count()}")
    
    for i in range(torch.cuda.device_count()):
        gpu = torch.cuda.get_device_properties(i)
        print(f"GPU {i}: {gpu.name}")
        print(f"  Memory: {gpu.total_memory / 1e9:.1f} GB")
        print(f"  Compute capability: {gpu.major}.{gpu.minor}")
    
    # Quick GPU computation test
    print("\n🚀 Testing GPU computation...")
    try:
        device = torch.device("cuda:0")
        x = torch.randn(1000, 1000, device=device)
        y = torch.randn(1000, 1000, device=device)
        z = torch.matmul(x, y)
        print(f"✅ GPU computation successful! Result shape: {z.shape}")
        print(f"   Device: {z.device}")
        
        # Performance comparison
        import time
        
        # CPU test
        x_cpu = torch.randn(1000, 1000)
        y_cpu = torch.randn(1000, 1000)
        start = time.time()
        z_cpu = torch.matmul(x_cpu, y_cpu)
        cpu_time = time.time() - start
        
        # GPU test
        x_gpu = torch.randn(1000, 1000, device=device)
        y_gpu = torch.randn(1000, 1000, device=device)
        torch.cuda.synchronize()
        start = time.time()
        z_gpu = torch.matmul(x_gpu, y_gpu)
        torch.cuda.synchronize()
        gpu_time = time.time() - start
        
        print(f"\n⚡ Performance comparison:")
        print(f"   CPU time: {cpu_time:.4f}s")
        print(f"   GPU time: {gpu_time:.4f}s")
        print(f"   Speedup: {cpu_time/gpu_time:.1f}x")
        
    except Exception as e:
        print(f"❌ GPU computation failed: {e}")
else:
    print("❌ CUDA not available")
    print("\nTroubleshooting:")
    print("1. Ensure NVIDIA drivers are installed on Windows")
    print("2. Ensure CUDA toolkit is installed in WSL2")
    print("3. Check environment variables (PATH, LD_LIBRARY_PATH)")

# Test RecBole with potential GPU support
print("\n📚 Testing RecBole...")
try:
    import recbole
    print(f"RecBole version: {recbole.__version__}")
    print("✅ RecBole import successful")
except ImportError as e:
    print(f"❌ RecBole import failed: {e}")

print("\n🎯 Ready for ML training!")
PYTEST

echo ''
echo '✅ PyTorch CUDA installation complete!'
echo ''
echo 'To test CUDA + PyTorch:'
echo '  conda activate mellowise_ml'
echo '  python ~/test_cuda_pytorch.py'
