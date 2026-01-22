# Voice Farming Assistant - Deployment Checklist

## Pre-Deployment Phase

### ✅ Environment Setup
- [ ] AWS Account created and verified
- [ ] AWS CLI v2 installed and configured
- [ ] IAM user with appropriate permissions created
- [ ] Node.js 18+ installed
- [ ] SAM CLI installed
- [ ] Git configured

### ✅ Repository Preparation
- [ ] Repository cloned to local machine
- [ ] `.env` file created from `.env.example`
- [ ] AWS region selected (recommended: `ap-south-1` for India)
- [ ] Stack name decided (e.g., `vfa-prod`, `vfa-staging`, `vfa-dev`)

### ✅ Code Review
- [ ] All Lambda functions reviewed
- [ ] No hardcoded credentials in code
- [ ] All required environment variables documented
- [ ] Error handling in place
- [ ] Logging statements appropriate

### ✅ Configuration Review
- [ ] `template.yaml` reviewed for correctness
- [ ] DynamoDB table configurations checked
- [ ] S3 bucket naming conventions verified
- [ ] Lambda timeouts appropriate for intended use
- [ ] Memory allocations reasonable

## Development Environment Validation

### ✅ Local Testing
```bash
[ ] npm install completes successfully
[ ] npm run test passes all tests
[ ] npm run lint shows no critical issues
[ ] sam build completes without errors
[ ] sam local start-api runs without errors
```

### ✅ API Testing
```bash
[ ] Connect handler responds to calls
[ ] Lex fulfillment processes intents correctly
[ ] Bedrock integration returns valid responses
[ ] Polly voice generation works
[ ] Image processing triggers on S3 upload
```

## Pre-Deployment AWS Setup

### ✅ IAM Configuration
- [ ] Lambda execution role created
- [ ] DynamoDB access policies attached
- [ ] S3 bucket access policies configured
- [ ] Bedrock inference permissions granted
- [ ] Polly access enabled
- [ ] CloudWatch Logs permissions set

### ✅ AWS Services Verification
- [ ] Amazon Connect instance available
- [ ] Bedrock Claude model access requested (if needed)
- [ ] Polly service accessible in target region
- [ ] DynamoDB service limit increased (if needed)
- [ ] Lambda concurrent execution limit checked

## Deployment Phase

### ✅ CloudFormation Deployment
```bash
[ ] sam deploy --guided executed
[ ] Stack name entered correctly
[ ] Region confirmed as ap-south-1 (or chosen region)
[ ] Capabilities CAPABILITY_IAM and CAPABILITY_NAMED_IAM confirmed
[ ] All parameters reviewed and accepted
[ ] Stack creation in progress
[ ] Stack creation completed successfully
```

### ✅ Verify CloudFormation Stack
```bash
[ ] All resources created (Lambda, DynamoDB, S3, etc.)
[ ] No failed resources in stack
[ ] Outputs displayed and noted
[ ] Stack tags applied correctly
```

### ✅ Lambda Functions Verification
- [ ] `vfa-connect-handler-[env]` deployed and active
- [ ] `vfa-lex-fulfillment-[env]` deployed and active
- [ ] `vfa-bedrock-agent-[env]` deployed and active
- [ ] `vfa-data-processor-[env]` deployed and active
- [ ] All functions have correct environment variables
- [ ] All functions have appropriate IAM roles

### ✅ DynamoDB Tables
- [ ] `farmer-profiles-[env]` created
- [ ] `crop-data-[env]` created
- [ ] `conversation-history-[env]` created
- [ ] All tables have correct key schema
- [ ] TTL enabled on conversation history
- [ ] Stream enabled for real-time processing

### ✅ S3 Buckets
- [ ] `vfa-media-[account-id]-[env]` created
- [ ] `vfa-models-[account-id]-[env]` created
- [ ] Versioning enabled
- [ ] Public access blocked
- [ ] Encryption enabled
- [ ] Lifecycle policies configured

## Post-Deployment Configuration

### ✅ Amazon Connect Setup
- [ ] Contact flow created with Lambda integration
- [ ] Lambda permissions for Connect granted
- [ ] Phone number assigned
- [ ] Contact flow published
- [ ] IVR routing configured
- [ ] Call recording enabled (if needed)

### ✅ Amazon Lex Configuration
- [ ] Bot created with intents
- [ ] Intents trained
- [ ] Fulfillment Lambda linked
- [ ] Bot published to production alias
- [ ] Lambda permissions for Lex granted
- [ ] Confidence thresholds set

### ✅ Amazon Bedrock Configuration
- [ ] Claude model access verified
- [ ] Model ID in Lambda environment variables correct
- [ ] Inference permissions tested
- [ ] Temperature and token parameters tuned
- [ ] System prompts loaded

### ✅ Monitoring & Logging Setup
- [ ] CloudWatch log groups created
- [ ] Log retention set to 30 days
- [ ] CloudWatch alarms created:
  - [ ] Lambda error rate > 1%
  - [ ] Lambda duration > 5 seconds
  - [ ] DynamoDB throttling
  - [ ] Bedrock errors
- [ ] Dashboard created for metrics
- [ ] SNS topics for alerts configured

## Testing Phase

### ✅ Functional Testing
```bash
[ ] Test call ingestion
[ ] Test Lex intent recognition
[ ] Test Bedrock response generation
[ ] Test Polly audio generation
[ ] Test image upload and analysis
[ ] Test error handling
[ ] Test fallback responses
```

### ✅ Language Testing
- [ ] Hindi language responses working
- [ ] Tamil language responses working
- [ ] Other supported languages tested
- [ ] Polly voices sound natural
- [ ] Language selection working

### ✅ Performance Testing
- [ ] End-to-end latency < 10 seconds
- [ ] Concurrent call handling
- [ ] Database query performance
- [ ] Lambda cold start times acceptable
- [ ] Polly generation time acceptable

### ✅ Security Testing
- [ ] No sensitive data in logs
- [ ] Encryption working for all data
- [ ] IAM roles properly scoped
- [ ] API rate limiting in place
- [ ] DDoS protection configured

## Production Readiness

### ✅ Documentation
- [ ] Deployment guide updated
- [ ] API documentation current
- [ ] Architecture documented
- [ ] Runbook created for common issues
- [ ] Escalation procedures documented

### ✅ Backup & Disaster Recovery
- [ ] DynamoDB backup strategy configured
- [ ] S3 versioning and backup verified
- [ ] Multi-region deployment option evaluated
- [ ] RTO and RPO documented
- [ ] Failover testing completed

### ✅ Team Readiness
- [ ] Team trained on monitoring
- [ ] On-call rotation established
- [ ] Incident response plan created
- [ ] Communication channels set up
- [ ] Alert escalation defined

## Deployment Completion

### ✅ Go-Live
- [ ] All tests passed
- [ ] Monitoring active and alerting
- [ ] Team briefed on system
- [ ] Runbooks distributed
- [ ] First set of test farmers identified
- [ ] Go-live approval obtained

### ✅ Post-Go-Live (First 24 Hours)
- [ ] Monitor error rates continuously
- [ ] Check CloudWatch logs for issues
- [ ] Monitor Bedrock API usage
- [ ] Verify DynamoDB performance
- [ ] Test failover procedures
- [ ] Collect feedback from test users

### ✅ First Week Monitoring
- [ ] Daily metric review
- [ ] Adjust Lambda concurrency if needed
- [ ] Optimize Bedrock prompts based on responses
- [ ] Monitor cost trends
- [ ] Review user feedback
- [ ] Performance baseline established

## Rollback Procedures

### ✅ Rollback Plan (If Needed)
```bash
[ ] Document current stack status
[ ] Decide rollback trigger (error rate, latency, etc.)
[ ] Create rollback checklist
[ ] Test rollback in staging first
[ ] Execute rollback if needed:
    aws cloudformation cancel-update-stack \
      --stack-name voice-farming-assistant-prod
[ ] Verify rollback success
[ ] Document root cause
```

## Post-Deployment Sign-Off

**Deployment Date**: ________________
**Deployed By**: ________________
**Verified By**: ________________
**Notes**: 
```
[Space for any deployment notes]
```

## Contacts for Support

| Role | Name | Email | Phone |
|------|------|-------|-------|
| Tech Lead | | | |
| DevOps | | | |
| On-Call | | | |
| Manager | | | |

---

## Key Metrics to Track

- **Call Volume**: Calls/hour, Calls/day
- **Success Rate**: % of successful interactions
- **Latency**: P50, P95, P99 response times
- **Error Rate**: % of failed requests
- **Cost**: Daily/weekly/monthly spend
- **Farmer Retention**: % returning farmers
- **CSAT**: Farmer satisfaction score

---

**Remember**: Start with dev environment, move to staging, then production. Never skip testing!

Good luck with your deployment! 🌾
