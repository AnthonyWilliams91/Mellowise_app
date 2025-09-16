# SSH Remote File Access Setup for Claude/MacBook → Windows WSL2

**Purpose**: Enable Claude (on MacBook) to create, edit, and manage files directly on Windows WSL2
**Security**: Key-based authentication with restricted permissions
**Workflow**: Claude can directly set up your ML environment remotely

---

## 🎯 **Quick Overview**

This setup allows:
- Claude to create/edit files on WSL2 directly from your MacBook
- You to mount WSL2 filesystem on MacBook for direct access
- Automated file operations without manual copy/paste
- Secure bidirectional file synchronization

---

## 🚀 **Option 1: SSH + SSHFS Mount (RECOMMENDED)**

This approach mounts your WSL2 filesystem directly on your MacBook, allowing Claude to read/write files as if they were local.

### **Step 1: Enable SSH in WSL2**

First, let's set up SSH server in WSL2:

```bash
# In WSL2 Ubuntu
sudo apt-get update
sudo apt-get install -y openssh-server

# Configure SSH for security and access
sudo bash -c 'cat > /etc/ssh/sshd_config.d/claude_access.conf << EOF
# Claude Remote Access Configuration
Port 2222
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication no
X11Forwarding yes
AllowUsers $(whoami)
EOF'

# Create SSH directory if not exists
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Start SSH service
sudo service ssh restart

# Auto-start SSH on WSL2 boot
echo "sudo service ssh start 2>/dev/null" >> ~/.bashrc
```

### **Step 2: Generate SSH Keys on MacBook**

```bash
# On MacBook - Generate dedicated key for Claude access
ssh-keygen -t ed25519 -C "claude-wsl2-access" -f ~/.ssh/claude_wsl2

# Display public key to copy
cat ~/.ssh/claude_wsl2.pub
```

### **Step 3: Add Public Key to WSL2**

```bash
# In WSL2 - Add the public key
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Test connection from MacBook
ssh -i ~/.ssh/claude_wsl2 -p 2222 username@windows-ip
```

### **Step 4: Install SSHFS on MacBook**

```bash
# On MacBook - Install SSHFS via Homebrew
brew install macfuse
brew install sshfs

# Create mount point
mkdir -p ~/wsl2-mount

# Mount WSL2 filesystem
sshfs -o port=2222 \
      -o IdentityFile=~/.ssh/claude_wsl2 \
      -o allow_other \
      -o defer_permissions \
      -o volname=WSL2 \
      username@windows-ip:/home/username ~/wsl2-mount

# Verify mount
ls ~/wsl2-mount
```

### **Step 5: Configure Claude Access**

Now Claude can directly access your WSL2 files:

```bash
# Create helper script for Claude
cat > ~/bin/wsl2-claude-access.sh << 'EOF'
#!/bin/bash

# Mount WSL2 if not already mounted
if ! mount | grep -q "wsl2-mount"; then
    echo "🔄 Mounting WSL2 filesystem..."
    sshfs -o port=2222 \
          -o IdentityFile=~/.ssh/claude_wsl2 \
          -o allow_other \
          -o defer_permissions \
          -o reconnect \
          -o ServerAliveInterval=15 \
          -o ServerAliveCountMax=3 \
          username@windows-ip:/home/username ~/wsl2-mount
    echo "✅ WSL2 mounted at ~/wsl2-mount"
fi

# Function for Claude to create files
claude_create_file() {
    local filepath="$1"
    local content="$2"
    echo "$content" > ~/wsl2-mount/"$filepath"
    echo "✅ Created: $filepath"
}

# Function for Claude to edit files
claude_edit_file() {
    local filepath="$1"
    # Claude can now edit ~/wsl2-mount/$filepath
    echo "📝 Ready to edit: ~/wsl2-mount/$filepath"
}

# Export functions for use
export -f claude_create_file
export -f claude_edit_file
EOF

chmod +x ~/bin/wsl2-claude-access.sh
```

---

## 🔧 **Option 2: SSH with Remote Command Execution**

Alternative approach using SSH commands directly:

### **MacBook SSH Config**

Create/update `~/.ssh/config`:

```ssh-config
Host wsl2-claude
    HostName YOUR_WINDOWS_IP
    Port 2222
    User YOUR_WSL_USERNAME
    IdentityFile ~/.ssh/claude_wsl2
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    LogLevel ERROR

    # Keep connection alive
    ServerAliveInterval 60
    ServerAliveCountMax 3

    # Enable file transfer
    ForwardAgent yes
```

### **Helper Functions for Claude**

Create `~/bin/claude-wsl2-helper.sh`:

```bash
#!/bin/bash

# Function to create file on WSL2
wsl2_create_file() {
    local filepath="$1"
    local content="$2"

    ssh wsl2-claude "cat > $filepath << 'CLAUDE_EOF'
$content
CLAUDE_EOF"

    echo "✅ Created file on WSL2: $filepath"
}

# Function to edit file on WSL2
wsl2_edit_file() {
    local filepath="$1"
    local old_content="$2"
    local new_content="$3"

    ssh wsl2-claude "cp $filepath ${filepath}.backup"
    ssh wsl2-claude "cat > $filepath << 'CLAUDE_EOF'
$new_content
CLAUDE_EOF"

    echo "✅ Updated file on WSL2: $filepath"
}

# Function to read file from WSL2
wsl2_read_file() {
    local filepath="$1"
    ssh wsl2-claude "cat $filepath"
}

# Function to run command on WSL2
wsl2_run() {
    ssh wsl2-claude "$@"
}

# Export functions
export -f wsl2_create_file
export -f wsl2_edit_file
export -f wsl2_read_file
export -f wsl2_run
```

---

## 🤖 **Option 3: VS Code Remote SSH for Claude**

Configure VS Code for remote development that Claude can use:

### **Install VS Code Extensions**

```bash
# On MacBook
code --install-extension ms-vscode-remote.remote-ssh
code --install-extension ms-vscode-remote.remote-ssh-edit
```

### **VS Code Command Line for Claude**

```bash
# Open remote file directly
code --remote ssh-remote+wsl2-claude /home/username/mellowise/file.py

# Create new file remotely
code --remote ssh-remote+wsl2-claude --new-window /home/username/mellowise/new_file.py
```

---

## 🔒 **Security Considerations**

### **Restricted Claude Access**

Create a restricted user for Claude operations:

```bash
# In WSL2 - Create restricted user
sudo useradd -m -s /bin/bash claude-access
sudo usermod -aG docker claude-access  # If using Docker

# Set up restricted directory
sudo mkdir -p /home/claude-access/mellowise
sudo chown -R claude-access:claude-access /home/claude-access/mellowise

# Configure sudoers for specific commands only
echo "claude-access ALL=(ALL) NOPASSWD: /usr/bin/nvidia-smi, /usr/bin/python3" | sudo tee /etc/sudoers.d/claude-access
```

### **Network Security**

```powershell
# Windows PowerShell - Restrict port access to your MacBook IP only
New-NetFirewallRule -DisplayName "WSL2 SSH Claude Access" `
    -Direction Inbound `
    -LocalPort 2222 `
    -Protocol TCP `
    -RemoteAddress YOUR_MACBOOK_IP `
    -Action Allow
```

---

## 🚀 **Quick Setup Script**

Run this on your MacBook to set everything up:

```bash
#!/bin/bash
# setup-claude-wsl2-access.sh

echo "🔧 Setting up Claude WSL2 Access"

# Variables (update these)
WSL2_IP="YOUR_WINDOWS_IP"
WSL2_USER="YOUR_WSL_USERNAME"
WSL2_PORT="2222"

# Generate SSH key
if [ ! -f ~/.ssh/claude_wsl2 ]; then
    ssh-keygen -t ed25519 -C "claude-wsl2-access" -f ~/.ssh/claude_wsl2 -N ""
    echo "📝 Copy this public key to WSL2:"
    cat ~/.ssh/claude_wsl2.pub
    echo ""
    read -p "Press Enter after adding to WSL2 authorized_keys..."
fi

# Test connection
echo "🔍 Testing SSH connection..."
ssh -i ~/.ssh/claude_wsl2 -p $WSL2_PORT $WSL2_USER@$WSL2_IP "echo '✅ SSH connection successful'"

# Install SSHFS if needed
if ! command -v sshfs &> /dev/null; then
    echo "📦 Installing SSHFS..."
    brew install macfuse
    brew install sshfs
fi

# Create mount point
mkdir -p ~/wsl2-mount

# Mount WSL2
echo "🔄 Mounting WSL2 filesystem..."
sshfs -o port=$WSL2_PORT \
      -o IdentityFile=~/.ssh/claude_wsl2 \
      -o allow_other \
      -o defer_permissions \
      -o reconnect \
      $WSL2_USER@$WSL2_IP:/home/$WSL2_USER ~/wsl2-mount

echo "✅ Setup complete! WSL2 mounted at ~/wsl2-mount"
echo ""
echo "Claude can now:"
echo "  - Read files:  ~/wsl2-mount/path/to/file"
echo "  - Write files: ~/wsl2-mount/path/to/file"
echo "  - Run commands: ssh wsl2-claude 'command'"
```

---

## 📋 **Usage Examples for Claude**

Once setup is complete, I'll be able to:

### **Create Files Directly**
```bash
# Claude can create files on WSL2
cat > ~/wsl2-mount/mellowise/train_config.yaml << 'EOF'
model: SASRec
embedding_size: 256
learning_rate: 0.001
batch_size: 4096
EOF
```

### **Edit Files**
```bash
# Claude can edit existing files
echo "import torch" >> ~/wsl2-mount/mellowise/train.py
```

### **Run Commands**
```bash
# Claude can execute commands
ssh wsl2-claude "cd mellowise && python train.py"
```

### **Monitor Training**
```bash
# Claude can check GPU status
ssh wsl2-claude "nvidia-smi"
```

---

## ✅ **Benefits of This Setup**

1. **No Copy/Paste**: I can directly create all configuration files
2. **Real-time Editing**: Make changes and test immediately
3. **Full Automation**: Complete setup without manual intervention
4. **Debugging**: I can check logs and fix issues directly
5. **Monitoring**: Track training progress in real-time

---

## 🔧 **Windows Port Forwarding**

Don't forget to set up port forwarding on Windows:

```powershell
# Windows PowerShell (Admin)
$wslIp = (wsl hostname -I).Trim()

# Forward SSH port
netsh interface portproxy add v4tov4 `
    listenport=2222 `
    listenaddress=0.0.0.0 `
    connectport=2222 `
    connectaddress=$wslIp

# Verify
netsh interface portproxy show all
```

---

## 🎯 **Ready to Enable Claude Access?**

1. Choose your preferred method (SSHFS recommended)
2. Run the setup script with your Windows IP
3. Test the connection
4. Claude can then handle all file operations remotely!

This will make the entire ML environment setup seamless - I'll be able to create all configuration files, scripts, and settings directly on your WSL2 machine without any manual copy/paste!