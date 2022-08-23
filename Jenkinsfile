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
      withCredentials([sshUserPrivateKey(credentialsId: '7670bb32-7252-4593-a2f3-79d3f0bcfbac')]) {
        sh 'git checkout main'
        sh 'git merge dev'
        sh 'git push origin main'
      }
    }  
  }
}
