# Local RTX 3090 ML Training Setup for Mellowise

**Hardware**: RTX 3090 (24GB VRAM), Ryzen 7 5800X, 32GB RAM (Windows Desktop)
**Development**: M1 Pro MacBook (primary development) + Windows RTX 3090 (ML training)
**Project**: Sequential Recommendation System for LSAT/GRE/MCAT/GMAT
**Framework**: RecBole + PyTorch
**Timeline**: 2-3 months development

---

## 🚀 **Business Case: Exceptional ROI**

### **Cost Analysis Summary**
- **Local RTX 3090**: $2,700 total investment
- **Cloud Alternative**: $10,850 for 3 months
- **Annual Savings**: $38,992
- **ROI**: 1,444% annually
- **Break-even**: 0.5 months

### **Development Advantages**
- **Zero Latency**: Immediate experimentation vs 20-minute cloud setup
- **Unlimited Iterations**: No billing concerns for R&D
- **Superior Control**: Direct GPU access, custom optimization
- **24/7 Availability**: No instance availability issues

---

## 💻 **Cross-Platform Development Workflow**

### **M1 Pro MacBook + Windows RTX 3090 Setup**

#### **Development Architecture**
```
M1 Pro MacBook (Primary)          Windows RTX 3090 (Training)
├── VS Code / Claude              ├── WSL2 Ubuntu / Native Windows
├── Next.js Development           ├── CUDA + PyTorch + RecBole
├── API Development               ├── Model Training Pipeline
├── Git Repository                ├── TensorBoard Server
└── SSH/RDP Client                └── Model Export Service
```

#### **Option 1: WSL2 on Windows (Recommended)**
```bash
# On Windows RTX 3090 Desktop - Enable WSL2 with GPU support
wsl --install Ubuntu-22.04
wsl --set-version Ubuntu-22.04 2

# Inside WSL2 Ubuntu
sudo apt update && sudo apt upgrade -y
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.0-1_all.deb
sudo dpkg -i cuda-keyring_1.0-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda

# Verify GPU access in WSL2
nvidia-smi  # Should show RTX 3090
```

#### **Option 2: Native Windows with Anaconda**
```powershell
# Windows PowerShell - Install Anaconda
# Download from https://www.anaconda.com/products/individual

# Create ML environment
conda create -n mellowise_ml python=3.9
conda activate mellowise_ml
conda install pytorch torchvision torchaudio pytorch-cuda=11.8 -c pytorch -c nvidia
pip install recbole tensorboard jupyter
```

### **Remote Development Setup**

#### **SSH Access from MacBook to Windows**
```bash
# On Windows - Enable OpenSSH Server
# Settings → Apps → Optional Features → Add OpenSSH Server

# On MacBook - Connect to Windows
ssh username@windows-ip-address
# Or use VS Code Remote-SSH extension

# Configure SSH key for passwordless access
ssh-keygen -t ed25519 -C "mellowise-ml"
ssh-copy-id username@windows-ip-address
```

#### **Shared Development Workflow**
```bash
# On MacBook - Development workflow
git clone https://github.com/yourusername/mellowise.git
cd mellowise

# Develop data pipeline and API
code .  # Open in VS Code

# Push changes to GitHub
git add .
git commit -m "feat: Add RecBole data pipeline"
git push origin feature/sequential-recommendations

# On Windows - Pull and train
git pull origin feature/sequential-recommendations
conda activate mellowise_ml
python train_sequential_model.py

# Monitor training from MacBook
ssh username@windows-ip "tail -f logs/training.log"
# Or access TensorBoard remotely
ssh -L 6006:localhost:6006 username@windows-ip
# Open http://localhost:6006 on MacBook
```

### **Jupyter Notebook Remote Access**
```bash
# On Windows RTX 3090
jupyter notebook --no-browser --port=8888 --ip=0.0.0.0

# On MacBook - SSH tunnel
ssh -L 8888:localhost:8888 username@windows-ip
# Access at http://localhost:8888
```

### **Model Sync Strategy**
```python
# sync_models.py - Automated model sync
import paramiko
import os
from pathlib import Path

class ModelSync:
    def __init__(self, windows_host, username, key_path):
        self.ssh = paramiko.SSHClient()
        self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.ssh.connect(windows_host, username=username, key_filename=key_path)

    def download_trained_model(self, remote_path, local_path):
        """Download trained model from Windows to MacBook"""
        sftp = self.ssh.open_sftp()
        sftp.get(remote_path, local_path)
        print(f"✅ Model downloaded: {local_path}")

    def upload_to_production(self, model_path):
        """Upload model to production API server"""
        # Integration with Vercel/Supabase deployment
        pass

# Usage
sync = ModelSync("192.168.1.100", "username", "~/.ssh/id_ed25519")
sync.download_trained_model(
    "/mnt/c/mellowise/models/best_model.onnx",
    "./api/models/sequential_rec.onnx"
)
```

### **VS Code Configuration**
```json
// .vscode/settings.json
{
  "remote.SSH.defaultHost": "windows-rtx3090",
  "python.defaultInterpreterPath": "~/anaconda3/envs/mellowise_ml/bin/python",
  "jupyter.jupyterServerType": "remote",
  "python.terminal.activateEnvironment": true
}
```

---

## 🛠️ **Environment Setup**

### **System Requirements Verification**
```bash
# Verify RTX 3090 detection
nvidia-smi
# Expected: RTX 3090, 24GB VRAM, CUDA 12.x

# Check system specs
lscpu | grep "CPU(s):"     # Verify 16 threads (8-core)
free -h | grep "Mem:"      # Verify 32GB RAM
df -h | grep "/$"          # Verify storage space (>500GB recommended)
```

### **CUDA and Driver Setup**
```bash
# Install NVIDIA drivers (if needed)
sudo ubuntu-drivers autoinstall

# Verify CUDA installation
nvcc --version
# Required: CUDA 11.8+ for PyTorch compatibility

# Set environment variables
echo 'export CUDA_HOME=/usr/local/cuda' >> ~/.bashrc
echo 'export PATH=$PATH:$CUDA_HOME/bin' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=$CUDA_HOME/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

### **Python ML Environment**
```bash
# Create isolated environment
conda create -n mellowise_ml python=3.9 -y
conda activate mellowise_ml

# Install PyTorch with CUDA support
conda install pytorch pytorch-cuda=11.8 -c pytorch -c nvidia -y

# Verify GPU detection in PyTorch
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}'); print(f'GPU: {torch.cuda.get_device_name(0)}')"
# Expected: CUDA available: True, GPU: NVIDIA GeForce RTX 3090

# Install RecBole and dependencies
pip install recbole==1.1.1
pip install pandas numpy scipy scikit-learn
pip install supabase-py python-dotenv cryptography
pip install tensorboard wandb jupyter
pip install onnx onnxruntime-gpu
pip install gpustat nvitop
```

---

## 📊 **Data Pipeline Architecture**

### **Secure Production Data Access**
```python
# config/database_config.py
import os
from supabase import create_client, Client
from typing import Dict, List
import pandas as pd

class SecureDataPipeline:
    """Secure connection to Mellowise production data for ML training"""

    def __init__(self):
        # Use read-only database credentials
        self.supabase_url = os.getenv('SUPABASE_URL_READONLY')
        self.supabase_key = os.getenv('SUPABASE_ANON_KEY_READONLY')
        self.client: Client = create_client(self.supabase_url, self.supabase_key)

    def extract_training_data(self, limit: int = 100000) -> pd.DataFrame:
        """Extract sequential interaction data for training"""

        # Query user-question sequences with privacy protection
        query = """
        SELECT
            user_id,
            question_id,
            created_at as timestamp,
            is_correct::int as rating,
            response_time_seconds,
            difficulty_level,
            topic,
            subtopic
        FROM question_attempts
        WHERE created_at >= NOW() - INTERVAL '6 months'
        ORDER BY user_id, created_at
        LIMIT {}
        """.format(limit)

        response = self.client.table('question_attempts').select('*').execute()
        return pd.DataFrame(response.data)

    def prepare_sequential_dataset(self, df: pd.DataFrame) -> Dict:
        """Convert raw data to RecBole format"""

        # Group by user sessions for sequence modeling
        user_sequences = []

        for user_id, group in df.groupby('user_id'):
            # Sort by timestamp to maintain sequence order
            sequence = group.sort_values('timestamp')

            # Create interaction sequence
            user_sequences.append({
                'user_id': user_id,
                'item_id_list': sequence['question_id'].tolist(),
                'timestamp_list': sequence['timestamp'].tolist(),
                'rating_list': sequence['rating'].tolist(),
                'difficulty_list': sequence['difficulty_level'].tolist()
            })

        return {
            'sequences': user_sequences,
            'user_count': len(user_sequences),
            'total_interactions': len(df)
        }

# Example usage
pipeline = SecureDataPipeline()
training_data = pipeline.extract_training_data(limit=50000)
sequential_data = pipeline.prepare_sequential_dataset(training_data)
```

---

## 🤖 **Training Configuration**

### **RTX 3090 Optimized RecBole Config**
```yaml
# config/mellowise_sequential_3090.yaml

# Dataset Configuration
USER_ID_FIELD: user_id
ITEM_ID_FIELD: question_id
TIME_FIELD: timestamp
RATING_FIELD: rating

# Data Loading
load_col:
  inter: [user_id, question_id, timestamp, rating, difficulty_level, topic]
separator: ','
threshold:
  rating: 0  # Include all interactions

# Sequential Configuration
ITEM_LIST_LENGTH_FIELD: sequence_length
LIST_SUFFIX: _list
MAX_ITEM_LIST_LENGTH: 100  # Accommodate longer study sessions
seq_separator: " "

# Training Configuration (RTX 3090 Optimized)
epochs: 200
train_batch_size: 4096     # Optimized for 24GB VRAM
eval_batch_size: 8192      # Larger batches for evaluation
learning_rate: 0.001
weight_decay: 0.0001
train_neg_sample_args:
  distribution: uniform
  sample_num: 1
eval_args:
  split:
    RS: [0.8, 0.1, 0.1]  # 80% train, 10% validation, 10% test
  group_by: user
  order: TO  # Time-based ordering
  mode: full

# Model Configuration
model: SASRec  # Self-Attention Sequential Recommendation
embedding_size: 256
hidden_size: 256
num_layers: 2
num_heads: 2
dropout_prob: 0.2
attention_dropout_prob: 0.2
max_seq_length: 100

# Hardware Configuration
device: cuda
gpu_id: 0
benchmark: True  # Enable CUDA optimizations
train_stage: train_valid_test

# Evaluation Configuration
metrics: ['Recall', 'MRR', 'NDCG', 'Hit', 'Precision']
topk: [5, 10, 20]
valid_metric: MRR@10

# Checkpointing
checkpoint_dir: 'saved/mellowise_sequential/'
save_step: 10
```

### **Training Script Template**
```python
#!/usr/bin/env python3
"""
Mellowise Sequential Recommendation Training
RTX 3090 Optimized Implementation
"""

import os
import torch
import logging
import wandb
from datetime import datetime
from pathlib import Path
from recbole.quick_start import run_recbole
from recbole.utils import init_seed, init_logger

def setup_training_environment():
    """Configure RTX 3090 training environment"""

    # Set CUDA optimizations
    os.environ['CUDA_LAUNCH_BLOCKING'] = '1'
    os.environ['CUDA_CACHE_DISABLE'] = '1'
    torch.backends.cudnn.benchmark = True
    torch.backends.cudnn.deterministic = False

    # Initialize logging
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_dir = Path(f'logs/mellowise_sequential_{timestamp}')
    log_dir.mkdir(parents=True, exist_ok=True)

    init_logger(log_dir)
    init_seed(2024, True)

    # Verify GPU setup
    if not torch.cuda.is_available():
        raise RuntimeError("RTX 3090 not detected - check CUDA installation")

    device = torch.device('cuda:0')
    gpu_props = torch.cuda.get_device_properties(0)

    logging.info(f"Training Device: {gpu_props.name}")
    logging.info(f"VRAM: {gpu_props.total_memory / 1e9:.1f}GB")
    logging.info(f"Compute Capability: {gpu_props.major}.{gpu_props.minor}")

    return device, log_dir

def train_sequential_model():
    """Train Sequential Recommendation Model"""

    device, log_dir = setup_training_environment()

    # Initialize Weights & Biases for monitoring
    wandb.init(
        project="mellowise-sequential-rec",
        config={
            "model": "SASRec",
            "embedding_size": 256,
            "hidden_size": 256,
            "batch_size": 4096,
            "learning_rate": 0.001,
            "hardware": "RTX_3090_24GB"
        }
    )

    # RTX 3090 optimized configuration
    config_dict = {
        'gpu_id': 0,
        'use_gpu': True,
        'device': 'cuda',
        'train_batch_size': 4096,    # RTX 3090 optimized
        'eval_batch_size': 8192,     # Larger evaluation batches
        'epochs': 200,
        'learning_rate': 0.001,
        'embedding_size': 256,
        'hidden_size': 256,
        'num_layers': 2,
        'checkpoint_dir': 'saved/mellowise_sequential/',
        'log_wandb': True,
        'wandb_project': 'mellowise-sequential-rec'
    }

    # Execute training
    print("🚀 Starting Sequential Recommendation Training on RTX 3090")
    print(f"📊 Batch Size: {config_dict['train_batch_size']} (optimized for 24GB VRAM)")

    result = run_recbole(
        model='SASRec',
        dataset='mellowise_lsat_sequences',
        config_dict=config_dict,
        config_file_list=['config/mellowise_sequential_3090.yaml'],
        saved=True
    )

    # Log results
    logging.info(f"✅ Training Complete!")
    logging.info(f"📈 Best Validation MRR@10: {result['best_valid_score']:.4f}")
    logging.info(f"💾 Model saved to: {config_dict['checkpoint_dir']}")

    wandb.log({"final_mrr": result['best_valid_score']})
    wandb.finish()

    return result

if __name__ == "__main__":
    # Monitor GPU before training
    print("🔍 GPU Status Before Training:")
    os.system("nvidia-smi")

    # Train model
    result = train_sequential_model()

    print(f"🎉 Training Complete! Best MRR@10: {result['best_valid_score']:.4f}")
    print("🔍 GPU Status After Training:")
    os.system("nvidia-smi")
```

---

## 📈 **Monitoring and Optimization**

### **Real-time Monitoring Setup**
```bash
# Terminal 1: Training execution
conda activate mellowise_ml
cd /path/to/mellowise_training
python train_sequential_model.py

# Terminal 2: GPU monitoring
watch -n 1 'nvidia-smi --query-gpu=memory.used,memory.free,utilization.gpu,temperature.gpu --format=csv'

# Terminal 3: System monitoring
htop

# Terminal 4: TensorBoard visualization
tensorboard --logdir=logs --port=6006 --bind_all
# Access at http://localhost:6006

# Terminal 5: Weights & Biases (if used)
wandb login
# Monitor at https://wandb.ai/your-project
```

### **Performance Optimization Tips**

1. **Memory Management**
```python
# Clear GPU cache between experiments
torch.cuda.empty_cache()

# Monitor memory usage
print(f"GPU Memory Used: {torch.cuda.memory_allocated()/1e9:.1f}GB")
print(f"GPU Memory Cached: {torch.cuda.memory_reserved()/1e9:.1f}GB")
```

2. **Batch Size Optimization**
```python
# Find optimal batch size
def find_optimal_batch_size(model, device):
    batch_size = 1024
    while batch_size <= 16384:  # RTX 3090 can handle large batches
        try:
            # Test forward pass
            dummy_input = torch.randint(0, 1000, (batch_size, 50)).to(device)
            model(dummy_input)
            print(f"✅ Batch size {batch_size} works")
            batch_size *= 2
        except torch.cuda.OutOfMemoryError:
            print(f"❌ Batch size {batch_size} too large")
            return batch_size // 2
    return batch_size // 2
```

---

## 🚀 **Production Deployment Pipeline**

### **Model Export and API Integration**
```python
# model_export.py
import torch
import onnx
import onnxruntime as ort
from recbole.quick_start import load_data_and_model

def export_model_for_production():
    """Export trained model to production-ready format"""

    # Load trained RecBole model
    config, model, dataset, train_data, valid_data, test_data = load_data_and_model(
        model_file='saved/mellowise_sequential/best_model.pth'
    )

    # Convert to ONNX for fast inference
    model.eval()
    dummy_input = torch.randint(0, dataset.item_num, (1, 50))

    torch.onnx.export(
        model,
        dummy_input,
        "production/mellowise_sequential.onnx",
        export_params=True,
        opset_version=11,
        do_constant_folding=True,
        input_names=['user_sequence'],
        output_names=['recommendations']
    )

    # Test ONNX model
    ort_session = ort.InferenceSession("production/mellowise_sequential.onnx")
    test_output = ort_session.run(None, {"user_sequence": dummy_input.numpy()})

    print("✅ Model exported to production/mellowise_sequential.onnx")
    print(f"📊 Model size: {os.path.getsize('production/mellowise_sequential.onnx') / 1e6:.1f}MB")

    return "production/mellowise_sequential.onnx"

# API integration ready for Next.js backend
def create_recommendation_api(model_path: str):
    """Create FastAPI endpoint for recommendations"""

    from fastapi import FastAPI
    import uvicorn

    app = FastAPI()
    ort_session = ort.InferenceSession(model_path)

    @app.post("/api/recommendations")
    async def get_recommendations(user_sequence: list):
        """Generate Sequential Recommendations"""
        input_data = {"user_sequence": np.array([user_sequence])}
        predictions = ort_session.run(None, input_data)
        return {"recommendations": predictions[0].tolist()}

    return app

if __name__ == "__main__":
    model_path = export_model_for_production()
    app = create_recommendation_api(model_path)
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## ✅ **Implementation Checklist**

### **Phase 1: Environment Setup (Week 1)**
- [ ] Verify RTX 3090 detection and CUDA installation
- [ ] Create isolated Python environment with RecBole
- [ ] Test GPU training with simple model
- [ ] Set up secure data pipeline to production database
- [ ] Configure monitoring tools (TensorBoard, GPU monitoring)

### **Phase 2: Data Preparation (Week 2)**
- [ ] Extract LSAT question sequence data from production
- [ ] Transform to RecBole sequential format
- [ ] Implement FERPA-compliant data anonymization
- [ ] Create training/validation/test splits
- [ ] Validate data quality and sequence integrity

### **Phase 3: Model Training (Week 3-4)**
- [ ] Train SASRec sequential model with RTX 3090 optimization
- [ ] Hyperparameter tuning (learning rate, embedding size, layers)
- [ ] A/B testing preparation with multiple model variants
- [ ] Performance benchmarking (MRR@10, Recall@5, NDCG@20)
- [ ] Model validation against existing FSRS system

### **Phase 4: Integration & Deployment (Week 5-6)**
- [ ] Export model to ONNX format for production inference
- [ ] Create FastAPI recommendation service
- [ ] Integrate with Next.js backend API routes
- [ ] A/B testing framework for Sequential vs. current recommendations
- [ ] Performance monitoring and quality metrics

### **Phase 5: Epic 2 Integration (Week 7-8)**
- [ ] Connect to MELLOWISE-009 learning style profiles
- [ ] Integrate with MELLOWISE-010 adaptive difficulty system
- [ ] Enhance MELLOWISE-012 performance insights with sequential patterns
- [ ] Complete MELLOWISE-011 intelligent content recommendation engine
- [ ] User testing and feedback collection

---

## 🎯 **Success Metrics**

### **Technical Performance**
- **Training Time**: <4 hours per full model training cycle
- **Model Accuracy**: MRR@10 > 0.3 (30% improvement over random)
- **Inference Latency**: <200ms recommendation generation
- **GPU Utilization**: >80% during training (maximizing RTX 3090)

### **Business Impact**
- **Session Completion**: +15% improvement from sequential recommendations
- **User Engagement**: +25% time spent in learning sessions
- **Question Accuracy**: +12% improvement through optimized sequencing
- **Premium Conversion**: +20% conversion from personalized study paths

### **Development Efficiency**
- **Iteration Speed**: <30 minutes per experiment cycle
- **Cost Efficiency**: <$500 total development cost vs. $10,850 cloud
- **Model Quality**: Comparable to or better than cloud-trained models
- **Team Learning**: ML expertise development for future AI initiatives

---

*This RTX 3090 training setup provides Mellowise with world-class ML infrastructure for Sequential Recommendation development while achieving massive cost savings and superior development experience.*