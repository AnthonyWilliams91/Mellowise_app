#!/usr/bin/env python3
"""
Mellowise ML Development Workflow Demo
Demonstrates the complete end-to-end ML workflow for new developers
"""

import os
import sys
import time
import subprocess
from pathlib import Path
import logging
from datetime import datetime

class WorkflowDemo:
    """Interactive demonstration of the Mellowise ML workflow"""

    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent
        self.ml_root = self.project_root / "ml"
        self.setup_logging()

    def setup_logging(self):
        """Setup logging for the demo"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - 🎯 %(message)s',
            handlers=[logging.StreamHandler()]
        )

    def print_step(self, step_num: int, title: str, description: str):
        """Print formatted step information"""
        print(f"\n{'='*60}")
        print(f"Step {step_num}: {title}")
        print('='*60)
        print(f"📋 {description}")
        print()

    def wait_for_user(self, message: str = "Press Enter to continue..."):
        """Wait for user input"""
        input(f"👉 {message}")

    def run_command(self, command: str, description: str, check_output: bool = False):
        """Run a command and display results"""
        print(f"🔧 {description}")
        print(f"Command: {command}")

        try:
            result = subprocess.run(
                command.split() if isinstance(command, str) else command,
                cwd=self.project_root,
                capture_output=check_output,
                text=True,
                check=True
            )

            if check_output and result.stdout:
                print(f"Output:\n{result.stdout}")

            print("✅ Success!")
            return result.stdout if check_output else True

        except subprocess.CalledProcessError as e:
            print(f"❌ Command failed: {e}")
            if check_output:
                print(f"Error: {e.stderr}")
            return False

    def check_prerequisites(self):
        """Check if prerequisites are met"""
        self.print_step(1, "Prerequisites Check",
                       "Checking if your system is ready for ML development")

        checks = [
            ("Python 3.8+", sys.version_info >= (3, 8)),
            ("Git installed", subprocess.run(["git", "--version"],
                            capture_output=True).returncode == 0),
            ("In Mellowise project", (self.project_root / "package.json").exists()),
            ("ML directory exists", self.ml_root.exists())
        ]

        all_good = True
        for check_name, check_result in checks:
            status = "✅" if check_result else "❌"
            print(f"{status} {check_name}")
            if not check_result:
                all_good = False

        if not all_good:
            print("\n❌ Some prerequisites are missing. Please run:")
            print("   python ml/scripts/quick_setup.py")
            return False

        print("\n🎉 All prerequisites met!")
        return True

    def demo_environment_setup(self):
        """Demonstrate environment setup"""
        self.print_step(2, "Environment Setup",
                       "Setting up the Python virtual environment and dependencies")

        venv_path = self.ml_root / "venv"

        if venv_path.exists():
            print("✅ Virtual environment already exists")
        else:
            print("🔧 Creating virtual environment...")
            self.run_command(f"{sys.executable} -m venv {venv_path}",
                           "Creating Python virtual environment")

        # Show how to activate
        if os.name == 'nt':  # Windows
            activate_cmd = str(venv_path / "Scripts" / "activate.bat")
        else:
            activate_cmd = f"source {venv_path}/bin/activate"

        print(f"📝 To activate the environment, run:")
        print(f"   {activate_cmd}")

        self.wait_for_user()

    def demo_helper_scripts(self):
        """Demonstrate helper script usage"""
        self.print_step(3, "Development Helpers",
                       "Loading development helper functions for productivity")

        print("🔧 The helper script provides these commands:")

        helpers = [
            ("mldev", "Start ML development environment"),
            ("create_experiment", "Create new experiment directory"),
            ("start_training", "Start remote training on Windows"),
            ("monitor_training", "Monitor training progress"),
            ("ml_status", "Check environment status"),
            ("winconnect", "SSH to Windows training machine")
        ]

        for cmd, desc in helpers:
            print(f"   {cmd:<20} - {desc}")

        print(f"\n📝 To load helpers, run:")
        print(f"   source ml/scripts/dev_helpers.sh")
        print(f"\n🔧 Don't forget to update Windows connection settings:")
        print(f"   Edit WINDOWS_ML_IP and WINDOWS_ML_USER in dev_helpers.sh")

        self.wait_for_user()

    def demo_experiment_creation(self):
        """Demonstrate experiment creation"""
        self.print_step(4, "Experiment Creation",
                       "Creating a sample experiment with configuration")

        exp_name = f"demo_experiment_{datetime.now().strftime('%H%M%S')}"
        exp_dir = self.ml_root / "experiments" / f"exp_{datetime.now().strftime('%Y%m%d_%H%M')}_{exp_name}"

        print(f"🧪 Creating experiment: {exp_name}")
        exp_dir.mkdir(parents=True, exist_ok=True)

        # Copy template config
        template_config = self.ml_root / "configs" / "template_config.yaml"
        exp_config = exp_dir / "config.yaml"

        if template_config.exists():
            import shutil
            shutil.copy(template_config, exp_config)
            print(f"✅ Created config: {exp_config}")
        else:
            print("⚠️  Template config not found, creating basic config")

        # Show config structure
        print("\n📋 Experiment structure:")
        print(f"   {exp_dir}/")
        print(f"   ├── config.yaml      # Experiment configuration")
        print(f"   ├── experiment.ipynb # Jupyter notebook (auto-created)")
        print(f"   └── results/         # Training results (after training)")

        print(f"\n💡 In practice, you'd run:")
        print(f"   create_experiment {exp_name}")

        self.wait_for_user()

    def demo_data_preparation(self):
        """Demonstrate data preparation pipeline"""
        self.print_step(5, "Data Preparation",
                       "Preparing sample data in RecBole format")

        print("🔄 Running data preparation pipeline with sample data...")

        success = self.run_command(
            f"{sys.executable} ml/scripts/data_preparation.py --sample-data",
            "Preparing sample interaction data"
        )

        if success:
            processed_dir = self.ml_root / "data" / "processed"
            files = list(processed_dir.glob("*.inter")) + list(processed_dir.glob("*.user")) + list(processed_dir.glob("*.item"))

            print(f"\n✅ Generated RecBole data files:")
            for file in files:
                print(f"   📄 {file.name}")

            # Show sample data
            if files:
                sample_file = files[0]
                print(f"\n📊 Sample from {sample_file.name}:")
                with open(sample_file, 'r') as f:
                    lines = f.readlines()[:4]  # Show first few lines
                    for line in lines:
                        print(f"   {line.rstrip()}")

        self.wait_for_user()

    def demo_model_configuration(self):
        """Demonstrate model configuration options"""
        self.print_step(6, "Model Configuration",
                       "Understanding available models and their configurations")

        print("🤖 Available recommendation models:")

        models = [
            ("ItemKNN", "Item-based collaborative filtering", "Fast, interpretable baseline"),
            ("BPR", "Bayesian Personalized Ranking", "Popular matrix factorization method"),
            ("NeuMF", "Neural Matrix Factorization", "Deep learning approach"),
            ("LightGCN", "Graph Convolutional Network", "State-of-the-art graph-based method"),
            ("SASRec", "Sequential Recommendation", "Captures user behavior sequences")
        ]

        for name, description, note in models:
            print(f"   {name:<10} - {description}")
            print(f"              {note}")

        print(f"\n📝 Model configurations are in:")
        print(f"   ml/configs/recbole_config.py")

        print(f"\n🧪 To train a model, you'd run:")
        print(f"   start_training itemknn experiments/your_exp/config.yaml")

        self.wait_for_user()

    def demo_monitoring_setup(self):
        """Demonstrate monitoring and debugging setup"""
        self.print_step(7, "Training Monitoring",
                       "Setting up monitoring for training experiments")

        print("📊 Available monitoring tools:")

        monitoring = [
            ("TensorBoard", "Real-time training metrics visualization"),
            ("MLflow", "Experiment tracking and model versioning"),
            ("W&B", "Advanced experiment management (optional)"),
            ("GPU Monitor", "Real-time GPU utilization tracking")
        ]

        for tool, description in monitoring:
            print(f"   {tool:<12} - {description}")

        print(f"\n🖥️  For remote training on Windows RTX 3090:")
        print(f"   1. SSH tunnel for TensorBoard: ssh -L 6006:localhost:6006 user@windows")
        print(f"   2. Monitor GPU: watch nvidia-smi")
        print(f"   3. Or use: monitor_training  # Does both automatically")

        print(f"\n📈 Access training metrics at:")
        print(f"   TensorBoard: http://localhost:6006")
        print(f"   MLflow UI: http://localhost:5000")

        self.wait_for_user()

    def demo_production_path(self):
        """Demonstrate path to production"""
        self.print_step(8, "Production Integration",
                       "How trained models integrate with the Mellowise web application")

        print("🚀 Production deployment workflow:")

        steps = [
            "Train and validate model on Windows RTX 3090",
            "Export best model checkpoint",
            "Deploy model server using FastAPI",
            "Integrate with Next.js API routes",
            "Serve real-time recommendations to users"
        ]

        for i, step in enumerate(steps, 1):
            print(f"   {i}. {step}")

        print(f"\n📁 Key files for production:")
        print(f"   ml/serving/model_server.py    # FastAPI model server")
        print(f"   src/app/api/recommend/       # Next.js API integration")
        print(f"   ml/models/production_model.pth # Trained model artifact")

        print(f"\n🔄 The complete flow:")
        print(f"   User Question → Recommendation API → ML Model → Personalized Questions")

        self.wait_for_user()

    def demo_next_steps(self):
        """Show next steps for the developer"""
        self.print_step(9, "Next Steps",
                       "What to do after this demo to start real ML development")

        print("🎯 Immediate next steps:")

        next_steps = [
            "1. Configure Windows connection in dev_helpers.sh",
            "2. Set up Windows RTX 3090 with SSH server",
            "3. Install CUDA-enabled PyTorch on Windows",
            "4. Connect Mellowise database for real user data",
            "5. Run your first baseline experiment",
            "6. Iterate and improve model performance"
        ]

        for step in next_steps:
            print(f"   {step}")

        print(f"\n📚 Resources:")
        print(f"   📖 Complete guide: docs/ml-development-workflow.md")
        print(f"   🧪 Start experimenting: create_experiment your_first_model")
        print(f"   🤖 Model configs: ml/configs/recbole_config.py")
        print(f"   🔧 Helper functions: source ml/scripts/dev_helpers.sh")

        print(f"\n💡 Pro tips:")
        print(f"   • Always run ml_status to check your environment")
        print(f"   • Use create_experiment for organized experiments")
        print(f"   • Monitor training with TensorBoard")
        print(f"   • Version all experiments with MLflow")

        self.wait_for_user("Press Enter to complete the demo...")

    def run_demo(self):
        """Run the complete workflow demo"""
        print("🎉 Welcome to the Mellowise ML Development Workflow Demo!")
        print("="*60)
        print("This demo will walk you through the complete ML development")
        print("workflow using your M1 MacBook + Windows RTX 3090 setup.")
        print("="*60)

        self.wait_for_user("Press Enter to start the demo...")

        # Demo steps
        demo_steps = [
            self.check_prerequisites,
            self.demo_environment_setup,
            self.demo_helper_scripts,
            self.demo_experiment_creation,
            self.demo_data_preparation,
            self.demo_model_configuration,
            self.demo_monitoring_setup,
            self.demo_production_path,
            self.demo_next_steps
        ]

        for step_func in demo_steps:
            try:
                result = step_func()
                if result is False:  # Prerequisites check failed
                    return False
            except KeyboardInterrupt:
                print("\n\n👋 Demo interrupted by user. Thanks for trying it out!")
                return False
            except Exception as e:
                print(f"\n❌ Demo step failed: {e}")
                return False

        print("\n" + "="*60)
        print("🎉 DEMO COMPLETED SUCCESSFULLY!")
        print("="*60)
        print("You're now ready to start developing ML models for Mellowise!")
        print("Happy coding! 🚀")
        print("="*60)

        return True


def main():
    """Main demo function"""
    demo = WorkflowDemo()
    success = demo.run_demo()
    return 0 if success else 1


if __name__ == "__main__":
    exit(main())