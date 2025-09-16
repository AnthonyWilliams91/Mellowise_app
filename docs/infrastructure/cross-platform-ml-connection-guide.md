# Cross-Platform ML Development Connection Guide

**Setup**: M1 Pro MacBook (Development) + Windows RTX 3090 (Training)
**Goal**: Seamless ML development workflow with remote GPU training
**Framework**: RecBole + PyTorch for Sequential Recommendation System

---

## 🎯 **Quick Start: Recommended Setup**

### **Optimal Configuration**
- **Windows**: WSL2 with Ubuntu 22.04 + GPU support
- **Connection**: SSH with key authentication
- **Monitoring**: TensorBoard remote access
- **Development**: VS Code with Remote-SSH extension

---

## 📋 **Connection Options Overview**

| Method | Setup Time | Performance | Best For |
|--------|------------|-------------|----------|
| **WSL2 + SSH** ⭐ | 30 min | Excellent | Full development workflow |
| **Native Windows + RDP** | 15 min | Good | GUI-based work |
| **Docker + Remote API** | 45 min | Excellent | Containerized training |
| **Jupyter Remote** | 10 min | Good | Interactive experimentation |

---

## 🚀 **Option 1: WSL2 + SSH (RECOMMENDED)**

### **Why This is Optimal**
- ✅ Native Linux environment with full GPU support
- ✅ Seamless SSH integration with MacBook
- ✅ Best performance for ML workloads
- ✅ Easy port forwarding for services
- ✅ VS Code Remote-SSH works perfectly

### **Step-by-Step Setup**

#### **1. Install WSL2 on Windows**
```powershell
# Run in Windows PowerShell as Administrator
wsl --install Ubuntu-22.04
wsl --set-default-version 2
wsl --set-default Ubuntu-22.04

# Restart computer after installation
```

#### **2. Configure WSL2 Resources**
Create `C:\Users\YourUsername\.wslconfig`:
```ini
[wsl2]
memory=24GB
processors=12
localhostForwarding=true
kernelCommandLine=nvidia.NVreg_PreserveVideoMemoryAllocations=1

[experimental]
autoMemoryReclaim=gradual
sparseVhd=true
```

#### **3. Install NVIDIA GPU Support**
```bash
# Inside WSL2 Ubuntu
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.0-1_all.deb
sudo dpkg -i cuda-keyring_1.0-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-12-2

# Verify GPU access
nvidia-smi
# Should show: NVIDIA GeForce RTX 3090, 24GB VRAM
```

#### **4. Setup SSH Server in WSL2**
```bash
# Install and configure SSH
sudo apt-get install openssh-server
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# Start SSH service
sudo service ssh start

# Auto-start SSH on WSL2 boot
echo "sudo service ssh start" >> ~/.bashrc
```

#### **5. Configure SSH Keys from MacBook**
```bash
# On M1 MacBook
ssh-keygen -t ed25519 -C "mellowise-ml-training" -f ~/.ssh/mellowise_ml

# Copy public key to Windows
cat ~/.ssh/mellowise_ml.pub
# Copy this output

# In WSL2 Ubuntu
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

#### **6. Network Configuration**
```powershell
# Windows PowerShell - Get WSL2 IP
wsl hostname -I
# Note this IP (e.g., 172.29.144.1)

# Create port forwarding script: forward_ports.ps1
$wslIp = (wsl hostname -I).Trim()
$ports = @(2222, 6006, 8888, 8000, 5000)

foreach ($port in $ports) {
    netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0
    netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wslIp
}

Write-Host "Port forwarding configured for WSL2 IP: $wslIp"
netsh interface portproxy show all
```

#### **7. Windows Firewall Rules**
```powershell
# Allow ports through Windows Firewall
New-NetFirewallRule -DisplayName "WSL2 SSH" -Direction Inbound -LocalPort 2222 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "WSL2 TensorBoard" -Direction Inbound -LocalPort 6006 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "WSL2 Jupyter" -Direction Inbound -LocalPort 8888 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "WSL2 API" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

### **MacBook Connection Setup**

#### **SSH Configuration**
Create `~/.ssh/config` on MacBook:
```ssh-config
Host mellowise-ml
    HostName YOUR_WINDOWS_IP
    Port 2222
    User YOUR_WSL_USERNAME
    IdentityFile ~/.ssh/mellowise_ml
    ForwardAgent yes
    ServerAliveInterval 60
    ServerAliveCountMax 3

    # Port forwarding for services
    LocalForward 6006 localhost:6006  # TensorBoard
    LocalForward 8888 localhost:8888  # Jupyter
    LocalForward 8000 localhost:8000  # FastAPI
    LocalForward 5000 localhost:5000  # MLflow
```

#### **Quick Connect Script**
Create `~/bin/ml-connect.sh`:
```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Connecting to Mellowise ML Training Environment${NC}"

# Start SSH connection
ssh mellowise-ml -t "
    echo -e '${GREEN}✅ Connected to RTX 3090 Training Server${NC}'
    echo ''
    echo 'GPU Status:'
    nvidia-smi --query-gpu=name,memory.used,memory.free,utilization.gpu --format=csv
    echo ''
    echo 'Active Services:'
    ps aux | grep -E 'tensorboard|jupyter|python' | grep -v grep
    echo ''
    cd ~/mellowise
    exec bash
"
```

---

## 🖥️ **VS Code Remote Development Setup**

### **Install Extensions on MacBook**
```bash
code --install-extension ms-vscode-remote.remote-ssh
code --install-extension ms-python.python
code --install-extension ms-toolsai.jupyter
code --install-extension GitHub.copilot
```

### **VS Code Settings**
Create `.vscode/settings.json` in project:
```json
{
    "remote.SSH.defaultHost": "mellowise-ml",
    "remote.SSH.configFile": "~/.ssh/config",
    "python.defaultInterpreterPath": "/home/username/miniconda3/envs/mellowise_ml/bin/python",
    "python.terminal.activateEnvironment": true,
    "jupyter.jupyterServerType": "remote",
    "terminal.integrated.defaultProfile.linux": "bash",
    "files.watcherExclude": {
        "**/logs/**": true,
        "**/checkpoints/**": true,
        "**/.git/objects/**": true
    }
}
```

### **Quick VS Code Connection**
```bash
# Command palette (Cmd+Shift+P)
Remote-SSH: Connect to Host... → mellowise-ml

# Or from terminal
code --remote ssh-remote+mellowise-ml ~/mellowise
```

---

## 📊 **TensorBoard Remote Monitoring**

### **Start TensorBoard on Windows WSL2**
```bash
# In WSL2
tensorboard --logdir logs --bind_all --port 6006 &

# Or with specific experiment
tensorboard --logdir experiments/exp_001/logs --bind_all
```

### **Access from MacBook**
```bash
# Method 1: Via SSH tunnel (automatic with config)
ssh mellowise-ml
# TensorBoard available at http://localhost:6006

# Method 2: Direct browser access
open http://YOUR_WINDOWS_IP:6006
```

### **TensorBoard Helper Script**
Create `ml/scripts/tb_monitor.sh`:
```bash
#!/bin/bash

# Start or restart TensorBoard with latest experiment
LATEST_EXP=$(ls -t experiments/ | head -1)
echo "📊 Starting TensorBoard for: $LATEST_EXP"

# Kill existing TensorBoard
pkill -f tensorboard

# Start new instance
tensorboard --logdir experiments/$LATEST_EXP/logs \
           --bind_all \
           --port 6006 \
           --reload_interval 30 \
           --samples_per_plugin="scalars=1000,images=100" &

echo "✅ TensorBoard running at http://localhost:6006"
echo "📁 Monitoring: experiments/$LATEST_EXP/logs"
```

---

## 🔬 **Jupyter Notebook Remote Access**

### **Setup Jupyter in WSL2**
```bash
# Install Jupyter
pip install jupyter jupyterlab ipywidgets

# Generate config
jupyter notebook --generate-config

# Set password
jupyter notebook password

# Configure for remote access
echo "c.NotebookApp.ip = '0.0.0.0'" >> ~/.jupyter/jupyter_notebook_config.py
echo "c.NotebookApp.port = 8888" >> ~/.jupyter/jupyter_notebook_config.py
echo "c.NotebookApp.open_browser = False" >> ~/.jupyter/jupyter_notebook_config.py
```

### **Start Jupyter Server**
```bash
# In WSL2
jupyter lab --no-browser --ip=0.0.0.0 --port=8888 &

# Access from MacBook
open http://localhost:8888
```

---

## 🔄 **Automated Sync & Workflow**

### **Git-Based Synchronization**
```bash
# Setup on both machines
git remote add ml-sync git@github.com:yourusername/mellowise-ml.git

# MacBook: Push changes
git add .
git commit -m "feat: Update model architecture"
git push ml-sync feature/sequential-rec

# WSL2: Pull and train
git pull ml-sync feature/sequential-rec
python train_sequential_model.py
```

### **Real-time File Sync (Optional)**
```bash
# Using rsync for instant sync
# On MacBook
fswatch -o . | xargs -n1 -I{} rsync -avz \
    --exclude='.git' \
    --exclude='logs' \
    --exclude='checkpoints' \
    ./ mellowise-ml:~/mellowise/
```

---

## 🛠️ **ML Training Automation**

### **Remote Training Script**
Create `ml/scripts/remote_train.sh` on MacBook:
```bash
#!/bin/bash

CONFIG=$1
EXPERIMENT_NAME=$2

echo "🚀 Starting remote training: $EXPERIMENT_NAME"

# Execute training on Windows
ssh mellowise-ml << EOF
    cd ~/mellowise
    conda activate mellowise_ml

    # Create experiment directory
    mkdir -p experiments/$EXPERIMENT_NAME
    cp $CONFIG experiments/$EXPERIMENT_NAME/config.yaml

    # Start training with GPU monitoring
    nvidia-smi dmon -s mu -d 5 -o T > experiments/$EXPERIMENT_NAME/gpu_usage.log &
    GPU_MON_PID=\$!

    # Run training
    python -u train_sequential_model.py \
        --config experiments/$EXPERIMENT_NAME/config.yaml \
        --experiment $EXPERIMENT_NAME \
        2>&1 | tee experiments/$EXPERIMENT_NAME/training.log

    # Stop GPU monitoring
    kill \$GPU_MON_PID

    echo "✅ Training complete: $EXPERIMENT_NAME"
EOF

# Download results
scp -r mellowise-ml:~/mellowise/experiments/$EXPERIMENT_NAME/results ./experiments/
echo "📥 Results downloaded to ./experiments/$EXPERIMENT_NAME/results"
```

---

## 🎯 **Quick Reference Commands**

### **Daily Workflow**
```bash
# Morning setup
ssh mellowise-ml                    # Connect to training server
ml_status                           # Check environment status
git pull                           # Sync latest code

# Development
code --remote ssh-remote+mellowise-ml  # Open VS Code remotely
create_experiment "test_001"           # Create new experiment
start_training sasrec config.yaml      # Start training

# Monitoring
monitor_training                    # Watch training progress
open http://localhost:6006         # View TensorBoard
check_gpu                          # Monitor GPU usage

# End of day
sync_results                       # Download trained models
git push                          # Push code changes
```

### **Troubleshooting**
```bash
# WSL2 not starting
wsl --shutdown
wsl --start Ubuntu-22.04

# SSH connection failed
ssh -vvv mellowise-ml              # Debug connection

# Port forwarding issues
# Re-run Windows PowerShell script
.\forward_ports.ps1

# GPU not detected
wsl --update                       # Update WSL2 kernel
nvidia-smi                         # Check GPU visibility
```

---

## 📚 **Additional Resources**

### **Documentation References**
- `docs/architecture/recommendation-systems-analysis.md` - System design decisions
- `docs/architecture/local-gpu-training-setup.md` - GPU training configuration
- `docs/infrastructure/wsl2-gpu-ml-setup.md` - Detailed WSL2 setup
- `docs/ml-development-workflow.md` - Complete workflow guide

### **Key Configuration Files**
- `ml/configs/recbole_config.yaml` - RecBole model configuration
- `ml/requirements.txt` - Python dependencies
- `.vscode/settings.json` - VS Code configuration
- `~/.ssh/config` - SSH connection settings

---

## ✅ **Validation Checklist**

Before starting ML development:

- [ ] WSL2 installed with Ubuntu 22.04
- [ ] NVIDIA GPU detected in WSL2 (`nvidia-smi` works)
- [ ] SSH connection from MacBook established
- [ ] Port forwarding configured (2222, 6006, 8888, 8000)
- [ ] VS Code Remote-SSH extension installed
- [ ] Python environment created (mellowise_ml)
- [ ] RecBole and PyTorch installed with GPU support
- [ ] Git repository cloned on both machines
- [ ] TensorBoard accessible from MacBook
- [ ] Test training script runs successfully

---

## 🚀 **Ready to Train!**

With this setup complete, you can:
1. **Develop** on your M1 MacBook with full IDE support
2. **Train** on Windows RTX 3090 with 24GB VRAM
3. **Monitor** training progress from anywhere
4. **Deploy** models directly to production

Start your first training session:
```bash
ssh mellowise-ml
cd ~/mellowise
python train_sequential_model.py --config configs/baseline.yaml
```

Monitor progress:
```bash
open http://localhost:6006  # TensorBoard on MacBook
```

---

*This guide provides everything needed for seamless cross-platform ML development. The WSL2 + SSH setup offers the best balance of performance, flexibility, and developer experience.*