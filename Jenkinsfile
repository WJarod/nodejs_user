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
        sh 'git config --global user.email "wuillaume.ja@gmail.com"'
        sh 'git config --global user.name "WNova"'
        sh 'git checkout main'
        sh 'git merge dev'
        sh 'git commit -m "Merged develop branch to main PROD ok"'
        sh "git push origin main"
      }
    }  
  }
}
