# 🔐 GitHub Repository Secrets Configuration

## Required Secrets for CI/CD Pipeline

To enable automated deployments via GitHub Actions, you need to add the following secrets to your GitHub repository:

### 🔧 How to Add Secrets
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name and value

---

## 📋 Required Secrets List

### Server Access
```
SECRET NAME: HOST
VALUE: 4.240.101.137
DESCRIPTION: IP address of the production server
```

```
SECRET NAME: USERNAME
VALUE: azureuser
DESCRIPTION: SSH username for server access
```

```
SECRET NAME: SSH_KEY
VALUE: [Content of your private SSH key file]
DESCRIPTION: Complete content of omyra-project-management_key.pem file
```

### Application Configuration
```
SECRET NAME: JWT_SECRET
VALUE: 9f8ba3b2cf0e9d8c7b6a5e4d7c6d5e4a3b2cf0e9d8c7b6a5e4d
DESCRIPTION: JWT secret key for authentication (change this to a random string)
```

### Email Configuration
```
SECRET NAME: EMAIL_HOST
VALUE: smtp.omyratech.com
DESCRIPTION: SMTP server hostname
```

```
SECRET NAME: EMAIL_PORT
VALUE: 465
DESCRIPTION: SMTP server port
```

```
SECRET NAME: EMAIL_USER
VALUE: gopi.chakradhar@omyratech.com
DESCRIPTION: SMTP username
```

```
SECRET NAME: EMAIL_PASSWORD
VALUE: Gopi#OM002!
DESCRIPTION: SMTP password
```

```
SECRET NAME: EMAIL_FROM
VALUE: noreply@omyratech.com
DESCRIPTION: From email address
```

---

## 🚀 Setting Up SSH Key Secret

### Step 1: Get your SSH private key content
```bash
# On your local machine
cat ~/Downloads/omyra-project-management_key.pem
```

### Step 2: Copy the entire output
The content should look like this:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
[many lines of encoded content]
...
-----END RSA PRIVATE KEY-----
```

### Step 3: Add to GitHub Secrets
- **Name**: `SSH_KEY`
- **Value**: Paste the entire content including the BEGIN and END lines

---

## 🔐 Security Best Practices

### JWT Secret Generation
Generate a secure JWT secret:
```bash
# Generate a random 64-character string
openssl rand -hex 32
```

### Password Security
- Use strong, unique passwords
- Consider using environment-specific credentials
- Rotate secrets regularly

### Key Management
- Never commit secrets to code
- Use different secrets for different environments
- Regularly audit and rotate access keys

---

## ✅ Verification

After adding all secrets, verify they are correctly set:

1. **Check Secrets List**: Ensure all 8 secrets are added
2. **Test Deployment**: Push to main branch to trigger workflow
3. **Monitor Workflow**: Check Actions tab for deployment status
4. **Verify Application**: Confirm https://pms.omyratech.com is accessible

---

## 🐛 Troubleshooting

### Common Issues

1. **SSH Connection Failed**:
   - Verify SSH_KEY contains complete private key
   - Check HOST and USERNAME values
   - Ensure server is accessible

2. **Environment Variables Not Set**:
   - Verify all secrets are named exactly as shown
   - Check for typos in secret names
   - Ensure values don't contain extra spaces

3. **Deployment Fails**:
   - Check GitHub Actions logs
   - Verify server has enough resources
   - Confirm Docker is running on server

### Testing SSH Connection
```bash
# Test SSH connection manually
ssh -i omyra-project-management_key.pem azureuser@4.240.101.137
```

---

## 📝 Secrets Checklist

Before triggering deployment, ensure you have:

- [ ] ✅ **HOST** - Server IP address
- [ ] ✅ **USERNAME** - SSH username
- [ ] ✅ **SSH_KEY** - Complete private key content
- [ ] ✅ **JWT_SECRET** - Secure random string
- [ ] ✅ **EMAIL_HOST** - SMTP server
- [ ] ✅ **EMAIL_PORT** - SMTP port
- [ ] ✅ **EMAIL_USER** - SMTP username
- [ ] ✅ **EMAIL_PASSWORD** - SMTP password
- [ ] ✅ **EMAIL_FROM** - From email address

---

## 🚀 Ready for Deployment!

Once all secrets are configured:
1. **Push to main branch** to trigger automatic deployment
2. **Monitor GitHub Actions** for deployment progress
3. **Verify application** at https://pms.omyratech.com
4. **Check health endpoint** at https://pms.omyratech.com/health

---

*Need help? Check the DEVOPS-DEPLOYMENT-GUIDE.md for detailed instructions.*
