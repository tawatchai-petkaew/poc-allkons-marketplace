# Allkons Marketplace API Customer - Helm Configuration

## Environment-Specific Values Files

This directory contains environment-specific configuration files for deploying the API across different environments.

### Available Environments

| Environment | File | Description | Resources |
|------------|------|-------------|-----------|
| **Development** | `values.dev.yaml` | For local development and testing | CPU: 100m-500m, Memory: 128Mi-512Mi, 1 replica |
| **SIT** | `values.sit.yaml` | System Integration Testing | CPU: 150m-750m, Memory: 192Mi-768Mi, 1-2 replicas |
| **UAT** | `values.uat.yaml` | User Acceptance Testing | CPU: 200m-1000m, Memory: 256Mi-1Gi, 2-3 replicas |
| **Production** | `values.prd.yaml` | Production environment | CPU: 250m-1000m, Memory: 256Mi-1Gi, 2-10 replicas |

### Deployment Commands

#### Development
```bash
helm upgrade --install allkons-marketplace-api-customer . \
  -f values.dev.yaml \
  -f environments_byenv.yaml \
  --namespace dev
```

#### SIT
```bash
helm upgrade --install allkons-marketplace-api-customer . \
  -f values.sit.yaml \
  -f environments_byenv.yaml \
  --namespace sit
```

#### UAT
```bash
helm upgrade --install allkons-marketplace-api-customer . \
  -f values.uat.yaml \
  -f environments_byenv.yaml \
  --namespace uat
```

#### Production
```bash
helm upgrade --install allkons-marketplace-api-customer . \
  -f values.prd.yaml \
  -f environments_byenv.yaml \
  --namespace production
```

### Resource Allocation Strategy

#### Development (DEV)
- **Purpose**: Quick iterations, debugging, feature development
- **Cost**: ~$5-8/month
- **Scaling**: Disabled (fixed 1 replica)
- **Use Case**: Individual developer testing

#### System Integration Testing (SIT)
- **Purpose**: Integration testing, API contract validation
- **Cost**: ~$10-15/month
- **Scaling**: 1-2 replicas (autoscaling enabled)
- **Use Case**: Automated testing pipelines, integration validation

#### User Acceptance Testing (UAT)
- **Purpose**: Production-like environment for stakeholder testing
- **Cost**: ~$20-30/month
- **Scaling**: 2-3 replicas (high availability)
- **Use Case**: Pre-production validation, performance testing

#### Production (PROD)
- **Purpose**: Live customer traffic
- **Cost**: ~$35-50/month (base) + scaling costs
- **Scaling**: 2-10 replicas with autoscaling at 70% CPU
- **High Availability**: Pod anti-affinity, PDB enabled
- **Use Case**: Production workloads

### Performance Optimizations Applied

1. **CPU Increase**: From 50m → 250m (5x) for JWT RS256 verification
2. **Memory Increase**: From 100Mi → 256Mi (2.5x) for Node.js + TypeORM
3. **Query Optimization**: Merchant service uses single merged query
4. **Autoscaling**: Configured for optimal balance between cost and performance

### Expected Performance Impact

- **P50 Latency**: 600ms → <100ms (95% improvement)
- **P99 Latency**: 3500ms → <200ms (94% improvement)
- **Root Causes Fixed**:
  - ✅ CPU throttling during JWT verification
  - ✅ Memory pressure causing GC overhead
  - ✅ Double query pattern in merchant service
  - ⏳ Response caching (pending implementation)

### Migration Guide

If migrating from the old `values.yaml`:

1. Identify your current environment (dev/sit/uat/prod)
2. Use the corresponding `values.{env}.yaml` file
3. Keep `environments_byenv.yaml` for environment variables
4. Update your CI/CD pipelines to use the new file structure

### Best Practices

1. **Always test in lower environments first**: DEV → SIT → UAT → PROD
2. **Monitor resource usage**: Use kubectl top pods to validate resource allocation
3. **Adjust scaling thresholds**: Based on actual traffic patterns
4. **Review costs regularly**: Optimize replica counts based on usage

### Troubleshooting

#### High CPU Usage
- Check if autoscaling is working: `kubectl get hpa`
- Verify JWT verification is not causing bottlenecks
- Consider implementing response caching

#### High Memory Usage
- Review database query patterns
- Check for memory leaks in application logs
- Consider increasing memory limits if queries are legitimately large

#### Pod Evictions
- Increase resource requests to match actual usage
- Review pod priorities and preemption policies
- Check node capacity and scheduling

### Support

For questions or issues, contact the DevOps team or check the main project documentation.
