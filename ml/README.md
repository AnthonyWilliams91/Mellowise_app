# Mellowise ML Development

Machine Learning recommendation engine for personalized LSAT question recommendations.

## 🚀 Quick Start

### 1. Initial Setup
```bash
# Run the automated setup script
python ml/scripts/quick_setup.py

# Or manual setup:
cd ml
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements-dev.txt
```

### 2. Configure Windows Training Machine
Edit `ml/scripts/dev_helpers.sh`:
```bash
WINDOWS_ML_IP="192.168.1.100"  # Your Windows IP
WINDOWS_ML_USER="ml-training"   # Your Windows username
```

### 3. Load Development Helpers
```bash
source ml/scripts/dev_helpers.sh
ml_status  # Check your setup
```

### 4. Create Your First Experiment
```bash
create_experiment "baseline_itemknn"
# This creates: ml/experiments/exp_YYYYMMDD_HHMM_baseline_itemknn/
```

### 5. Start Training (on Windows RTX 3090)
```bash
start_training itemknn ml/experiments/exp_20250101_1200_baseline_itemknn/config.yaml
```

### 6. Monitor Training
```bash
monitor_training  # Opens TensorBoard + GPU monitoring
```

## 📁 Directory Structure

```
ml/
├── configs/                    # Model and experiment configurations
│   ├── recbole_config.py      # RecBole model configurations
│   └── template_config.yaml   # Experiment template
├── data/
│   ├── raw/                   # Raw data from Supabase
│   └── processed/             # RecBole-formatted data
├── experiments/               # Individual experiment directories
├── models/                    # Trained model artifacts
│   └── checkpoints/          # Training checkpoints
├── notebooks/                 # Jupyter notebooks for exploration
├── scripts/                   # Automation and helper scripts
├── serving/                   # Production model serving code
├── training/                  # Training scripts and utilities
├── tests/                     # Unit tests for ML code
└── logs/                      # Training and experiment logs
```

## 🔧 Development Workflow

### Daily Development Cycle
1. **M1 MacBook**: Code development, experimentation, prototyping
2. **Windows RTX 3090**: Heavy model training, batch processing
3. **Git**: Sync code between machines via `ml-dev` branch
4. **Remote SSH**: VS Code development directly on Windows
5. **TensorBoard**: Real-time training monitoring

### Key Commands
```bash
# Development helpers (after: source ml/scripts/dev_helpers.sh)
mldev                    # Start ML development environment
create_experiment <name> # Create new experiment
start_training <model>   # Start remote training
monitor_training         # Monitor training progress
ml_status               # Check environment status

# Manual operations
winconnect              # SSH to Windows machine
syncml                  # Quick git commit and push
```

## 🤖 Available Models

### Collaborative Filtering
- **ItemKNN**: Item-based collaborative filtering
- **BPR**: Bayesian Personalized Ranking
- **NeuMF**: Neural Matrix Factorization

### Advanced Models (Future)
- **LightGCN**: Graph Convolutional Network
- **SASRec**: Sequential recommendation

### Model Configuration
Each model has specific parameters in `configs/recbole_config.py`:
```python
# Example: ItemKNN configuration
config = {
    'model': 'ItemKNN',
    'k': 20,              # Number of similar items
    'shrink': 100,        # Shrinkage parameter
    'similarity': 'cosine' # Similarity metric
}
```

## 📊 Experiment Management

### Creating Experiments
```bash
create_experiment "itemknn_baseline"
# Creates: ml/experiments/exp_20250101_1200_itemknn_baseline/
#   ├── config.yaml        # Experiment configuration
#   ├── experiment.ipynb   # Jupyter notebook
#   └── (results after training)
```

### Experiment Configuration (`config.yaml`)
```yaml
experiment:
  name: "itemknn_baseline"
  description: "Baseline ItemKNN model"

model:
  type: "ItemKNN"
  params:
    k: 20
    shrink: 100

training:
  epochs: 100
  batch_size: 1024
  learning_rate: 0.001

evaluation:
  metrics: ["NDCG", "Recall", "Precision"]
  topk: [5, 10, 20]
```

### Training Pipeline
```bash
# Start training on Windows RTX 3090
python ml/training/train_recommender.py \
  --config ml/experiments/my_exp/config.yaml \
  --model itemknn \
  --gpu 0
```

## 📈 Monitoring & Debugging

### TensorBoard
```bash
# Automatic with helper script
monitor_training

# Manual setup
ssh -L 6006:localhost:6006 ml-training@WINDOWS_IP
# Open: http://localhost:6006
```

### MLflow Tracking
- Automatic experiment tracking
- Model versioning and comparison
- Hyperparameter logging
- Artifact storage

### Real-time GPU Monitoring
```bash
# Via monitor_training command
watch -n 2 'ssh ml-training@WINDOWS_IP "nvidia-smi"'
```

## 🔄 Data Pipeline

### Data Sources
- User interactions from Supabase
- Question metadata and difficulty
- User learning profiles and performance

### Data Format (RecBole)
```
mellowise_interactions.inter  # user_id, item_id, rating, timestamp
mellowise_interactions.user   # user_id, learning_style, performance_level
mellowise_interactions.item   # item_id, question_type, difficulty, topic
```

### Data Preparation
```python
# Extract from Supabase and format for RecBole
python ml/scripts/prepare_mellowise_data.py
```

## 🚀 Production Integration

### Model Serving
```bash
# Start FastAPI model server
python ml/serving/model_server.py
# API available at: http://localhost:8000
```

### API Endpoints
- `POST /recommend` - Get recommendations for user
- `GET /health` - Health check
- Integration with Next.js API routes

## 🧪 Testing

### Unit Tests
```bash
cd ml
python -m pytest tests/ -v
```

### Model Validation
```bash
python ml/scripts/validate_model.py --model itemknn
```

## 📝 Best Practices

### Code Organization
- Keep experiments isolated in separate directories
- Use consistent naming conventions
- Document all configuration changes
- Version control all code (not data/models)

### Training Best Practices
- Always use config files for experiments
- Monitor GPU memory usage on RTX 3090
- Use checkpointing for long training runs
- Track all experiments with MLflow

### Development Workflow
- Develop on M1 MacBook for fast iteration
- Train on Windows RTX 3090 for performance
- Use Jupyter for exploration and prototyping
- Use VS Code Remote SSH for debugging

## 🔧 Troubleshooting

### Common Issues

#### SSH Connection Failed
```bash
# Test connection
ssh ml-training@WINDOWS_IP
# Check SSH service on Windows
```

#### CUDA Out of Memory
```bash
# Reduce batch size in config.yaml
training:
  batch_size: 512  # Reduce from 1024
```

#### RecBole Data Loading Error
```bash
# Check data format
head ml/data/processed/mellowise_interactions.inter
# Validate column names and data types
```

#### Virtual Environment Issues
```bash
# Recreate environment
rm -rf ml/venv
python -m venv ml/venv
source ml/venv/bin/activate
pip install -r ml/requirements-dev.txt
```

### Debug Commands
```bash
ml_status                    # Check environment status
python -c "import torch; print(torch.cuda.is_available())"  # Test CUDA
python ml/scripts/validate_data.py                          # Validate data
```

## 📚 Resources

- [RecBole Documentation](https://recbole.io/)
- [MLflow Documentation](https://mlflow.org/)
- [TensorBoard Guide](https://www.tensorflow.org/tensorboard)
- [Complete Workflow Guide](../docs/ml-development-workflow.md)

## 🤝 Contributing

1. Create experiment branch: `git checkout -b exp/your-experiment`
2. Run experiments and commit results
3. Document findings in experiment notebooks
4. Submit PR with experiment summary

---

**🎯 Ready to build intelligent recommendations for Mellowise learners!**