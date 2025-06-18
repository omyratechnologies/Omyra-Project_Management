1. Created Azure VM
2. Installing MongoDB
[]: # # SSH into the VM
[]: # ssh azureuser@<your-mongodb-vm-ip>
[]: # 
[]: # # sudo apt update
[]: #
[]: # sudo apt-get install gnupg curl
[]: # curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
   --dearmor
[]: # echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
[]: # sudo apt-get update
[]: # sudo apt install -y mongodb-org
[]: # 
[]: # # Start MongoDB service
[]: # sudo systemctl start mongod
[]: # sudo systemctl enable mongod
[]: # ```
[]: # 
[]: # ### Step 3: Configure MongoDB for Remote Access

