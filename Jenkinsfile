pipeline {
  agent any
    
  tools {nodejs "18.7.0"}
    
  stages {
        
    stage('Cloning Git') {
      steps {
        git branch: 'dev', url: 'https://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@github.com/WJarod/nodejs_user.git'
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
        sh 'git checkout main'
        sh 'git merge dev'
        sh 'git push origin main'
      }
    }  
  }
}
