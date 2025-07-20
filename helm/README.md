# E-commerce App Helm Chart

## 📦 Overview

This Helm chart deploys a complete e-commerce microservices application with the following components:

- **Frontend**: Nginx-based web interface
- **Backend**: Node.js API service
- **Payment Service**: Payment processing service
- **MongoDB**: Database service
- **Ingress**: Nginx ingress controller
- **Secrets**: Application secrets management
- **Network Policies**: Security policies
- **Autoscaling**: Horizontal Pod Autoscalers

## 🚀 Quick Start

### Prerequisites

- Kubernetes cluster (1.19+)
- Helm 3.x
- ArgoCD (optional, for GitOps)
- Azure Container Registry (or other registry)

### Installation

#### 1. Add Helm Repository (if using remote repo)

```bash
helm repo add ecommerce-app https://your-helm-repo.com
helm repo update
```

#### 2. Install the Chart

**Staging Environment:**
```bash
helm install ecommerce-staging ./helm/ecommerce-app \
  --namespace ecommerce-staging \
  --create-namespace \
  --set global.environment=staging \
  --set global.imageRegistry=your-registry.azurecr.io
```

**Production Environment:**
```bash
helm install ecommerce-production ./helm/ecommerce-app \
  --namespace ecommerce-production \
  --create-namespace \
  -f ./helm/ecommerce-app/values-production.yaml
```

#### 3. Verify Installation

```bash
# Check all resources
kubectl get all -n ecommerce-staging

# Check Helm releases
helm list -n ecommerce-staging

# Check application status
kubectl get pods -n ecommerce-staging
```

## ⚙️ Configuration

### Values File Structure

The chart uses a hierarchical configuration system:

```yaml
# Global settings
global:
  environment: staging
  imageRegistry: your-registry.azurecr.io

# Service-specific settings
frontend:
  enabled: true
  replicaCount: 2
  image:
    repository: ecommerce-app/frontend
    tag: latest

backend:
  enabled: true
  replicaCount: 2
  # ... more settings
```

### Environment-Specific Values

#### Staging (`values.yaml`)
- Lower resource limits
- Non-production secrets
- Staging domain
- Basic monitoring

#### Production (`values-production.yaml`)
- Higher resource limits
- Production secrets
- Production domain with SSL
- Full monitoring and logging

### Key Configuration Options

#### Image Configuration
```yaml
frontend:
  image:
    repository: ecommerce-app/frontend
    tag: latest
    pullPolicy: IfNotPresent
```

#### Resource Limits
```yaml
frontend:
  resources:
    limits:
      cpu: 200m
      memory: 256Mi
    requests:
      cpu: 100m
      memory: 128Mi
```

#### Autoscaling
```yaml
frontend:
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
```

#### Ingress Configuration
```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: staging.ecommerce.com
      paths:
        - path: /
          pathType: Prefix
```

## 🔧 Customization

### Override Values

```bash
# Override specific values
helm install ecommerce-staging ./helm/ecommerce-app \
  --set frontend.replicaCount=3 \
  --set backend.resources.limits.cpu=500m

# Use custom values file
helm install ecommerce-staging ./helm/ecommerce-app \
  -f custom-values.yaml
```

### Environment Variables

```yaml
backend:
  env:
    - name: MONGODB_URI
      value: "mongodb://mongodb-service:27017/ecommerce"
    - name: JWT_SECRET
      valueFrom:
        secretKeyRef:
          name: app-secrets
          key: jwt-secret
```

### Secrets Management

```yaml
secrets:
  enabled: true
  jwtSecret: "your-super-secret-jwt-key"
  mongodbPassword: "your-mongodb-password"
```

## 🔄 Upgrades and Rollbacks

### Upgrade Application

```bash
# Upgrade with new values
helm upgrade ecommerce-staging ./helm/ecommerce-app \
  --set frontend.image.tag=v1.1.0

# Upgrade with values file
helm upgrade ecommerce-staging ./helm/ecommerce-app \
  -f values-production.yaml
```

### Rollback

```bash
# List revisions
helm history ecommerce-staging

# Rollback to previous revision
helm rollback ecommerce-staging 1

# Rollback to specific revision
helm rollback ecommerce-staging 2
```

## 🗑️ Uninstallation

```bash
# Uninstall the release
helm uninstall ecommerce-staging -n ecommerce-staging

# Remove namespace (optional)
kubectl delete namespace ecommerce-staging
```

## 🔒 Security

### Network Policies

The chart includes network policies for service-to-service communication:

```yaml
networkPolicy:
  enabled: true
  frontendPolicy:
    enabled: true
    ingress:
      - from:
          - podSelector:
              matchLabels:
                app: backend
```

### Secrets

- JWT secrets for authentication
- MongoDB passwords
- TLS certificates (for production)

## 📊 Monitoring

### Health Checks

All services include liveness and readiness probes:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 30
  periodSeconds: 10
```

### Metrics

Enable Prometheus monitoring:

```yaml
monitoring:
  enabled: true
  prometheus:
    enabled: true
    serviceMonitor:
      enabled: true
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Image Pull Errors
```bash
# Check image pull secrets
kubectl get secrets -n ecommerce-staging

# Verify registry credentials
kubectl describe pod frontend-pod -n ecommerce-staging
```

#### 2. Service Communication Issues
```bash
# Test service connectivity
kubectl exec -it pod/frontend-pod -n ecommerce-staging -- curl backend-service:5000/health

# Check service endpoints
kubectl get endpoints -n ecommerce-staging
```

#### 3. Resource Constraints
```bash
# Check resource usage
kubectl top pods -n ecommerce-staging

# Check events
kubectl get events -n ecommerce-staging --sort-by='.lastTimestamp'
```

### Debug Commands

```bash
# Get detailed pod information
kubectl describe pod <pod-name> -n ecommerce-staging

# Check logs
kubectl logs -f deployment/frontend -n ecommerce-staging

# Port forward for local testing
kubectl port-forward svc/frontend-service 8080:80 -n ecommerce-staging
```

## 🔗 Integration with ArgoCD

### ArgoCD Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ecommerce-app-staging-helm
spec:
  source:
    repoURL: https://github.com/your-username/ecommerce-app.git
    path: helm/ecommerce-app
    helm:
      valueFiles:
        - values.yaml
      parameters:
        - name: global.environment
          value: staging
```

### GitOps Workflow

1. **Update values in Git**
2. **ArgoCD detects changes**
3. **Automatically syncs to cluster**
4. **Helm upgrades the release**

## 📚 Additional Resources

- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `helm template`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 