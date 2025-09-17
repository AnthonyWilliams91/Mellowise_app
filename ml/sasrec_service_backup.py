#!/usr/bin/env python3
"""
MELLOWISE-011: Sequential Recommendation Service using RecBole SASRec
Runs on WSL2 RTX 3090 for GPU-accelerated training and inference
"""

import os
import sys
import json
import torch
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

# RecBole imports
from recbole.config import Config
from recbole.data import create_dataset, data_preparation
from recbole.model.sequential_recommender import SASRec
from recbole.trainer import Trainer
from recbole.utils import init_seed, init_logger

# FastAPI for web service
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

@dataclass
class RecommendationRequest:
    user_id: str
    n_recommendations: int = 10
    features: Optional[Dict[str, Any]] = None

@dataclass 
class RecommendationResponse:
    recommendations: List[Dict[str, Any]]
    model_info: Dict[str, str]
    generated_at: str

class MellowiseRecommendationEngine:
    """
    Sequential Recommendation Engine using SASRec for Mellowise
    """
    
    def __init__(self, config_path: str = None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.dataset = None
        self.config = None
        self.item_mapping = {}
        self.user_mapping = {}
        
        print(f"🚀 Initializing Mellowise Recommendation Engine")
        print(f"Device: {self.device}")
        if torch.cuda.is_available():
            print(f"GPU: {torch.cuda.get_device_name(0)}")
            print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f}GB")
        
        self.setup_config(config_path)
        
    def setup_config(self, config_path: Optional[str] = None):
        """Setup RecBole configuration for SASRec"""
        config_dict = {
            # Model configuration
            'model': 'SASRec',
            'dataset': 'mellowise_interactions',
            
            # Training parameters
            'epochs': 50,
            'learning_rate': 0.001,
            'batch_size': 256,
            'train_batch_size': 256,
            'eval_batch_size': 256,
            
            # Loss configuration - FIX: Set loss_type and train_neg_sample_args correctly
            'loss_type': 'CE',  # Cross Entropy loss
            'train_neg_sample_args': None,  # Must be None when using CE loss
            
            # Model hyperparameters
            'hidden_size': 128,
            'inner_size': 256,
            'n_layers': 2,
            'n_heads': 2,
            'hidden_dropout_prob': 0.5,
            'attn_dropout_prob': 0.5,
            'hidden_act': 'gelu',
            'layer_norm_eps': 1e-12,
            'initializer_range': 0.02,
            'max_seq_length': 50,
            
            # Data parameters
            'USER_ID_FIELD': 'user_id',
            'ITEM_ID_FIELD': 'question_id',
            'TIME_FIELD': 'timestamp',
            'load_col': {
                'inter': ['user_id', 'question_id', 'timestamp', 'correct', 'difficulty']
            },
            
            # Evaluation
            'eval_args': {
                'split': {'RS': [8, 1, 1]},
                'order': 'TO',
                'group_by': 'user',
                'mode': 'full'
            },
            'metrics': ['Recall', 'NDCG'],
            'topk': [5, 10, 20],
            'valid_metric': 'NDCG@10',
            
            # GPU settings
            'device': self.device.type,
            'use_gpu': torch.cuda.is_available(),
            
            # Checkpoint
            'checkpoint_dir': './saved/',
            'save_step': 10,
            
            # Reproducibility
            'reproducibility': True,
            'seed': 2023,
        }
        
        if config_path and os.path.exists(config_path):
            self.config = Config(config_file_list=[config_path], config_dict=config_dict)
        else:
            self.config = Config(config_dict=config_dict)
            
        # Initialize random seeds
        init_seed(self.config['seed'], self.config['reproducibility'])
        
    def prepare_data(self, interaction_data: pd.DataFrame):
        """Prepare interaction data for RecBole"""
        print("🔄 Preparing data for RecBole...")
        
        # Create data directory
        data_dir = './dataset/mellowise_interactions'
        os.makedirs(data_dir, exist_ok=True)
        
        # Save interaction data in RecBole format
        interaction_file = os.path.join(data_dir, 'mellowise_interactions.inter')
        
        # Ensure required columns exist
        required_cols = ['user_id', 'question_id', 'timestamp']
        for col in required_cols:
            if col not in interaction_data.columns:
                raise ValueError(f"Required column '{col}' missing from interaction data")
        
        # Add rating column (RecBole requirement)
        interaction_data['rating'] = interaction_data.get('correct', 1).astype(int)
        
        # Save to file
        interaction_data[['user_id', 'question_id', 'rating', 'timestamp']].to_csv(
            interaction_file, sep='\t', index=False
        )
        
        print(f"✅ Saved {len(interaction_data)} interactions to {interaction_file}")
        
        # Create dataset
        self.dataset = create_dataset(self.config)
        print(f"📊 Dataset created: {len(self.dataset)} interactions")
        
        # Create data loaders
        self.train_data, self.valid_data, self.test_data = data_preparation(
            self.config, self.dataset
        )
        
        # Store mappings for inference
        self.user_mapping = self.dataset.field2token_id['user_id']
        self.item_mapping = self.dataset.field2token_id['question_id']
        
        print(f"👥 Users: {len(self.user_mapping)}")
        print(f"📝 Questions: {len(self.item_mapping)}")
        
    def train_model(self):
        """Train the SASRec model"""
        print("🚀 Starting SASRec model training...")
        
        if self.dataset is None:
            raise ValueError("Dataset not prepared. Call prepare_data() first.")
        
        # Initialize model
        self.model = SASRec(self.config, self.dataset).to(self.device)
        print(f"🤖 Model initialized with {sum(p.numel() for p in self.model.parameters()):,} parameters")
        
        # Initialize trainer
        trainer = Trainer(self.config, self.model)
        
        # Train model
        print("🔥 Starting training...")
        start_time = datetime.now()
        
        best_valid_score, best_valid_result = trainer.fit(
            self.train_data, self.valid_data, verbose=True
        )
        
        training_time = datetime.now() - start_time
        print(f"⏱️ Training completed in {training_time}")
        print(f"🏆 Best validation score: {best_valid_score:.4f}")
        
        # Save model
        model_path = './saved/SASRec-mellowise_interactions.pth'
        torch.save(self.model.state_dict(), model_path)
        print(f"💾 Model saved to {model_path}")
        
        return best_valid_score, best_valid_result
        
    def load_model(self, model_path: str = None):
        """Load trained model"""
        if model_path is None:
            model_path = './saved/SASRec-mellowise_interactions.pth'
            
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
            
        if self.dataset is None:
            raise ValueError("Dataset not loaded. Cannot initialize model.")
            
        # Initialize model
        self.model = SASRec(self.config, self.dataset).to(self.device)
        
        # Load weights
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.eval()
        
        print(f"✅ Model loaded from {model_path}")
        
    def get_recommendations(self, user_id: str, n_recommendations: int = 10, features: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Generate recommendations for a user"""
        if self.model is None:
            raise ValueError("Model not loaded. Call train_model() or load_model() first.")
            
        # Convert user_id to token
        if user_id not in self.user_mapping:
            # New user - return popular items or random sample
            return self._get_fallback_recommendations(n_recommendations)
            
        user_token = self.user_mapping[user_id]
        
        # Get user's interaction history
        user_seq = self._get_user_sequence(user_token)
        
        if len(user_seq) == 0:
            return self._get_fallback_recommendations(n_recommendations)
        
        # Prepare input tensor
        seq_len = min(len(user_seq), self.config['max_seq_length'])
        item_seq = torch.zeros(1, self.config['max_seq_length'], dtype=torch.long, device=self.device)
        item_seq[0, -seq_len:] = torch.tensor(user_seq[-seq_len:], device=self.device)
        
        # Generate predictions
        with torch.no_grad():
            scores = self.model.predict(item_seq)
            
        # Get top-k recommendations
        _, top_items = torch.topk(scores, k=n_recommendations, dim=-1)
        top_items = top_items[0].cpu().numpy()
        top_scores = scores[0][top_items].cpu().numpy()
        
        # Convert back to question IDs
        recommendations = []
        token_to_item = {v: k for k, v in self.item_mapping.items()}
        
        for i, (item_token, score) in enumerate(zip(top_items, top_scores)):
            if item_token in token_to_item:
                question_id = token_to_item[item_token]
                recommendations.append({
                    'item_id': question_id,
                    'score': float(score),
                    'rank': i + 1,
                    'confidence': min(1.0, float(score) / max(top_scores)),
                    'estimated_time': 2,  # Default 2 minutes per question
                    'topic_path': [],     # TODO: Add topic information
                    'prerequisites': []   # TODO: Add prerequisite logic
                })
        
        return recommendations
        
    def _get_user_sequence(self, user_token: int) -> List[int]:
        """Get user's historical interaction sequence"""
        # This is a simplified version - in practice, you'd query the actual data
        # For now, return empty list (cold start scenario)
        return []
        
    def _get_fallback_recommendations(self, n_recommendations: int) -> List[Dict[str, Any]]:
        """Fallback recommendations for new users"""
        # Return popular items or random sample
        recommendations = []
        for i in range(min(n_recommendations, len(self.item_mapping))):
            recommendations.append({
                'item_id': f'q_{i+1}',
                'score': 0.5,
                'rank': i + 1,
                'confidence': 0.3,
                'estimated_time': 2,
                'topic_path': [],
                'prerequisites': []
            })
        return recommendations

# FastAPI Web Service
app = FastAPI(title="Mellowise Recommendation Engine", version="1.0.0")

# Global engine instance
recommendation_engine = None

class RecommendationRequestModel(BaseModel):
    user_id: str
    n_recommendations: int = 10
    features: Optional[Dict[str, Any]] = None

class FeedbackModel(BaseModel):
    user_id: str
    question_id: str
    helpful: bool
    difficulty: str
    timing: str
    performance: Dict[str, Any]

@app.on_event("startup")
async def startup_event():
    """Initialize the recommendation engine on startup"""
    global recommendation_engine
    
    print("🚀 Starting Mellowise Recommendation Engine...")
    
    try:
        recommendation_engine = MellowiseRecommendationEngine()
        print("✅ Recommendation engine initialized")
        
        # Try to load existing model
        try:
            # First check if we have a dataset
            if os.path.exists('./dataset/mellowise_interactions/mellowise_interactions.inter'):
                # Load sample data for testing
                sample_data = pd.DataFrame({
                    'user_id': ['user_1', 'user_2', 'user_1', 'user_3'] * 25,
                    'question_id': [f'q_{i}' for i in range(1, 101)],
                    'timestamp': range(1, 101),
                    'correct': [1, 0, 1, 1] * 25
                })
                
                recommendation_engine.prepare_data(sample_data)
                print("📊 Sample dataset loaded")
                
                # Try to load existing model
                try:
                    recommendation_engine.load_model()
                    print("✅ Pre-trained model loaded successfully")
                except FileNotFoundError:
                    print("⚠️ No pre-trained model found. Training new model...")
                    recommendation_engine.train_model()
                    print("✅ Model training completed")
            else:
                print("📋 No dataset found. Engine ready for data upload.")
                
        except Exception as e:
            print(f"⚠️ Model initialization error: {e}")
            print("🔄 Engine running in fallback mode")
            
    except Exception as e:
        print(f"❌ Failed to initialize recommendation engine: {e}")
        raise

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    gpu_info = {}
    if torch.cuda.is_available():
        gpu_info = {
            'name': torch.cuda.get_device_name(0),
            'memory_total': f"{torch.cuda.get_device_properties(0).total_memory / 1e9:.1f}GB",
            'memory_used': f"{torch.cuda.memory_allocated(0) / 1e9:.1f}GB"
        }
    
    return {
        'status': 'healthy',
        'service': 'Mellowise Recommendation Engine',
        'version': '1.0.0',
        'device': str(recommendation_engine.device if recommendation_engine else 'unknown'),
        'gpu_info': gpu_info,
        'model_loaded': recommendation_engine.model is not None if recommendation_engine else False
    }

@app.post("/recommend")
async def get_recommendations(request: RecommendationRequestModel):
    """Get recommendations for a user"""
    if recommendation_engine is None:
        raise HTTPException(status_code=503, detail="Recommendation engine not initialized")
    
    try:
        recommendations = recommendation_engine.get_recommendations(
            user_id=request.user_id,
            n_recommendations=request.n_recommendations,
            features=request.features
        )
        
        return {
            'recommendations': recommendations,
            'model_info': {
                'version': '1.0.0-sasrec',
                'device': str(recommendation_engine.device),
                'model_loaded': recommendation_engine.model is not None
            },
            'generated_at': datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

@app.post("/feedback")
async def submit_feedback(feedback: FeedbackModel):
    """Accept user feedback for model improvement"""
    # Store feedback for future model updates
    print(f"📝 Received feedback for user {feedback.user_id}, question {feedback.question_id}")
    print(f"   Helpful: {feedback.helpful}, Difficulty: {feedback.difficulty}")
    
    # TODO: Implement feedback storage and model update logic
    
    return {'status': 'feedback_received'}

@app.post("/train")
async def train_model(data: Dict[str, Any]):
    """Train/retrain the model with new data"""
    if recommendation_engine is None:
        raise HTTPException(status_code=503, detail="Recommendation engine not initialized")
    
    try:
        # Convert input data to DataFrame
        interaction_data = pd.DataFrame(data['interactions'])
        
        # Prepare data and train model
        recommendation_engine.prepare_data(interaction_data)
        best_score, results = recommendation_engine.train_model()
        
        return {
            'status': 'training_completed',
            'best_validation_score': best_score,
            'results': results,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

if __name__ == "__main__":
    # Run the FastAPI server
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )
