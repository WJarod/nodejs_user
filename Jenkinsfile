pipeline {
  agent any
    
  tools {nodejs "18.7.0"}
    
  stages {
        
    stage('Cloning Git') {
      steps {
        git branch: 'main', credentialsId: '7670bb32-7252-4593-a2f3-79d3f0bcfbac', url: 'https://github.com/WJarod/nodejs_user.git'
      }
    }
        
    stage('Install dependencies') {
      steps {
        sh 'npm install'
      }
    }
     
    stage('Test') {
      steps {
         sh 'npm test'
      }
    }      
  }
}
