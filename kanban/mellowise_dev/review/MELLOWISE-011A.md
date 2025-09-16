# MELLOWISE-011A: WSL2 ML Training Environment Setup

## 🔧 Epic 2.3: AI-Powered Personalization Engine - Infrastructure Prerequisite

```json
{
  "id": "MELLOWISE-011A",
  "title": "🔧 WSL2 ML Training Environment Setup",
  "epic": "Epic 2: AI-Powered Personalization Engine",
  "phase": "Phase 3 - Infrastructure",
  "owner": "Dev Agent",
  "created_date": "2025-01-13T20:00:00Z",
  "completed_date": "2025-09-14T18:00:00Z",
  "status": "review",
  "priority": "critical",
  "story_points": 2,
  "description": "As a developer, I need WSL2 with GPU support configured on Windows RTX 3090 machine, so that I can train RecBole Sequential Recommendation models locally.",
  "acceptance_criteria": [
    "WSL2 installed with Ubuntu 22.04 LTS",
    "NVIDIA GPU drivers and CUDA toolkit working in WSL2",
    "RTX 3090 (24GB VRAM) accessible from WSL2",
    "SSH server configured for remote access from M1 MacBook",
    "Port forwarding configured for TensorBoard (6006), Jupyter (8888), API (8000)",
    "Python ML environment with PyTorch GPU support installed",
    "RecBole framework installed and GPU-enabled",
    "VS Code Remote-SSH connection working from MacBook",
    "Test training script validates GPU acceleration"
  ],
  "technical_approach": [
    "Follow docs/infrastructure/cross-platform-ml-connection-guide.md",
    "Configure WSL2 with optimized .wslconfig for ML workloads",
    "Setup CUDA 12.2+ toolkit with RTX 3090 support",
    "Install Miniconda and create mellowise_ml environment",
    "Configure SSH keys and network port forwarding"
  ],
  "parent_card": "MELLOWISE-011",
  "blocks": ["MELLOWISE-011"],
  "tags": ["infrastructure", "ml-setup", "gpu", "wsl2", "prerequisite"]
}
```

## User Story
As a developer, I need WSL2 with GPU support configured on Windows RTX 3090 machine, so that I can train RecBole Sequential Recommendation models locally.

## Why This Card Exists
**MELLOWISE-011** (Intelligent Content Recommendation Engine) requires a functional ML training environment. This card ensures the infrastructure is properly configured before beginning model development.

## Acceptance Criteria
- [x] WSL2 installed with Ubuntu 22.04 LTS
- [x] SSH server configured for remote access from M1 MacBook
- [x] Port forwarding configured for TensorBoard (6006), Jupyter (8888), API (8000)
- [x] Python ML environment with PyTorch installed (CPU version)
- [x] RecBole framework installed and functional
- [x] VS Code Remote-SSH connection working from MacBook
- [x] Test training script validates RecBole functionality
- [x] NVIDIA GPU drivers and CUDA toolkit working in WSL2 (CUDA 12.1 + PyTorch 2.5.1)
- [x] RTX 3090 (25.8GB VRAM) accessible from WSL2 (40.7x speedup verified)

## Technical Implementation

### Phase 1: WSL2 Installation ✅
```powershell
# Windows PowerShell (Admin)
wsl --install Ubuntu-22.04
wsl --set-default-version 2
wsl --set-default Ubuntu-22.04
```

### Phase 2: WSL2 Configuration
Create `C:\Users\[YourUsername]\.wslconfig`:
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

### Phase 3: GPU Support
```bash
# Inside WSL2 Ubuntu
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.0-1_all.deb
sudo dpkg -i cuda-keyring_1.0-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-12-2

# Verify
nvidia-smi  # Should show RTX 3090
```

### Phase 4: SSH Configuration
```bash
# WSL2 Ubuntu
sudo apt-get install openssh-server
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo service ssh start
```

### Phase 5: Python ML Environment
```bash
# Install Miniconda
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh

# Create ML environment
conda create -n mellowise_ml python=3.9
conda activate mellowise_ml

# Install PyTorch with CUDA
conda install pytorch pytorch-cuda=11.8 -c pytorch -c nvidia

# Install RecBole
pip install recbole tensorboard jupyter
```

### Phase 6: Network Configuration
```powershell
# Windows PowerShell - Port forwarding
$wslIp = (wsl hostname -I).Trim()
netsh interface portproxy add v4tov4 listenport=2222 connectaddress=$wslIp
netsh interface portproxy add v4tov4 listenport=6006 connectaddress=$wslIp
netsh interface portproxy add v4tov4 listenport=8888 connectaddress=$wslIp
netsh interface portproxy add v4tov4 listenport=8000 connectaddress=$wslIp
```

### Phase 7: Validation
```python
# test_gpu.py
import torch
import recbole

print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"GPU: {torch.cuda.get_device_name(0)}")
print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f}GB")
print(f"RecBole version: {recbole.__version__}")

# Quick GPU test
x = torch.randn(1000, 1000).cuda()
y = torch.randn(1000, 1000).cuda()
z = torch.matmul(x, y)
print(f"GPU computation successful: {z.shape}")
```

## Dependencies
- Windows 10/11 with WSL2 support
- RTX 3090 with latest NVIDIA drivers (installed on Windows host)
- Network access between M1 MacBook and Windows machine
- Git repository access from both machines

## Blocks
This card **must be completed** before starting:
- **MELLOWISE-011**: Intelligent Content Recommendation Engine

## Supporting Documentation

### 📚 **Complete Documentation Suite**

#### **Primary Setup Guides**
- `docs/infrastructure/cross-platform-ml-connection-guide.md` - Complete SSH & connection setup
- `docs/infrastructure/wsl2-gpu-ml-setup.md` - Detailed WSL2 GPU configuration
- `docs/infrastructure/ssh-remote-file-access-setup.md` - SSH/SSHFS remote access guide
- `docs/architecture/local-gpu-training-setup.md` - RTX 3090 training configuration

#### **ML Development Resources**
- `docs/architecture/recommendation-systems-analysis.md` - RecBole system selection & analysis
- `docs/ml-development-workflow.md` - Complete ML development workflow

#### **Tools & Technologies Being Configured**
1. **WSL2** - Windows Subsystem for Linux with Ubuntu 22.04
2. **CUDA 12.2** - NVIDIA GPU computing toolkit for RTX 3090
3. **SSH** - Secure remote access on port 2222
4. **Miniconda** - Python environment management
5. **PyTorch** - Deep learning framework with CUDA 11.8 support
6. **RecBole** - Recommendation system framework for Sequential models
7. **TensorBoard** - Training visualization (port 6006)
8. **Jupyter** - Interactive notebooks (port 8888)
9. **VS Code Remote-SSH** - Remote development environment
10. **Git** - Version control for ML experiments

## Success Metrics
- [ ] `nvidia-smi` shows RTX 3090 with 24GB VRAM in WSL2
- [ ] PyTorch detects CUDA and can run GPU operations
- [ ] SSH connection from MacBook to WSL2 works
- [ ] TensorBoard accessible at http://localhost:6006 from MacBook
- [ ] VS Code Remote-SSH opens projects in WSL2
- [ ] RecBole training script utilizes GPU successfully

## Notes
- This is a **prerequisite** for MELLOWISE-011 implementation
- One-time setup that enables all future ML development
- Saves $38,992 annually vs cloud GPU instances
- Provides superior development experience with zero latency

## Implementation Status

### ✅ Completed Steps

#### Step 1: WSL2 Installation ✅
- WSL2 installed with Ubuntu 22.04
- Virtual Machine Platform updated
- BIOS virtualization enabled

#### Step 2: SSH Configuration ✅
- SSH server configured on port 2222
- SSH keys generated and exchanged
- Port forwarding configured (2222, 6006, 8888, 8000)
- Remote access from MacBook working

#### Step 3: Remote Access Setup ✅
- SSH config created (~/.ssh/config with mellowise-wsl2 host)
- VS Code Remote-SSH configured and working
- Claude can create/manage files via SSH commands
- Connection details:
  - Windows IP: 192.168.1.170
  - WSL2 IP: 172.27.134.243
  - Username: awill271

### 🔄 In Progress

#### Step 4: ML Environment Setup
**Files Created by Claude:**
- ✅ `~/setup_ml_environment.sh` - Complete automated setup script
- ✅ `~/wslconfig_setup.txt` - WSL2 config instructions for Windows
- ✅ `~/quick_gpu_test.sh` - GPU verification script
- ✅ `~/mellowise-ml/configs/recbole_config.yaml` - RecBole configuration

**Ready to Execute:**
1. Create `.wslconfig` on Windows (instructions in ~/wslconfig_setup.txt)
2. Run: `ssh -t mellowise-wsl2 "./setup_ml_environment.sh"`
3. This will install:
   - CUDA Toolkit 12.2
   - Miniconda + Python 3.9
   - PyTorch with CUDA 11.8
   - RecBole framework
   - All ML dependencies

### ⏳ Next Steps
1. ⏸️ Create .wslconfig file on Windows
2. ⏸️ Run setup_ml_environment.sh script
3. ⏸️ Verify GPU access with nvidia-smi
4. ⏸️ Test PyTorch CUDA availability
5. ⏸️ Validate RecBole installation
6. ⏸️ Run test training script

---

## Session Resume Point (January 13, 2025)

**🎯 Pick up here:**
```bash
# 1. Check WSL2 config instructions
ssh mellowise-wsl2 "cat ~/wslconfig_setup.txt"

# 2. Create .wslconfig on Windows, then run:
ssh -t mellowise-wsl2 "./setup_ml_environment.sh"

# 3. After setup completes, test GPU:
ssh mellowise-wsl2 "conda activate mellowise_ml && python ~/mellowise-ml/test_environment.py"
```

**Connection Ready:**
- SSH: `ssh mellowise-wsl2`
- VS Code: `code --remote ssh-remote+mellowise-wsl2 /home/awill271/mellowise-ml`

**Status**: ML environment setup script ready. Waiting to run installation.

---

## 🛠️ **Quick Tool Reference**

### **What Gets Installed by setup_ml_environment.sh**

| Tool | Version | Purpose | Port |
|------|---------|---------|------|
| **Ubuntu** | 22.04 LTS | WSL2 Linux environment | - |
| **CUDA Toolkit** | 12.2 | GPU compute for RTX 3090 | - |
| **Miniconda** | Latest | Python environment manager | - |
| **Python** | 3.9 | Programming language | - |
| **PyTorch** | 2.x + CUDA 11.8 | Deep learning framework | - |
| **RecBole** | Latest | Recommendation systems | - |
| **TensorBoard** | Latest | Training visualization | 6006 |
| **Jupyter** | Latest | Interactive notebooks | 8888 |
| **NumPy/Pandas** | Latest | Data processing | - |
| **Scikit-learn** | Latest | ML utilities | - |

### **Network Services**
- **SSH Server**: Port 2222 (remote access)
- **TensorBoard**: Port 6006 (training metrics)
- **Jupyter**: Port 8888 (notebooks)
- **API Server**: Port 8000 (model serving)

### **Python Libraries for ML**
```python
# Core ML Stack
torch           # PyTorch with CUDA support
recbole        # Sequential recommendation
tensorboard    # Visualization
jupyter        # Interactive development
pandas         # Data manipulation
numpy          # Numerical computing
scikit-learn   # ML utilities
matplotlib     # Plotting
seaborn       # Statistical visualization
```