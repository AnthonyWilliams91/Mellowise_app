#!/bin/bash

echo '🚀 Installing CUDA Toolkit for WSL2'
echo '=================================='
echo ''
echo 'This script will install CUDA 12.2 for WSL2 GPU support'
echo 'You will be prompted for your sudo password.'
echo ''

# Check if nvidia-smi is already available (Windows driver)
echo '1. Checking Windows NVIDIA driver...'
if command -v nvidia-smi.exe &> /dev/null; then
    echo '✅ Windows NVIDIA driver found'
    nvidia-smi.exe
else
    echo '⚠️  Windows NVIDIA driver not found in PATH'
    echo 'Please ensure NVIDIA drivers are installed on Windows'
fi

echo ''
echo '2. Updating package list...'
sudo apt update

echo ''
echo '3. Installing prerequisites...'
sudo apt install -y wget build-essential

echo ''
echo '4. Adding NVIDIA CUDA repository...'
if [ ! -f cuda-keyring_1.0-1_all.deb ]; then
    wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.0-1_all.deb
fi
sudo dpkg -i cuda-keyring_1.0-1_all.deb
sudo apt update

echo ''
echo '5. Installing CUDA Toolkit 12.2...'
sudo apt install -y cuda-toolkit-12-2

echo ''
echo '6. Setting up environment variables...'
echo 'export PATH=/usr/local/cuda-12.2/bin:/Users/awill314/.nvm/versions/node/v22.16.0/bin:/Users/awill314/opt/anaconda3/bin:/Users/awill314/opt/anaconda3/condabin:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin:/Library/Apple/usr/bin' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda-12.2/lib64:' >> ~/.bashrc
echo 'export CUDA_HOME=/usr/local/cuda-12.2' >> ~/.bashrc

# Source the new environment
export PATH=/usr/local/cuda-12.2/bin:/Users/awill314/.nvm/versions/node/v22.16.0/bin:/Users/awill314/opt/anaconda3/bin:/Users/awill314/opt/anaconda3/condabin:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin:/Library/Apple/usr/bin
export LD_LIBRARY_PATH=/usr/local/cuda-12.2/lib64:
export CUDA_HOME=/usr/local/cuda-12.2

echo ''
echo '7. Verifying CUDA installation...'
if command -v nvcc &> /dev/null; then
    echo '✅ CUDA compiler found!'
    nvcc --version
else
    echo '⚠️  CUDA compiler not found in PATH'
fi

if command -v nvidia-smi &> /dev/null; then
    echo '✅ NVIDIA System Management Interface found!'
    nvidia-smi
else
    echo '⚠️  nvidia-smi not found - this is expected in WSL2'
    echo '    GPU access will be available through CUDA runtime'
fi

echo ''
echo '8. Testing CUDA runtime...'
if [ -f /usr/local/cuda-12.2/samples/1_Utilities/deviceQuery/deviceQuery ]; then
    echo 'Running CUDA device query...'
    /usr/local/cuda-12.2/samples/1_Utilities/deviceQuery/deviceQuery
else
    echo 'CUDA samples not found, but toolkit should be installed'
fi

echo ''
echo '✅ CUDA installation complete!'
echo ''
echo 'Next steps:'
echo '1. Restart your shell or run: source ~/.bashrc'
echo '2. Install PyTorch with CUDA support'
echo '3. Test GPU access with Python'
