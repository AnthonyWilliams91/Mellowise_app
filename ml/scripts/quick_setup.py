#!/usr/bin/env python3
"""
Quick Setup Script for Mellowise ML Development
Automates the initial setup of the ML development environment
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
import platform


class MellowiseMLSetup:
    """Setup manager for Mellowise ML development environment"""

    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent
        self.ml_root = self.project_root / "ml"
        self.is_macos = platform.system() == "Darwin"
        self.is_windows = platform.system() == "Windows"
        self.is_linux = platform.system() == "Linux"

    def check_requirements(self):
        """Check system requirements"""
        print("🔍 Checking system requirements...")

        # Check Python version
        if sys.version_info < (3, 8):
            print("❌ Python 3.8+ required")
            return False

        # Check Git
        if not shutil.which("git"):
            print("❌ Git not found")
            return False

        # Check if in correct directory
        if not (self.project_root / "package.json").exists():
            print("❌ Must run from Mellowise project root")
            return False

        print("✅ System requirements met")
        return True

    def setup_directory_structure(self):
        """Create ML directory structure"""
        print("📁 Setting up directory structure...")

        directories = [
            "experiments",
            "models/checkpoints",
            "data/raw",
            "data/processed",
            "notebooks",
            "scripts",
            "configs",
            "serving",
            "training",
            "tests",
            "logs",
            "results"
        ]

        for dir_path in directories:
            full_path = self.ml_root / dir_path
            full_path.mkdir(parents=True, exist_ok=True)
            print(f"  📂 Created: {dir_path}")

        # Create .gitkeep files
        gitkeep_dirs = ["data/raw", "data/processed", "models", "logs", "results"]
        for dir_path in gitkeep_dirs:
            gitkeep_file = self.ml_root / dir_path / ".gitkeep"
            gitkeep_file.touch()

        print("✅ Directory structure created")

    def setup_python_environment(self):
        """Setup Python virtual environment"""
        print("🐍 Setting up Python virtual environment...")

        venv_path = self.ml_root / "venv"

        if venv_path.exists():
            print("  ⚠️  Virtual environment already exists")
            return True

        try:
            # Create virtual environment
            subprocess.run([sys.executable, "-m", "venv", str(venv_path)], check=True)

            # Determine activation script path
            if self.is_windows:
                activate_script = venv_path / "Scripts" / "activate.bat"
                pip_path = venv_path / "Scripts" / "pip"
            else:
                activate_script = venv_path / "bin" / "activate"
                pip_path = venv_path / "bin" / "pip"

            # Install dependencies
            requirements_file = self.ml_root / "requirements-dev.txt"
            if requirements_file.exists():
                print("  📦 Installing ML dependencies...")
                subprocess.run([str(pip_path), "install", "--upgrade", "pip"], check=True)
                subprocess.run([str(pip_path), "install", "-r", str(requirements_file)], check=True)

            print(f"✅ Virtual environment created: {venv_path}")
            return True

        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to create virtual environment: {e}")
            return False

    def setup_git_configuration(self):
        """Configure Git for ML workflow"""
        print("📝 Configuring Git for ML workflow...")

        # Check if ml-dev branch exists
        try:
            result = subprocess.run(
                ["git", "branch", "--list", "ml-dev"],
                cwd=self.project_root,
                capture_output=True,
                text=True
            )

            if not result.stdout.strip():
                # Create ml-dev branch
                subprocess.run(
                    ["git", "checkout", "-b", "ml-dev"],
                    cwd=self.project_root,
                    check=True
                )
                print("  🌿 Created ml-dev branch")
            else:
                print("  ✅ ml-dev branch already exists")

            # Update .gitignore for ML files
            self._update_gitignore()

        except subprocess.CalledProcessError as e:
            print(f"❌ Git configuration failed: {e}")
            return False

        print("✅ Git configured for ML workflow")
        return True

    def _update_gitignore(self):
        """Update .gitignore with ML-specific patterns"""
        gitignore_path = self.project_root / ".gitignore"

        ml_patterns = """
# ML Development
ml/data/raw/
ml/data/processed/
ml/models/*.pth
ml/models/*.pkl
ml/experiments/*/checkpoints/
ml/venv/
ml/logs/*.log
ml/results/*.png
ml/results/*.csv
**/.ipynb_checkpoints
**/__pycache__/
*.pyc
.mlflow/
wandb/
.pytest_cache/

# Keep structure and configs
!ml/data/.gitkeep
!ml/models/.gitkeep
!ml/experiments/.gitkeep
!ml/logs/.gitkeep
!ml/results/.gitkeep
"""

        # Check if ML patterns already exist
        if gitignore_path.exists():
            with open(gitignore_path, 'r') as f:
                content = f.read()
                if "# ML Development" in content:
                    return

        # Append ML patterns
        with open(gitignore_path, 'a') as f:
            f.write(ml_patterns)

        print("  📝 Updated .gitignore with ML patterns")

    def setup_vscode_configuration(self):
        """Setup VS Code configuration for ML development"""
        print("⚙️ Setting up VS Code configuration...")

        vscode_dir = self.project_root / ".vscode"
        vscode_dir.mkdir(exist_ok=True)

        # Settings.json
        settings = {
            "python.defaultInterpreterPath": "./ml/venv/bin/python" if not self.is_windows else "./ml/venv/Scripts/python.exe",
            "python.terminal.activateEnvironment": True,
            "jupyter.kernels.excludePythonPathFromSysPrefix": True,
            "python.formatting.provider": "black",
            "python.linting.enabled": True,
            "python.linting.pylintEnabled": True,
            "files.watcherExclude": {
                "**/ml/experiments/**": True,
                "**/ml/models/**": True,
                "**/ml/data/cache/**": True,
                "**/ml/venv/**": True
            },
            "tensorboard.logDirectory": "./ml/experiments",
            "jupyter.notebookFileRoot": "./ml/notebooks"
        }

        settings_file = vscode_dir / "settings.json"
        if not settings_file.exists():
            import json
            with open(settings_file, 'w') as f:
                json.dump(settings, f, indent=2)
            print("  📋 Created VS Code settings")

        # Extensions recommendations
        extensions = {
            "recommendations": [
                "ms-python.python",
                "ms-python.vscode-pylance",
                "ms-toolsai.jupyter",
                "ms-vscode-remote.remote-ssh",
                "ms-python.black-formatter",
                "mechatroner.rainbow-csv"
            ]
        }

        extensions_file = vscode_dir / "extensions.json"
        if not extensions_file.exists():
            import json
            with open(extensions_file, 'w') as f:
                json.dump(extensions, f, indent=2)
            print("  🔌 Created VS Code extensions recommendations")

        print("✅ VS Code configuration completed")

    def create_sample_experiment(self):
        """Create a sample experiment for testing"""
        print("🧪 Creating sample experiment...")

        sample_exp_dir = self.ml_root / "experiments" / "sample_experiment"
        sample_exp_dir.mkdir(exist_ok=True)

        # Copy template config
        template_config = self.ml_root / "configs" / "template_config.yaml"
        sample_config = sample_exp_dir / "config.yaml"

        if template_config.exists():
            shutil.copy(template_config, sample_config)

        # Create sample notebook
        notebook_content = {
            "cells": [
                {
                    "cell_type": "markdown",
                    "metadata": {},
                    "source": [
                        "# Sample Mellowise ML Experiment\n",
                        "\n",
                        "This is a sample experiment to test your ML development setup.\n",
                        "\n",
                        "## Next Steps:\n",
                        "1. Activate the virtual environment\n",
                        "2. Update Windows connection settings in `ml/scripts/dev_helpers.sh`\n",
                        "3. Test the connection to your Windows training machine\n",
                        "4. Run the data preparation pipeline\n",
                        "5. Start your first training experiment"
                    ]
                },
                {
                    "cell_type": "code",
                    "execution_count": None,
                    "metadata": {},
                    "source": [
                        "# Test imports\n",
                        "import sys\n",
                        "print(f\"Python version: {sys.version}\")\n",
                        "\n",
                        "try:\n",
                        "    import torch\n",
                        "    print(f\"PyTorch version: {torch.__version__}\")\n",
                        "except ImportError:\n",
                        "    print(\"⚠️ PyTorch not installed - run pip install -r requirements-dev.txt\")\n",
                        "\n",
                        "try:\n",
                        "    import recbole\n",
                        "    print(f\"RecBole version: {recbole.__version__}\")\n",
                        "except ImportError:\n",
                        "    print(\"⚠️ RecBole not installed - run pip install -r requirements-dev.txt\")"
                    ]
                }
            ],
            "metadata": {
                "kernelspec": {
                    "display_name": "Python 3",
                    "language": "python",
                    "name": "python3"
                },
                "language_info": {
                    "name": "python",
                    "version": "3.10.0"
                }
            },
            "nbformat": 4,
            "nbformat_minor": 4
        }

        sample_notebook = sample_exp_dir / "sample_experiment.ipynb"
        if not sample_notebook.exists():
            import json
            with open(sample_notebook, 'w') as f:
                json.dump(notebook_content, f, indent=2)

        print("  📓 Created sample experiment notebook")
        print("✅ Sample experiment created")

    def display_next_steps(self):
        """Display next steps for the user"""
        print("\n" + "="*60)
        print("🎉 MELLOWISE ML SETUP COMPLETED!")
        print("="*60)

        activation_cmd = "source ml/venv/bin/activate" if not self.is_windows else "ml\\venv\\Scripts\\activate.bat"

        next_steps = f"""
📋 Next Steps:

1. 🐍 Activate the Python environment:
   {activation_cmd}

2. 🔧 Configure Windows connection:
   Edit ml/scripts/dev_helpers.sh and update:
   - WINDOWS_ML_IP="your-windows-ip"
   - WINDOWS_ML_USER="ml-training"

3. 🚀 Load helper functions:
   source ml/scripts/dev_helpers.sh

4. 📊 Test your setup:
   ml_status

5. 🧪 Create your first experiment:
   create_experiment "my_first_model"

6. 📖 Read the full workflow guide:
   docs/ml-development-workflow.md

💡 Pro Tips:
- Run 'ml_status' anytime to check your environment
- Use 'create_experiment <name>' for new experiments
- All training happens on your Windows RTX 3090 via SSH
- TensorBoard monitoring is automatic with 'monitor_training'

🔗 Key Files:
- ml/configs/template_config.yaml - Experiment templates
- ml/training/train_recommender.py - Main training script
- ml/scripts/dev_helpers.sh - Development helpers
"""

        print(next_steps)
        print("="*60)

    def run_setup(self):
        """Run the complete setup process"""
        print("🚀 Starting Mellowise ML Development Setup...")
        print("="*50)

        if not self.check_requirements():
            return False

        steps = [
            ("Directory Structure", self.setup_directory_structure),
            ("Python Environment", self.setup_python_environment),
            ("Git Configuration", self.setup_git_configuration),
            ("VS Code Configuration", self.setup_vscode_configuration),
            ("Sample Experiment", self.create_sample_experiment)
        ]

        for step_name, step_func in steps:
            try:
                step_func()
            except Exception as e:
                print(f"❌ {step_name} failed: {e}")
                return False

        self.display_next_steps()
        return True


def main():
    """Main setup function"""
    setup = MellowiseMLSetup()
    success = setup.run_setup()
    return 0 if success else 1


if __name__ == "__main__":
    exit(main())