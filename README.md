# SESEmailForward
Amazon SES Email Forward to Your Inbox

## Usage Guide
You can deploy the CloudFormation stack which will provision the following AWS Services
- SNS Topic to forward, received emails from SES
- IAM Role to invoke Lambda function from SNS
- Lambda function with NodeJS code to forward the emails to a defined from and to address
- IAM Role allowing Lambda to forward emails.

However, since AWS SES doesn't support CloudFormation at the moment, you need to create a email receiving rule from Amazon Web Console SES section and forward the email to the provisioned SNS topic (Need just to select the topic with UTF encoding).