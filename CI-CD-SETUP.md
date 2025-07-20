# CI/CD Setup Guide - Azure DevOps + ArgoCD

## 🏗️ Architecture Overview

```
GitHub → Azure DevOps (CI) → Docker Registry → ArgoCD (CD) → Kubernetes
```

## 📋 Prerequisites

### 1. Azure DevOps Setup
- Azure DevOps Organization
- Azure Container Registry (ACR)
- Kubernetes clusters (staging & production)

### 2. ArgoCD Setup
- Kubernetes cluster with ArgoCD installed
- ArgoCD CLI installed locally
- GitHub repository access

### 3. Infrastructure Requirements
- Kubernetes clusters (staging & production)
- Ingress controller (NGINX)
- Load balancer
- Persistent storage (for MongoDB)

## 🔧 Step-by-Step Setup

### Step 1: Azure DevOps Configuration

#### 1.1 Create Service Connections

**Docker Registry Connection:**
```bash
# In Azure DevOps Project Settings
# Service Connections → New Service Connection → Docker Registry
Name: your-docker-registry-connection
Registry Type: Azure Container Registry
Subscription: [Your Azure Subscription]
Azure Container Registry: [Your ACR Name]
```

**Kubernetes Connections:**
```bash
# Staging Kubernetes Connection
Name: staging-k8s-connection
Service connection type: Kubernetes
Authentication method: Service Account
Cluster context: [Your Staging Cluster]

# Production Kubernetes Connection  
Name: production-k8s-connection
Service connection type: Kubernetes
Authentication method: Service Account
Cluster context: [Your Production Cluster]
```

#### 1.2 Create Environments

**Staging Environment:**
```bash
# Pipelines → Environments → New Environment
Name: staging
Description: Staging environment for ecommerce app
```

**Production Environment:**
```bash
# Pipelines → Environments → New Environment
Name: production
Description: Production environment for ecommerce app
```

#### 1.3 Configure Pipeline Variables

Update `azure-pipelines.yml`:
```yaml
variables:
  dockerRegistryServiceConnection: 'your-docker-registry-connection'
  imageRepository: 'ecommerce-app'
  containerRegistry: 'your-registry.azurecr.io'
```

### Step 2: ArgoCD Installation & Configuration

#### 2.1 Install ArgoCD

```bash
# Add ArgoCD Helm repository
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# Install ArgoCD
helm install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --set server.ingress.enabled=true \
  --set server.ingress.hosts[0]=argocd.your-domain.com
```

#### 2.2 Get ArgoCD Admin Password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

#### 2.3 Login to ArgoCD

```bash
argocd login argocd.your-domain.com --username admin --password [password]
```

### Step 3: Repository Configuration

#### 3.1 Update Repository URLs

Update `argocd/application.yml`:
```yaml
source:
  repoURL: https://github.com/your-username/ecommerce-app.git
  targetRevision: HEAD
  path: k8s/staging
```

#### 3.2 Create GitHub Secrets

In your GitHub repository settings:
```bash
ARGOCD_SERVER=argocd.your-domain.com
ARGOCD_USERNAME=admin
ARGOCD_PASSWORD=[your-argocd-password]
```

### Step 4: Kubernetes Secrets

#### 4.1 Create Application Secrets

```bash
# Create namespace
kubectl create namespace ecommerce-staging
kubectl create namespace ecommerce-production

# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=your-super-secret-jwt-key \
  --namespace ecommerce-staging

kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=your-super-secret-jwt-key \
  --namespace ecommerce-production
```

#### 4.2 Create MongoDB Secrets

```bash
kubectl create secret generic mongodb-secrets \
  --from-literal=mongodb-root-password=your-mongodb-password \
  --namespace ecommerce-staging

kubectl create secret generic mongodb-secrets \
  --from-literal=mongodb-root-password=your-mongodb-password \
  --namespace ecommerce-production
```

### Step 5: Deploy Applications

#### 5.1 Deploy ArgoCD Applications

```bash
# Apply ArgoCD application
kubectl apply -f argocd/application.yml

# Check application status
argocd app list
argocd app get ecommerce-app-staging
```

#### 5.2 Monitor Deployment

```bash
# Watch application sync
argocd app sync ecommerce-app-staging
argocd app wait ecommerce-app-staging --health

# Check pods
kubectl get pods -n ecommerce-staging
kubectl get services -n ecommerce-staging
```

## 🔄 CI/CD Pipeline Flow

### Development Workflow

1. **Developer pushes code to `develop` branch**
2. **Azure DevOps triggers build:**
   - Install dependencies
   - Run tests
   - Build Docker images
   - Push to Azure Container Registry
   - Deploy to staging environment

3. **ArgoCD detects changes:**
   - Syncs staging application
   - Updates Kubernetes resources
   - Health checks

4. **Manual promotion to production:**
   - Merge `develop` to `main`
   - Azure DevOps deploys to production
   - ArgoCD syncs production application

### Production Deployment

```bash
# Merge to main branch
git checkout main
git merge develop
git push origin main

# Monitor deployment
argocd app sync ecommerce-app-production
argocd app wait ecommerce-app-production --health
```

## 🧪 Testing Strategy

### Automated Testing

1. **Unit Tests:**
   ```bash
   # Backend tests
   cd backend && npm test
   
   # Payment service tests
   cd payment-service && npm test
   ```

2. **Integration Tests:**
   ```bash
   # API endpoint tests
   npm run test:integration
   ```

3. **Security Scans:**
   ```bash
   # Dependency vulnerability scan
   npm audit
   
   # Container security scan
   trivy image your-registry.azurecr.io/ecommerce-app/frontend:latest
   ```

### Manual Testing

1. **Staging Environment:**
   - Functional testing
   - UI/UX testing
   - Performance testing
   - Security testing

2. **Production Environment:**
   - Smoke tests
   - Load testing
   - Monitoring verification

## 📊 Monitoring & Observability

### 1. Application Monitoring

```yaml
# Add to Kubernetes deployments
spec:
  template:
    spec:
      containers:
      - name: app
        env:
        - name: PROMETHEUS_METRICS
          value: "true"
```

### 2. Logging

```yaml
# Configure logging
spec:
  template:
    spec:
      containers:
      - name: app
        volumeMounts:
        - name: logs
          mountPath: /var/log/app
```

### 3. Health Checks

```yaml
# Health check endpoints
livenessProbe:
  httpGet:
    path: /health
    port: 8080
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
```

## 🔒 Security Considerations

### 1. Secrets Management

```bash
# Use Azure Key Vault
az keyvault secret set --vault-name your-vault --name jwt-secret --value "your-secret"

# Reference in Kubernetes
env:
- name: JWT_SECRET
  valueFrom:
    secretKeyRef:
      name: azure-key-vault-secret
      key: jwt-secret
```

### 2. Network Policies

```yaml
# Network policy for microservices
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: frontend-policy
spec:
  podSelector:
    matchLabels:
      app: frontend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: backend
    ports:
    - protocol: TCP
      port: 80
```

### 3. RBAC Configuration

```yaml
# Service account with minimal permissions
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ecommerce-app-sa
  namespace: ecommerce-staging
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ecommerce-app-role
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list", "watch"]
```

## 🚀 Deployment Commands

### Quick Deploy

```bash
# Deploy to staging
git push origin develop

# Deploy to production
git checkout main
git merge develop
git push origin main
```

### Manual Sync

```bash
# Sync specific application
argocd app sync ecommerce-app-staging

# Force sync
argocd app sync ecommerce-app-staging --force

# Rollback
argocd app rollback ecommerce-app-staging
```

## 📈 Scaling & Performance

### Horizontal Pod Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Resource Limits

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures:**
   ```bash
   # Check Azure DevOps logs
   # Verify Docker registry credentials
   # Check Node.js version compatibility
   ```

2. **Deployment Failures:**
   ```bash
   # Check ArgoCD application status
   argocd app get ecommerce-app-staging
   
   # Check Kubernetes events
   kubectl get events -n ecommerce-staging
   
   # Check pod logs
   kubectl logs -f deployment/frontend -n ecommerce-staging
   ```

3. **Service Communication:**
   ```bash
   # Test service connectivity
   kubectl exec -it pod/frontend-pod -n ecommerce-staging -- curl backend-service:5000/health
   ```

### Debug Commands

```bash
# Check ArgoCD status
argocd app list
argocd app get ecommerce-app-staging

# Check Kubernetes resources
kubectl get all -n ecommerce-staging
kubectl describe pod frontend-pod -n ecommerce-staging

# Check logs
kubectl logs -f deployment/frontend -n ecommerce-staging
kubectl logs -f deployment/backend -n ecommerce-staging
```

## 📚 Additional Resources

- [Azure DevOps Documentation](https://docs.microsoft.com/en-us/azure/devops/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

**Your CI/CD pipeline is now ready! 🚀** 