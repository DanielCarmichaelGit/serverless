# Serverless Scholarship Scraper

Simple scholarship scraping service built for AWS Lambda.

## Getting Started

### Prerequisites

- AWS CLI installed
- AWS IAM user with Lambda permissions

### AWS Configuration

Configure your AWS CLI with your IAM user credentials:

```bash
# Configure AWS CLI with your IAM user access key and secret
aws configure

# You'll be prompted to enter:
# AWS Access Key ID: [Your IAM user access key]
# AWS Secret Access Key: [Your IAM user secret key]
# Default region name: [e.g., us-east-1]
# Default output format: json
```

Your IAM user needs permissions for:

- `lambda:UpdateFunctionCode`
- `lambda:InvokeFunction`
- `logs:DescribeLogGroups`
- `logs:DescribeLogStreams`
- `logs:GetLogEvents`

## Usage

```javascript
import scrapeScholarships from "./utils/orchestrations/scholarshipScraper.mjs";

// Scrape scholarships from Bold.org
const results = await scrapeScholarships(100, "bold", true);
```

## Deployment

### Build and Deploy

```bash
# Build and package the Lambda function
npm run zip:scholarships

# Deploy to AWS Lambda
aws lambda update-function-code --function-name scholarships --zip-file fileb://dist/scholarships.zip
```

## Testing

### Test Lambda Function

```bash
# Invoke the Lambda function with test data
aws lambda invoke --function-name scholarships --payload fileb://test-event.json out.json && cat out.json

# Watch logs in real-time
aws logs tail /aws/lambda/scholarships --follow
```

## Available Sites

- `bold` - Bold.org scholarships (fully implemented)
- `threeSixty` - 360 Scholarships (not implemented)
- `collegeboard` - College Board (not implemented)

## Parameters

- `count` - Number of scholarships to scrape
- `site` - Site to scrape from ("bold", "threeSixty", "collegeboard")
- `deep` - Whether to scrape individual scholarship pages (true/false)
