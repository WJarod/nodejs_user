pipeline {
  agent any
    
  tools {nodejs "18.7.0"}
    
  stages {
        
    stage('Cloning Git') {
      steps {
        git branch: 'dev', credentialsId: '7670bb32-7252-4593-a2f3-79d3f0bcfbac', url: 'https://github.com/WJarod/nodejs_user.git'
        sh 'npm install'
      }
    }
     
    stage('Test') {
      steps {
         sh 'npm test'
      }
    }    

    stage('Prod') { 
      steps {
        git branch: 'main', credentialsId: 'ebcfa03a-7cc1-41a7-90b4-e81fcfc6f0ff', url: 'https://github.com/WJarod/nodejs_user.git'
        sh 'git merge dev'
        sh 'git push origin main'
      }
    }  
  }
}
