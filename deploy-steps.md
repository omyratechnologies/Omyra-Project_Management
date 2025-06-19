
````markdown
# 🚀 Omyra Azure Deployment Checklist (Production)

---

## ✅ 1. Create Azure VM

- Use Ubuntu LTS (22.04 or 24.04 recommended)
- Allow inbound rules for ports: 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (Backend), 27017 (MongoDB, optional)

---

## ✅ 2. Install MongoDB (8.0)

<details>
<summary>Show MongoDB Setup</summary>

```bash
# SSH into VM
ssh azureuser@<your-vm-ip>

# Update and install essentials
sudo apt update && sudo apt install -y gnupg curl

# Add MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor

# Add MongoDB repo
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" \
| sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable service
sudo systemctl start mongod
sudo systemctl enable mongod
````

(Optional) Create database user:

```bash
mongo
use your_database
db.createUser({
  user: "admin",
  pwd: "yourStrongPassword",
  roles: [{ role: "readWrite", db: "your_database" }]
})
```

</details>

---

## ✅ 3. Install Node.js (via NodeSource)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## ✅ 4. Install PM2

```bash
sudo npm install -g pm2
```

---

## ✅ 5. Setup SSH Access for GitHub

<details>
<summary>Show SSH Setup</summary>

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
cat ~/.ssh/id_rsa.pub
```

* Copy and paste the output to GitHub
  (GitHub → Settings → SSH and GPG Keys → New SSH Key)

</details>

---

## ✅ 6. Clone Repository

```bash
git clone git@github.com:your_username/your_repository.git
cd your_repository
```

---

## ✅ 7. Create `.env` File

```bash
nano .env
```

Example content:

```env
MONGODB_URI=mongodb://localhost:27017/your_database
PORT=5000
JWT_SECRET=your_jwt_secret
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=user@example.com
EMAIL_PASSWORD=securepass
EMAIL_FROM=noreply@example.com
```

---

## ✅ 8. Install Docker + Docker Compose

<details>
<summary>Show Docker Setup</summary>

```bash
# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repo
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Add your user to Docker group
sudo usermod -aG docker $USER
```

Log out and log back in to apply Docker group permissions.

</details>

<details>
<summary>Install Docker Compose (Latest)</summary>

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" \
-o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose
```

</details>

---

## ✅ 9. Install Nginx (if not using Docker for Nginx)

```bash
sudo apt install -y nginx
```

> If you're using Docker-based Nginx (as in your `docker-compose.production.yml`), this step can be skipped.

---

## ✅ 10. Build and Run with Docker Compose

```bash
docker compose --env-file .env -f docker-compose.production.yml up -d --build
```

---

## ✅ 11. Check Running Containers

```bash
docker ps
```

---

## ✅ 12. Check Logs

```bash
docker logs <container_name>
# or follow logs
docker logs -f omyra-project_management-backend-1
```

---

## ✅ 13. Test Health Endpoint

```bash
curl http://localhost:5000/health
```

---
