# WSL2 GPU ML Training Setup Guide

## Production-Ready Windows WSL2 with RTX 3090 for Remote ML Development

This guide provides a comprehensive setup for WSL2 with GPU support on Windows, optimized for ML training with RTX 3090 and remote access from M1 MacBook.

---

## Table of Contents

1. [Prerequisites & System Requirements](#prerequisites--system-requirements)
2. [WSL2 Installation & Configuration](#wsl2-installation--configuration)
3. [NVIDIA GPU Support Setup](#nvidia-gpu-support-setup)
4. [Network Configuration for Remote Access](#network-configuration-for-remote-access)
5. [ML Environment Setup](#ml-environment-setup)
6. [Port Forwarding & Service Configuration](#port-forwarding--service-configuration)
7. [Security Hardening](#security-hardening)
8. [Performance Optimization](#performance-optimization)
9. [Troubleshooting & Monitoring](#troubleshooting--monitoring)
10. [MacBook Development Workflow](#macbook-development-workflow)

---

## Prerequisites & System Requirements

### Windows System Requirements
- Windows 10 version 2004+ (Build 19041+) or Windows 11
- NVIDIA RTX 3090 with latest drivers (535.xx+)
- Minimum 32GB RAM (64GB recommended for large ML models)
- Fast NVMe SSD with 500GB+ free space
- Administrator access

### Network Requirements
- Static IP or DDNS for Windows machine
- Router with port forwarding capabilities
- Stable internet connection (1Gbps+ recommended)

### MacBook Prerequisites
- SSH client (built-in Terminal)
- VS Code with Remote-SSH extension
- Network access to Windows machine

---

## WSL2 Installation & Configuration

### Step 1: Enable Required Windows Features

Open PowerShell as Administrator and run:

```powershell
# Enable WSL and Virtual Machine Platform
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart required
Restart-Computer
```

### Step 2: Install WSL2 and Ubuntu 22.04

```powershell
# Download and install WSL2 kernel update
# Download from: https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi

# Set WSL2 as default version
wsl --set-default-version 2

# Install Ubuntu 22.04 LTS
wsl --install -d Ubuntu-22.04
```

### Step 3: Configure WSL2 Resource Limits

Create/edit `%USERPROFILE%\.wslconfig`:

```ini
[wsl2]
# Limit memory usage (adjust based on your system)
memory=24GB
# Limit processor usage
processors=12
# Enable nested virtualization
nestedVirtualization=true
# Increase swap file size
swap=8GB
# Disable page reporting (improves performance)
pageReporting=false
# Enable localhost forwarding
localhostForwarding=true
# Enable GUI support
guiApplications=true
```

Restart WSL after creating this file:
```powershell
wsl --shutdown
wsl
```

### Step 4: Initial Ubuntu Configuration

Launch Ubuntu and complete setup:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    tree \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Configure Git (adjust with your details)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## NVIDIA GPU Support Setup

### Step 1: Install NVIDIA Drivers on Windows

1. Download latest NVIDIA Game Ready Driver (535.xx+) from [NVIDIA website](https://www.nvidia.com/drivers/)
2. Install with default settings
3. Verify installation in Device Manager

### Step 2: Install NVIDIA Container Toolkit in WSL2

```bash
# Add NVIDIA package repository
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://nvidia.github.io/libnvidia-container/stable/deb/$(ARCH) /" | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

# Update package list
sudo apt update

# Install NVIDIA Container Toolkit
sudo apt install -y nvidia-container-toolkit

# Install NVIDIA utils
sudo apt install -y nvidia-utils-535
```

### Step 3: Verify GPU Access

```bash
# Check if GPU is accessible
nvidia-smi

# Expected output should show RTX 3090 details
# If command not found, GPU passthrough is not working
```

### Step 4: Install CUDA Toolkit

```bash
# Download and install CUDA 12.2 (compatible with RTX 3090)
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
sudo dpkg -i cuda-keyring_1.0-1_all.deb
sudo apt update
sudo apt install -y cuda-toolkit-12-2

# Add CUDA to PATH
echo 'export PATH=/usr/local/cuda-12.2/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda-12.2/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc

# Verify CUDA installation
nvcc --version
```

---

## Network Configuration for Remote Access

### Step 1: Configure SSH Server in WSL2

```bash
# Install OpenSSH server
sudo apt install -y openssh-server

# Configure SSH
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
sudo nano /etc/ssh/sshd_config
```

Edit SSH configuration:
```
# /etc/ssh/sshd_config
Port 2222
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding yes
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
```

```bash
# Generate SSH key pair on MacBook (run on MacBook)
ssh-keygen -t ed25519 -C "macbook-to-wsl2"

# Copy public key to WSL2 (from MacBook)
ssh-copy-id -p 2222 username@windows-ip

# Start SSH service
sudo systemctl enable ssh
sudo systemctl start ssh

# Verify SSH is running
sudo systemctl status ssh
```

### Step 2: Windows Firewall Configuration

In Windows PowerShell (Administrator):

```powershell
# Allow SSH port through Windows Firewall
New-NetFirewallRule -DisplayName "WSL2 SSH" -Direction Inbound -Port 2222 -Protocol TCP -Action Allow

# Allow common ML ports
New-NetFirewallRule -DisplayName "TensorBoard" -Direction Inbound -Port 6006 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Jupyter" -Direction Inbound -Port 8888 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "FastAPI" -Direction Inbound -Port 8000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Streamlit" -Direction Inbound -Port 8501 -Protocol TCP -Action Allow
```

### Step 3: Router Port Forwarding

Configure your router to forward these ports to your Windows machine:
- 2222 → Internal IP:2222 (SSH)
- 6006 → Internal IP:6006 (TensorBoard)
- 8888 → Internal IP:8888 (Jupyter)
- 8000 → Internal IP:8000 (FastAPI)
- 8501 → Internal IP:8501 (Streamlit)

### Step 4: WSL2 Port Forwarding Script

Create a PowerShell script to handle WSL2 port forwarding:

```powershell
# wsl2-port-forward.ps1
# Run as Administrator

$ports = @(2222, 6006, 8888, 8000, 8501)
$wsl_ip = (wsl hostname -I).Trim()

# Remove existing forwarding rules
foreach ($port in $ports) {
    netsh interface portproxy delete v4tov4 listenport=$port
}

# Add new forwarding rules
foreach ($port in $ports) {
    netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wsl_ip
    Write-Host "Forwarding port $port to WSL2 IP $wsl_ip"
}

# Show current port forwarding
netsh interface portproxy show all
```

Run this script on Windows startup or after WSL2 restart.

---

## ML Environment Setup

### Step 1: Install Python and Package Managers

```bash
# Install Python 3.11
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Install pip and virtual environment tools
sudo apt install -y python3-pip python3-venv python3-dev

# Install conda (optional but recommended)
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh -b -p $HOME/miniconda3
echo 'export PATH="$HOME/miniconda3/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Step 2: Create ML Development Environment

```bash
# Create conda environment for ML
conda create -n ml-gpu python=3.11 -y
conda activate ml-gpu

# Install PyTorch with CUDA support
conda install pytorch torchvision torchaudio pytorch-cuda=12.1 -c pytorch -c nvidia

# Install core ML libraries
pip install \
    tensorflow[and-cuda] \
    transformers \
    datasets \
    accelerate \
    wandb \
    tensorboard \
    jupyter \
    jupyterlab \
    ipywidgets \
    matplotlib \
    seaborn \
    pandas \
    numpy \
    scikit-learn \
    opencv-python \
    pillow \
    requests

# Verify GPU access in PyTorch
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}'); print(f'GPU count: {torch.cuda.device_count()}'); print(f'GPU name: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"None\"}')"

# Verify TensorFlow GPU
python -c "import tensorflow as tf; print('GPU available:', len(tf.config.list_physical_devices('GPU')) > 0)"
```

### Step 3: Install Development Tools

```bash
# Install Node.js (for any web interfaces)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker (for containerized training)
sudo apt install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# Install NVIDIA Docker support
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://nvidia.github.io/libnvidia-container/stable/deb/$(ARCH) /" | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt update
sudo apt install -y nvidia-docker2
sudo systemctl restart docker

# Test Docker with GPU
sudo docker run --rm --gpus all nvidia/cuda:12.2-runtime-ubuntu22.04 nvidia-smi
```

---

## Port Forwarding & Service Configuration

### Step 1: Create Service Management Scripts

Create `~/ml-services/start-services.sh`:

```bash
#!/bin/bash
# ML Services Startup Script

# Activate ML environment
source ~/miniconda3/bin/activate ml-gpu

# Start Jupyter Lab
nohup jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root > ~/ml-services/jupyter.log 2>&1 &

# Start TensorBoard (if needed)
# nohup tensorboard --logdir=./logs --host=0.0.0.0 --port=6006 > ~/ml-services/tensorboard.log 2>&1 &

echo "Services started. Check logs in ~/ml-services/"
echo "Jupyter Lab: http://$(hostname -I | awk '{print $1}'):8888"
```

Create `~/ml-services/stop-services.sh`:

```bash
#!/bin/bash
# Stop all ML services

pkill -f jupyter
pkill -f tensorboard
echo "All ML services stopped"
```

Make scripts executable:
```bash
mkdir -p ~/ml-services
chmod +x ~/ml-services/*.sh
```

### Step 2: Configure Jupyter Lab

```bash
# Generate Jupyter config
jupyter lab --generate-config

# Create Jupyter password
jupyter lab password
```

Edit `~/.jupyter/jupyter_lab_config.py`:

```python
c.ServerApp.ip = '0.0.0.0'
c.ServerApp.port = 8888
c.ServerApp.open_browser = False
c.ServerApp.allow_root = True
c.ServerApp.token = ''  # Use password instead
c.ServerApp.allow_remote_access = True
c.ServerApp.notebook_dir = '/home/username/ml-projects'
```

### Step 3: Systemd Service for Auto-start

Create `/etc/systemd/system/ml-services.service`:

```ini
[Unit]
Description=ML Services (Jupyter Lab)
After=network.target

[Service]
Type=forking
User=username
WorkingDirectory=/home/username
ExecStart=/home/username/ml-services/start-services.sh
ExecStop=/home/username/ml-services/stop-services.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable the service:
```bash
sudo systemctl enable ml-services
sudo systemctl start ml-services
sudo systemctl status ml-services
```

---

## Security Hardening

### Step 1: SSH Security

Create `~/.ssh/config` on MacBook:

```
Host wsl2-gpu
    HostName your-external-ip-or-domain
    Port 2222
    User username
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
    ServerAliveCountMax 3
    Compression yes
```

### Step 2: Fail2Ban Protection

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Configure fail2ban for SSH
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

Edit fail2ban configuration:
```ini
[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
```

```bash
# Start fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Step 3: UFW Firewall

```bash
# Install and configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp  # SSH
sudo ufw allow 8888/tcp  # Jupyter
sudo ufw allow 6006/tcp  # TensorBoard
sudo ufw enable
```

### Step 4: Regular Security Updates

Create automated update script `~/scripts/security-updates.sh`:

```bash
#!/bin/bash
# Automated security updates

# Update package lists
sudo apt update

# Install security updates
sudo apt upgrade -y

# Update conda packages
source ~/miniconda3/bin/activate ml-gpu
conda update --all -y

# Update pip packages
pip install --upgrade pip
pip list --outdated --format=freeze | grep -v '^\-e' | cut -d = -f 1 | xargs -n1 pip install -U

# Clean up
sudo apt autoremove -y
sudo apt autoclean

echo "Security updates completed at $(date)"
```

Add to crontab for weekly updates:
```bash
crontab -e
# Add line: 0 2 * * 0 /home/username/scripts/security-updates.sh >> /home/username/logs/updates.log 2>&1
```

---

## Performance Optimization

### Step 1: System Performance Tuning

```bash
# Install performance monitoring tools
sudo apt install -y htop iotop nvtop

# Optimize file system performance
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf

# Apply settings
sudo sysctl -p
```

### Step 2: CUDA Optimization

Create `~/.bashrc` additions:

```bash
# CUDA optimization
export CUDA_VISIBLE_DEVICES=0
export CUDA_CACHE_PATH=/tmp/cuda_cache
export PYTHONPATH="${PYTHONPATH}:/usr/local/cuda/lib64"

# PyTorch optimizations
export TORCH_CUDA_ARCH_LIST="8.6"  # RTX 3090 architecture
export CUDA_LAUNCH_BLOCKING=0

# TensorFlow optimizations
export TF_GPU_ALLOCATOR=cuda_malloc_async
export TF_ENABLE_GPU_GARBAGE_COLLECTION=false
```

### Step 3: Storage Optimization

```bash
# Create optimized directories for ML data
mkdir -p ~/ml-projects/{data,models,logs,notebooks,scripts}
mkdir -p /tmp/ml-cache

# Set up fast temp storage for datasets
echo 'export ML_CACHE_DIR=/tmp/ml-cache' >> ~/.bashrc
echo 'export HF_DATASETS_CACHE=/tmp/ml-cache/huggingface' >> ~/.bashrc
```

### Step 4: Memory Management

Create `~/scripts/memory-monitor.sh`:

```bash
#!/bin/bash
# Monitor memory usage and clean cache when needed

MEMORY_THRESHOLD=90
GPU_MEMORY_THRESHOLD=90

while true; do
    # Check system memory
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')

    if [ $MEMORY_USAGE -gt $MEMORY_THRESHOLD ]; then
        echo "High memory usage detected: ${MEMORY_USAGE}%"
        # Clear caches
        sync && echo 3 | sudo tee /proc/sys/vm/drop_caches
    fi

    # Check GPU memory
    GPU_USAGE=$(nvidia-smi --query-gpu=memory.used,memory.total --format=csv,noheader,nounits | awk -F', ' '{printf "%.0f", $1/$2 * 100}')

    if [ $GPU_USAGE -gt $GPU_MEMORY_THRESHOLD ]; then
        echo "High GPU memory usage detected: ${GPU_USAGE}%"
        # Log warning - manual intervention needed
        echo "$(date): High GPU memory usage: ${GPU_USAGE}%" >> ~/logs/gpu-memory.log
    fi

    sleep 30
done
```

---

## Troubleshooting & Monitoring

### Step 1: Monitoring Setup

Create comprehensive monitoring script `~/scripts/system-monitor.sh`:

```bash
#!/bin/bash
# System monitoring dashboard

clear
echo "=== WSL2 ML System Monitor ==="
echo "Timestamp: $(date)"
echo ""

# System info
echo "=== System Resources ==="
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print "  " $1 "%"}'

echo "Memory Usage:"
free -h | grep Mem | awk '{printf "  Used: %s / %s (%.1f%%)\n", $3, $2, $3/$2*100}'

echo "Disk Usage:"
df -h / | tail -1 | awk '{printf "  Used: %s / %s (%s)\n", $3, $2, $5}'

echo ""

# GPU info
echo "=== GPU Status ==="
nvidia-smi --query-gpu=name,temperature.gpu,memory.used,memory.total,utilization.gpu --format=csv,noheader

echo ""

# Network info
echo "=== Network Status ==="
echo "WSL2 IP: $(hostname -I | awk '{print $1}')"
echo "Active connections:"
netstat -tuln | grep -E ':(2222|8888|6006|8000|8501)' | head -5

echo ""

# Service status
echo "=== Service Status ==="
systemctl --user is-active jupyter 2>/dev/null && echo "Jupyter: Running" || echo "Jupyter: Stopped"
pgrep tensorboard > /dev/null && echo "TensorBoard: Running" || echo "TensorBoard: Stopped"

echo ""

# Recent logs
echo "=== Recent Issues ==="
tail -n 3 ~/ml-services/jupyter.log 2>/dev/null | grep -i error || echo "No recent errors"
```

Make it executable and add alias:
```bash
chmod +x ~/scripts/system-monitor.sh
echo "alias monitor='~/scripts/system-monitor.sh'" >> ~/.bashrc
```

### Step 2: Common Issue Solutions

Create troubleshooting script `~/scripts/fix-common-issues.sh`:

```bash
#!/bin/bash
# Fix common WSL2 GPU issues

echo "Running WSL2 GPU troubleshooting..."

# Fix 1: GPU not detected
if ! nvidia-smi > /dev/null 2>&1; then
    echo "GPU not detected. Restarting WSL..."
    # Run from Windows: wsl --shutdown && wsl
    echo "Please run 'wsl --shutdown && wsl' from Windows PowerShell"
fi

# Fix 2: Port forwarding issues
echo "Updating port forwarding..."
WSL_IP=$(hostname -I | awk '{print $1}')
echo "Current WSL2 IP: $WSL_IP"
echo "Update Windows port forwarding with this IP"

# Fix 3: SSH connection issues
echo "Checking SSH service..."
sudo systemctl restart ssh
sudo systemctl status ssh --no-pager

# Fix 4: Clear CUDA cache
echo "Clearing CUDA cache..."
rm -rf /tmp/cuda_cache/*

# Fix 5: Reset conda environment
if conda info --envs | grep -q ml-gpu; then
    echo "ML environment found"
else
    echo "Recreating ML environment..."
    conda create -n ml-gpu python=3.11 -y
fi

echo "Troubleshooting complete!"
```

### Step 3: Automated Health Checks

Create health check script `~/scripts/health-check.sh`:

```bash
#!/bin/bash
# Automated health check

LOG_FILE=~/logs/health-check.log
mkdir -p ~/logs

{
    echo "=== Health Check $(date) ==="

    # GPU check
    if nvidia-smi > /dev/null 2>&1; then
        echo "✓ GPU accessible"
    else
        echo "✗ GPU not accessible"
    fi

    # Python ML libraries
    if python -c "import torch; print('PyTorch CUDA:', torch.cuda.is_available())" 2>/dev/null; then
        echo "✓ PyTorch GPU support"
    else
        echo "✗ PyTorch GPU support failed"
    fi

    if python -c "import tensorflow as tf; print('TF GPU:', len(tf.config.list_physical_devices('GPU')))" 2>/dev/null; then
        echo "✓ TensorFlow GPU support"
    else
        echo "✗ TensorFlow GPU support failed"
    fi

    # Service checks
    if curl -s http://localhost:8888 > /dev/null; then
        echo "✓ Jupyter Lab accessible"
    else
        echo "✗ Jupyter Lab not accessible"
    fi

    # Disk space
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ $DISK_USAGE -lt 80 ]; then
        echo "✓ Disk space OK ($DISK_USAGE%)"
    else
        echo "⚠ Disk space warning ($DISK_USAGE%)"
    fi

    echo "===================="
    echo ""
} >> $LOG_FILE

# Keep only last 100 health checks
tail -n 1000 $LOG_FILE > $LOG_FILE.tmp && mv $LOG_FILE.tmp $LOG_FILE
```

Add to crontab for hourly checks:
```bash
# crontab -e
# 0 * * * * /home/username/scripts/health-check.sh
```

---

## MacBook Development Workflow

### Step 1: SSH Configuration

Create optimized SSH config on MacBook `~/.ssh/config`:

```
Host wsl2-gpu
    HostName your-domain-or-ip
    Port 2222
    User username
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
    ServerAliveCountMax 3
    Compression yes
    ForwardAgent yes
    # Tunnel common ML ports
    LocalForward 8888 localhost:8888  # Jupyter
    LocalForward 6006 localhost:6006  # TensorBoard
    LocalForward 8000 localhost:8000  # FastAPI

# Quick connections
Host wsl2-jupyter
    HostName your-domain-or-ip
    Port 2222
    User username
    IdentityFile ~/.ssh/id_ed25519
    LocalForward 8888 localhost:8888

Host wsl2-tensorboard
    HostName your-domain-or-ip
    Port 2222
    User username
    IdentityFile ~/.ssh/id_ed25519
    LocalForward 6006 localhost:6006
```

### Step 2: VS Code Remote Development

Install VS Code extensions:
- Remote - SSH
- Python
- Jupyter
- GitLens

VS Code settings for remote development (`settings.json`):

```json
{
    "remote.SSH.remotePlatform": {
        "wsl2-gpu": "linux"
    },
    "python.defaultInterpreterPath": "/home/username/miniconda3/envs/ml-gpu/bin/python",
    "jupyter.jupyterServerType": "remote",
    "python.terminal.activateEnvironment": true,
    "remote.SSH.connectTimeout": 60,
    "remote.SSH.serverInstallPath": {
        "wsl2-gpu": "/home/username/.vscode-server"
    }
}
```

### Step 3: Efficient Workflow Scripts

Create MacBook helper scripts:

`~/bin/connect-wsl2`:
```bash
#!/bin/bash
# Quick connect to WSL2 GPU server

case "$1" in
    "jupyter")
        ssh -L 8888:localhost:8888 wsl2-gpu
        ;;
    "tensorboard")
        ssh -L 6006:localhost:6006 wsl2-gpu
        ;;
    "full")
        ssh -L 8888:localhost:8888 -L 6006:localhost:6006 -L 8000:localhost:8000 wsl2-gpu
        ;;
    *)
        ssh wsl2-gpu
        ;;
esac
```

`~/bin/sync-code`:
```bash
#!/bin/bash
# Sync code to WSL2 server

LOCAL_DIR="$HOME/Development/ml-projects"
REMOTE_DIR="username@your-domain:/home/username/ml-projects"

# Sync excluding common build/cache directories
rsync -avz --exclude='*.pyc' --exclude='__pycache__' --exclude='.git' --exclude='node_modules' \
    "$LOCAL_DIR/" "$REMOTE_DIR/"

echo "Code synced to WSL2 server"
```

`~/bin/gpu-status`:
```bash
#!/bin/bash
# Check remote GPU status

ssh wsl2-gpu 'nvidia-smi --query-gpu=name,temperature.gpu,memory.used,memory.total,utilization.gpu --format=csv'
```

Make scripts executable:
```bash
chmod +x ~/bin/{connect-wsl2,sync-code,gpu-status}
```

### Step 4: Development Best Practices

1. **Code Organization**:
   ```
   ~/ml-projects/
   ├── experiments/     # Training experiments
   ├── models/         # Saved models
   ├── data/           # Datasets
   ├── notebooks/      # Jupyter notebooks
   └── scripts/        # Utility scripts
   ```

2. **Git Workflow**:
   - Keep model files in `.gitignore`
   - Use Git LFS for large files
   - Separate branches for experiments

3. **Resource Management**:
   - Monitor GPU memory usage regularly
   - Use gradient checkpointing for large models
   - Implement proper cleanup in training scripts

4. **Remote Development Tips**:
   - Use tmux/screen for persistent sessions
   - Set up automatic model checkpointing
   - Monitor training progress with TensorBoard
   - Use Weights & Biases for experiment tracking

---

## Quick Start Checklist

### Initial Setup (One-time)
- [ ] Enable WSL2 and Virtual Machine Platform on Windows
- [ ] Install Ubuntu 22.04 in WSL2
- [ ] Configure `.wslconfig` file
- [ ] Install NVIDIA drivers on Windows
- [ ] Set up CUDA in WSL2
- [ ] Configure SSH server with key authentication
- [ ] Set up Windows firewall and router port forwarding
- [ ] Install ML environment (conda, PyTorch, TensorFlow)
- [ ] Configure Jupyter Lab and services
- [ ] Set up monitoring and health check scripts

### Daily Development Workflow
- [ ] Connect to WSL2 via SSH from MacBook
- [ ] Activate ML conda environment
- [ ] Start required services (Jupyter, TensorBoard)
- [ ] Sync code from MacBook to WSL2
- [ ] Monitor GPU usage during training
- [ ] Check system health periodically

### Maintenance Tasks (Weekly)
- [ ] Run security updates
- [ ] Check disk usage and clean cache
- [ ] Review health check logs
- [ ] Backup important models and results
- [ ] Update ML libraries

---

## Performance Benchmarks & Expectations

### RTX 3090 Performance Targets
- **Memory**: 24GB VRAM available
- **FP32 Performance**: ~35.6 TFLOPS
- **Tensor Performance**: ~142 TFLOPS (with mixed precision)
- **Memory Bandwidth**: 936 GB/s

### Typical Training Performance
- **BERT-Base**: ~8-12 samples/second
- **GPT-2 Medium**: ~4-6 samples/second
- **ResNet-50**: ~300-400 images/second
- **Stable Diffusion**: ~1.5-2 iterations/second

### Network Performance
- **SSH Latency**: <50ms on local network
- **File Sync**: 100MB/s+ over gigabit connection
- **Jupyter Response**: <100ms for code execution
- **TensorBoard**: Real-time metric updates

---

This comprehensive guide provides a production-ready setup for ML training on WSL2 with RTX 3090, optimized for seamless remote development from MacBook. The configuration balances performance, security, and usability for professional ML workflows.