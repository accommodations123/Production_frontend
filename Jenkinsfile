pipeline {
    agent any
 
    environment {
        S3_BUCKET = "prod-nextkinlife-frontend"
        CLOUDFRONT_ID = "EE19WHFK5I0FA"
        AWS_REGION = "us-east-2"
    }
 
    stages {
 
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
 
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
 
        stage('Build Project') {
            steps {
                sh 'npm run build'
            }
        }
 
        stage('Deploy to S3') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                                  credentialsId: 'aws-creds']]) {
 
                    sh """
                        aws s3 sync dist/ s3://${S3_BUCKET} --delete
                    """
                }
            }
        }
 
        stage('Invalidate CloudFront') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                                  credentialsId: 'aws-creds']]) {
 
                    sh """
                        aws cloudfront create-invalidation \
                        --distribution-id ${CLOUDFRONT_ID} \
                        --paths "/*"
                    """
                }
            }
        }
    }
}