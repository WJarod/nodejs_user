pipeline {
  agent any
    
  tools {nodejs "18.7.0"}
    
  stages {
        
    stage('Cloning git && npm install') {
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
        echo 'PROD OK'
      }
    }  
  }
  post {
    always {
      echo "Release finished do cleanup and send mails"
      deleteDir()
    }
    success {
      echo "Release Success"
    }
    failure {
      echo "Release Failed"
    }
    cleanup {
      echo "Clean up in post work space"
      cleanWs()
    }
  }
}
