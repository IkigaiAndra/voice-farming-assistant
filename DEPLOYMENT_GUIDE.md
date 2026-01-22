/**
 * DEPLOYMENT GUIDE
 * Voice Farming Assistant - Deep Thinking ChatGPT for Indian Farmers
 * Deploy to Production on AWS
 */

// ============================================================================
// PART 1: PRE-DEPLOYMENT CHECKLIST
// ============================================================================

/*
Before deploying to production, ensure:

BACKEND:
□ All environment variables configured
□ AWS credentials have proper permissions
□ Bedrock model access verified (ap-south-1)
□ Polly service enabled
□ S3 bucket created for audio
□ DynamoDB table created for farmer data
□ Error handling implemented for all API routes
□ Rate limiting configured
□ CORS headers configured correctly
□ Database backups enabled
□ Logging configured (CloudWatch)

FRONTEND:
□ Build runs without errors (npm run build)
□ No console warnings or errors
□ Environment variables updated (.env.production)
□ API URLs point to production backend
□ Mobile responsive design verified
□ All images optimized
□ Service worker configured (PWA)
□ Security headers added

TESTING:
□ Unit tests pass (npm test)
□ Integration tests pass
□ API endpoint tests pass
□ E2E tests pass (if available)
□ Performance acceptable (<3 seconds)
□ Load testing with concurrent users
□ Security scanning (npm audit)
□ Accessibility check (WCAG 2.1 AA)

DOCUMENTATION:
□ README updated
□ API documentation complete
□ Environment variables documented
□ Troubleshooting guide prepared
□ Incident response plan created
□ Runbook for common issues
*/

// ============================================================================
// PART 2: STEP-BY-STEP DEPLOYMENT
// ============================================================================

/*
STEP 1: PREPARE AWS ACCOUNT
════════════════════════════

1. Verify Region: ap-south-1 (Asia Pacific - Mumbai)
   - All resources should be in this region for lowest latency
   - Check AWS console > Region selector > Asia Pacific (Mumbai)

2. Create IAM User with Required Permissions:
   - Bedrock access
   - Polly access
   - S3 access
   - DynamoDB access
   - Lambda access (if using serverless)
   - CloudWatch logs
   
   Permissions JSON:
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "bedrock:InvokeModel",
           "bedrock:GetFoundationModel"
         ],
         "Resource": "*"
       },
       {
         "Effect": "Allow",
         "Action": [
           "polly:SynthesizeSpeech"
         ],
         "Resource": "*"
       },
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::voice-farming-*",
           "arn:aws:s3:::voice-farming-*/*"
         ]
       },
       {
         "Effect": "Allow",
         "Action": [
           "dynamodb:GetItem",
           "dynamodb:PutItem",
           "dynamodb:UpdateItem",
           "dynamodb:Query",
           "dynamodb:Scan"
         ],
         "Resource": "arn:aws:dynamodb:ap-south-1:*:table/FarmerData"
       },
       {
         "Effect": "Allow",
         "Action": [
           "logs:CreateLogGroup",
           "logs:CreateLogStream",
           "logs:PutLogEvents"
         ],
         "Resource": "arn:aws:logs:ap-south-1:*:*"
       }
     ]
   }

3. Create S3 Buckets:
   - Voice Farming Audio Bucket (for Polly output)
   - Frontend Static Hosting Bucket
   
   aws s3api create-bucket \
     --bucket voice-farming-audio-prod \
     --region ap-south-1 \
     --create-bucket-configuration LocationConstraint=ap-south-1
   
   aws s3api create-bucket \
     --bucket voice-farming-frontend-prod \
     --region ap-south-1 \
     --create-bucket-configuration LocationConstraint=ap-south-1

4. Create DynamoDB Table:
   Table Name: FarmerData
   Partition Key: farmerId (String)
   Sort Key: timestamp (Number)
   
   aws dynamodb create-table \
     --table-name FarmerData \
     --attribute-definitions \
       AttributeName=farmerId,AttributeType=S \
       AttributeName=timestamp,AttributeType=N \
     --key-schema \
       AttributeName=farmerId,KeyType=HASH \
       AttributeName=timestamp,KeyType=RANGE \
     --billing-mode PAY_PER_REQUEST \
     --region ap-south-1


STEP 2: PREPARE ENVIRONMENT
════════════════════════════

1. Create .env.production file:

   # AWS
   AWS_REGION=ap-south-1
   AWS_ACCESS_KEY_ID=<production-key>
   AWS_SECRET_ACCESS_KEY=<production-secret>
   
   # Bedrock
   BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
   
   # Polly
   POLLY_REGION=ap-south-1
   POLLY_VOICES_HI=Aditi
   POLLY_VOICES_TA=Kajal
   POLLY_VOICES_TE=Chitra
   POLLY_VOICES_KA=Vittal
   POLLY_VOICES_ML=Karthik
   POLLY_VOICES_MR=Arjun
   POLLY_VOICES_EN=Joanna
   
   # S3
   S3_AUDIO_BUCKET=voice-farming-audio-prod
   S3_AUDIO_REGION=ap-south-1
   
   # DynamoDB
   DYNAMODB_TABLE=FarmerData
   DYNAMODB_REGION=ap-south-1
   
   # API
   API_PORT=3000
   NODE_ENV=production
   LOG_LEVEL=info
   
   # Frontend
   REACT_APP_API_URL=https://api.voicefarmingassistant.com
   REACT_APP_ENVIRONMENT=production

2. Store in AWS Secrets Manager:
   
   aws secretsmanager create-secret \
     --name voice-farming-prod-env \
     --secret-string file://.env.production \
     --region ap-south-1


STEP 3: BUILD OPTIMIZATIONS
═════════════════════════════

1. Backend Build:
   
   npm install --production  # Remove dev dependencies
   npm run build             # Compile TypeScript (if used)
   npm prune                 # Remove unused packages

2. Frontend Build:
   
   cd frontend
   npm install --production
   npm run build             # Creates optimized bundle in /dist
   
   # Output should be:
   # dist/index.html           (optimized HTML)
   # dist/assets/               (bundled JS/CSS)
   # dist/assets/vendor/        (shared libraries)

3. Verify Build Size:
   
   du -sh frontend/dist
   # Target: <5MB total size
   
   # If too large, analyze:
   npm install -g source-map-explorer
   source-map-explorer 'frontend/dist/assets/*.js'


STEP 4: DEPLOY BACKEND TO AWS LAMBDA
══════════════════════════════════════

Option A: Using AWS Lambda with API Gateway

1. Install Serverless Framework:
   
   npm install -g serverless
   serverless plugin install -n serverless-offline
   serverless plugin install -n serverless-dynamodb-local

2. Create serverless.yml:
   
   service: voice-farming-api
   
   provider:
     name: aws
     runtime: nodejs18.x
     region: ap-south-1
     environment:
       AWS_REGION: ${self:provider.region}
       NODE_ENV: production
   
   functions:
     api:
       handler: server.handler
       events:
         - http:
             path: /{proxy+}
             method: ANY
             cors: true
       timeout: 30
       memorySize: 512
       environment:
         AWS_REGION: ap-south-1
   
   plugins:
     - serverless-offline

3. Wrap Express app for Lambda:
   
   // server.js
   const serverless = require('serverless-http');
   const app = require('./app');
   
   module.exports.handler = serverless(app);

4. Deploy:
   
   serverless deploy --stage prod --region ap-south-1

5. Get API Gateway URL:
   
   serverless info --stage prod
   # API endpoint: https://xxx.execute-api.ap-south-1.amazonaws.com/prod


Option B: Using EC2 with PM2

1. Launch EC2 Instance:
   
   - Instance Type: t3.medium (for testing), t3.large (for production)
   - Region: ap-south-1
   - Security Group: Allow ports 80, 443, 22
   - Storage: 50GB EBS

2. SSH into instance:
   
   ssh -i your-key.pem ubuntu@your-instance-ip

3. Install Node.js and PM2:
   
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2

4. Deploy application:
   
   git clone <repo> /home/ubuntu/app
   cd /home/ubuntu/app
   npm install --production
   pm2 start server.js --name "voice-farming-api"
   pm2 save
   pm2 startup

5. Setup Nginx as reverse proxy:
   
   sudo apt-get install -y nginx
   
   # Create /etc/nginx/sites-available/voice-farming
   upstream api {
     server localhost:3000;
   }
   
   server {
     listen 80;
     server_name api.voicefarmingassistant.com;
     
     client_max_body_size 50M;
     
     location / {
       proxy_pass http://api;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
   }
   
   sudo ln -s /etc/nginx/sites-available/voice-farming /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx

6. Setup SSL with Let's Encrypt:
   
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot certonly --nginx -d api.voicefarmingassistant.com


STEP 5: DEPLOY FRONTEND TO S3 + CloudFront
═════════════════════════════════════════════

1. Build frontend:
   
   cd frontend
   npm run build

2. Sync to S3:
   
   aws s3 sync dist/ \
     s3://voice-farming-frontend-prod/ \
     --delete \
     --cache-control "public, max-age=3600" \
     --region ap-south-1
   
   # For versioned assets:
   aws s3 sync dist/assets/ \
     s3://voice-farming-frontend-prod/assets/ \
     --cache-control "public, max-age=31536000" \
     --region ap-south-1

3. Create CloudFront Distribution:
   
   - Origin: S3 bucket
   - Origin Access Identity: Create new
   - Default Root Object: index.html
   - Compress: Yes
   - Cache behaviors:
     * /api/* → Custom Origin (Lambda/EC2)
     * /assets/* → S3 (30 days cache)
     * /* → S3 (5 min cache)

4. Enable S3 Static Website:
   
   aws s3 website s3://voice-farming-frontend-prod/ \
     --index-document index.html \
     --error-document index.html \
     --region ap-south-1

5. Get CloudFront URL:
   
   # Use in browser:
   # https://d123456789.cloudfront.net/


STEP 6: SETUP MONITORING & LOGGING
═════════════════════════════════════

1. CloudWatch Logs:
   
   # View logs
   aws logs tail /aws/lambda/voice-farming-api \
     --follow --region ap-south-1
   
   # Create alarms
   aws cloudwatch put-metric-alarm \
     --alarm-name voice-farming-errors \
     --alarm-description "Alert on API errors" \
     --metric-name Errors \
     --namespace AWS/Lambda \
     --statistic Sum \
     --period 300 \
     --threshold 10 \
     --comparison-operator GreaterThanThreshold \
     --region ap-south-1

2. Setup SNS Notifications:
   
   aws sns create-topic --name voice-farming-alerts
   aws sns subscribe \
     --topic-arn arn:aws:sns:ap-south-1:xxx:voice-farming-alerts \
     --protocol email \
     --notification-endpoint admin@voicefarmingassistant.com

3. Create Dashboard:
   
   aws cloudwatch put-dashboard \
     --dashboard-name VoiceFarmingMetrics \
     --dashboard-body file://dashboard.json


STEP 7: DOMAIN & SSL SETUP
═════════════════════════════

1. Register Domain:
   
   Domain: voicefarmingassistant.com
   Registrar: Route53 / GoDaddy / Namecheap

2. Create Route53 Hosted Zone:
   
   aws route53 create-hosted-zone \
     --name voicefarmingassistant.com

3. Create DNS Records:
   
   A Record:
   - Name: api
   - Value: CloudFront distribution domain
   
   A Record:
   - Name: www
   - Value: CloudFront distribution domain

4. SSL Certificate (AWS Certificate Manager):
   
   aws acm request-certificate \
     --domain-name voicefarmingassistant.com \
     --subject-alternative-names api.voicefarmingassistant.com \
     --region ap-south-1

5. Attach to CloudFront:
   
   Update CloudFront distribution:
   - SSL Certificate: Select from ACM
   - Alternate Domain Names: voicefarmingassistant.com


STEP 8: DATABASE BACKUP & RECOVERY
════════════════════════════════════

1. Enable DynamoDB Backup:
   
   aws dynamodb update-continuous-backups \
     --table-name FarmerData \
     --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true \
     --region ap-south-1

2. Automated Backups:
   
   aws dynamodb create-backup \
     --table-name FarmerData \
     --backup-name FarmerData-backup-$(date +%Y%m%d-%H%M%S) \
     --region ap-south-1

3. Restore from Backup:
   
   aws dynamodb restore-table-from-backup \
     --target-table-name FarmerData-restored \
     --backup-arn arn:aws:dynamodb:ap-south-1:xxx:table/FarmerData/backup/xxx \
     --region ap-south-1


STEP 9: PERFORMANCE TESTING
═════════════════════════════

1. Load Testing with Artillery:
   
   npm install -g artillery
   
   # Create load-test.yml
   config:
     target: https://api.voicefarmingassistant.com
     phases:
       - duration: 60
         arrivalRate: 10
   scenarios:
     - name: Deep Chat Flow
       flow:
         - post:
             url: /api/deep-chat
             json:
               query: कैसे अपनी आय बढ़ा सकता हूँ?
               farmerId: farmer_001
   
   # Run test
   artillery run load-test.yml

2. Expected Results:
   - Avg Response Time: < 3 seconds
   - p99 Response Time: < 10 seconds
   - Error Rate: < 0.1%
   - Throughput: > 10 requests/second

3. Optimization if slow:
   - Increase Lambda memory
   - Enable DynamoDB autoscaling
   - Add Redis caching
   - Optimize database queries


STEP 10: POST-DEPLOYMENT VERIFICATION
════════════════════════════════════════

Checklist:
□ Frontend loads without errors
□ API endpoints respond correctly
□ Voice input works
□ Audio playback works
□ All 7 languages work
□ Context panel displays correctly
□ Action plans visible
□ Mobile layout works
□ Metrics flowing to CloudWatch
□ Alarms configured and tested
□ Backups running
□ SSL certificate valid
□ Performance acceptable

Smoke Tests:
1. Open frontend: https://voicefarmingassistant.com
2. Create profile with test farmer
3. Ask sample questions in each language
4. Record voice input
5. Verify audio playback
6. Check CloudWatch logs for errors
7. Monitor dashboard for metrics
*/

// ============================================================================
// PART 3: MAINTENANCE & MONITORING
// ============================================================================

/*
WEEKLY CHECKS:
──────────────
□ Review error logs in CloudWatch
□ Check API response times
□ Verify backups completed
□ Test failover/recovery procedures
□ Update dependencies for security patches

MONTHLY CHECKS:
────────────────
□ Review and optimize costs (AWS billing)
□ Analyze user feedback
□ Performance trending
□ Security audit
□ Disaster recovery drill

QUARTERLY CHECKS:
──────────────────
□ Capacity planning for growth
□ Database optimization
□ Infrastructure review
□ Security assessment
□ Feature roadmap planning
*/

// ============================================================================
// PART 4: ROLLBACK PROCEDURE
// ============================================================================

/*
If deployment fails or has critical issues:

1. Quick Rollback (Lambda):
   
   # Get previous version
   aws lambda list-versions-by-function \
     --function-name voice-farming-api \
     --region ap-south-1
   
   # Update alias to previous version
   aws lambda update-alias \
     --function-name voice-farming-api \
     --name prod \
     --function-version <previous-version> \
     --region ap-south-1

2. Quick Rollback (Frontend):
   
   # If CloudFront cached, invalidate cache
   aws cloudfront create-invalidation \
     --distribution-id <distribution-id> \
     --paths "/*"
   
   # Redeploy previous build
   aws s3 sync previous-dist/ s3://voice-farming-frontend-prod/

3. Database Rollback:
   
   # Restore from point-in-time backup
   aws dynamodb restore-table-from-backup \
     --target-table-name FarmerData-rollback \
     --backup-arn <backup-arn>

4. Communication:
   
   - Notify users of issue
   - Post status on status page
   - Update team on rollback progress
   - Document root cause
   - Plan fix for next deployment
*/

// ============================================================================
// PART 5: DISASTER RECOVERY PLAN
// ============================================================================

/*
SCENARIO: Database corrupted/lost
──────────────────────────────────
1. Restore from DynamoDB point-in-time backup
2. Create new table from backup
3. Validate data integrity
4. Test application with restored data
5. If verified, swap table names

SCENARIO: S3 bucket deleted
────────────────────────────
1. Contact AWS Support (immediate)
2. Restore from S3 backup (if configured)
3. Rebuild frontend and redeploy
4. Update CloudFront distribution
5. Notify users of service restoration

SCENARIO: Lambda function crashed
─────────────────────────────────
1. Check CloudWatch Logs for error
2. Redeploy previous working version
3. Investigate root cause
4. Deploy fix
5. Monitor closely for 24 hours

SCENARIO: Complete region outage
────────────────────────────────
1. If AWS region ap-south-1 down:
   - Activate disaster recovery region (ap-southeast-1)
   - Restore database from backup
   - Update DNS to new region
   - Estimated RTO: 30 minutes, RPO: 1 hour

Recovery Time Objectives (RTOs):
- Minor bug: 30 minutes
- Database issue: 2 hours
- Complete outage: 4 hours

Recovery Point Objectives (RPOs):
- Data: Last 1 hour backup
- Code: Last deployment
- Configuration: Last commit
*/

export default {};
