# Documentation d'une création d'un environnement de micro-service. 

## Utilisation de C# pour ce service en question.

## Création d'une web API :

### Commande pour créé une nouvelle API :

```
dotnet new webapi -n <ApiName>

```

### Installation des dépendances :

```
dotnet add package <packagesName> --version=<dotnetversion>

```
Exemples :
```
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection 
dotnet add package Microsoft.EntityFrameworkCore --version=5
dotnet add package Microsoft.EntityFrameworkCore.Design --version=5
dotnet add package Microsoft.EntityFrameworkCore.InMemory --version=5
```

## Mise en place de la structure :

### Structure :

![Notre Structure](https://i.ibb.co/7r9TWrJ/Screenshot-1.png)

Pour le mapper, rajoutez cette ligne dans le fichier startup.cs dans la fonction ConfigureService() : 
```
services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
```

### Test Code : 

#### Nous utilisons un client Http afin de faire les tests ( Postman, Thunder Client, ... ) : 
```
http://localhost:5000/<serviceName>
```

***


## Docker :

### Nous allons créé un container pour notre service mais pour pouvoir créé ce container nous devons créé le fichier Dockerfile a la racine du service pour créé une image de ce container. Ex : 

1 - Lancer Docker

```
//on recupere l'image dotnet
FROM mcr.microsoft.com/dotnet/sdk:<dotnetversion> AS build-env  
//que nous placerons dans notre app
WORKDIR /app     

//Copie tous les fichiers avec l'extensions .csproj
COPY *.csproj ./ 
//Reinstallation des dépendances       
RUN dotnet restore         

//On copie tout le dossier
COPY . ./      
//Permet de publier l'application sur docker
RUN dotnet publish -c Realease -o out       

//On recupere l'image ASPNet
FROM mcr.microsoft.com/dotnet/aspnet:<dotnetversion> 
//que nous plaçons dans l'app 
WORKDIR /app      
COPY --from=build-env /app/out/ .
//Nous définissons le point d'entrée de l'application
ENTRYPOINT [ "dotnet", "<serviceName>.dll" ]   
```

### Nous allons maintenant pouvoir constuire l'image Docker a partir du fichier existant avec la commande suivante :

```
docker build -t <dockerId/serviceName> . //Permet de créer une image // ne pas mettre de majuscule pour le servicename // ne pas oublier le point à la fin
```

### Test sur Docker en local :

```
docker run -p 8080:80 -d <dockerId/serviceName>  //Permet de lancer l'image docker avec un port attribué
```
#### Nous utilisons un client Http afin de faire les tests ( Postman, Thunder Client, ... ) : 
```
http://localhost:8080/<serviceName>
```



### Une fois les tests passer et fonctionnels nous allons pouvoir le push sur Docker Hub :

```
docker push <dockerId/serviceName>  //Permet d'heberger l'image sur Docker Hub
```

***

## Kubernetes 

### Nous devons créé un fichier <serviceName>-deployment.yaml dans un dossier ( K8S ) a la racine du projet concernant notre service Ex :

```
apiVersion: apps/v1
kind: Deployment //Nous faisons un déploiement 
metadata:
  name: <serviceName>-deployments //Nous donnons le nom du déploiement 
spec:
  replicas: 1   //Permet de choisir le nombre d'environement qu'on lance et de relancer en cas de crash
  selector:
    matchLabels: 
      app: <serviceName>service //defini le nom de mon service
  template: 
    metadata:
      labels:
        app: <serviceName>service 
    spec: 
      containers:
        - name: <serviceName>service
          image: <dockerId>/<serviceName>service:latest  //image de notre service qui se trouve sur docker Hub
```

### Dans ce meme fichier nous allons rajouter a la suite la création du clusterIp qui va nous permettre de definir l'adresse de communication avec le service et entre service : 

```
--- // Ces 3 tirets servent à séparer deux créations
apiVersion: v1
kind: Service
metadata:
  name: <serviceName>-clusterip-server
spec: 
  type: ClusterIP
  selector:
    app: <serviceName>service
  ports:
    - name: <serviceName>service
      protocol: TCP
      port: 80
      targetPort: 80
```

### Pour communiquer avec le service en mode Developpement nous allons utiliser un autre port en créant un fichier <serviceName>-nodeport-server.yaml toujours dans le dossier "K8S : 

```
apiVersion: v1
kind: Service
metadata:
  name: <serviceName>service-server
spec:
  type: NodePort
  selector:
    app: <serviceName>service
  ports:
    - name: <serviceName>service
      protocol: TCP
      port: 80
      targetPort: 80
```

### Pour créé notre environnement il nous faut lancer ces commandes : 

```
kubectl apply -f <serviceName>-deployment.yaml

kubectl apply -f <serviceName>-nodeport-server.yaml
```

### Afin de tester notre environnement il nous faut récuperer le port du NodePort : 
```
kubectl get services
```
### Ex : 

![Notre Port](https://i.ibb.co/rk3Ln16/Screenshot-1.png)

#### Nous utilisons un client Http afin de faire les tests ( Postman, Thunder Client, ... ) : 
```
http://localhost:<nodeport>/<serviceName>
```

#### Si nous créons plusieurs service nous devons redémarrer les containers avec cette commande : 
```
kubectl rollout restart deployment <serviceName>-deployment
```

***

## API Gateway

### Pour commencer nous devons installer "ingress-nginx" : 

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.0/deploy/static/provider/cloud/deploy.yaml
```
* Aidez-vous avec la documentation [Kubernetes](https://kubernetes.github.io/ingress-nginx/deploy/#docker-desktop)

### Nous devons créé un fichier ingress-server.yaml dans le dossier "K8S" qui sera notre Api Gateway :
```
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-server
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-reges: 'true'
spec:
  rules:
    - host: <hostName>.com    //On defini le nom de domaine sur la quel nous allons requeter
      http:
        paths:
          - path: /<serviceName1>     //On defini le chemin d'acces au service pour les requettes
            pathType: Prefix
            backend:
              service:
                name: <serviceName1>-clusterip-server    //On recupere l'adresse pour communiquer avec le service
                port:
                  number: 80
          - path: /<serviceName1>/<serviceName2>      //On defini le chemin d'acces au service pour les requettes
            pathType: Prefix
            backend:
              service:
                name: <serviceName2>-clusterip-server       //On recupere l'adresse pour communiquer avec le service
                port:
                  number: 80
```

### Nous devons lancer le fichier ci-dessus avec la commande suivante : 

```
kubectl apply -f .\ingress-server.yaml
```



### Pour que tout cela fonctionne nous devons modifier le fichier host en local de notre machine qui se trouve "C:\Windows\System32\drivers\etc", selectionner le premier fichier "host" avec les droits Admin et rajouter une ligne : 

```
127.0.0.1 <hostName>
```
***
# Comment faire une requête Http (les requêtes Http sont synchrones)
Nous avons un SubjectService et un ArticleService.
Quand un nouveau sujet est posté dans SubjectService, il doit être envoyé vers l'api ArticleService.
Pour ca, on peut se servir de la requête Http pour envoyer le contenu de l'objet sérialiser de manière synchrone étant donné la faible quantité de données envoyées. 

## Déroulement
Dans notre SubjectController nous avons une méthode POST : CreateSubject() qui permet qui créer un nouveau Subject :
```
[HttpPost]
        public ActionResult<SubjectReadDto> CreateSubject(SubjectCreateDto subjectCreateDto)
        {
            var SubjectModel = _mapper.Map<Subject>(subjectCreateDto);

            _repository.CreateSubject(SubjectModel);

            _repository.SaveChanges();

            var NewSubject = _mapper.Map<SubjectReadDto>(SubjectModel);


            // Send Sync Data
            try 
            {
                 _articleDataClient.SendSubjectToArticle(NewSubject);
            }
            catch (System.Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
            }
```
Cela souscrit à la méthode SendSubjectToArticle() de l'interface IArticleDataClient qui se trouve dans le dossier Http dans le dossier SyncDataServices.

Par exemple, dans l'interface IArticleDataClient, on signe la méthode :

(Signer signifie déclarer des méthodes dans l'interface)
```
using System.Threading.Tasks;

public interface IArticleDataClient
    {
        Task SendSubjectToArticle(SubjectReadDto subject);
    }
```
Puis, dans le fichier HttpArticleDataClient.cs qui correspond à notre repo, on commence par récupérer les dépendances :
```
using System.Threading.Tasks;

private readonly HttpClient _httpClient;
private readonly IConfiguration _configuration;

public HttpArticleDataClient(HttpClient httpClient, IConfiguration configuration)
{
  _httpClient = httpClient;
  _configuration = configuration;
}
```
Puis on déclare notre méthode :
```
public async Task SendSubjectToArticle(SubjectReadDto subject)
{

  /* La variable httpContent recupère le sujet de type objet 
  et cet objet va être transformé en texte */

  var httpContent = new StringContent(
    JsonSerializer.Serialize(subject),
    Encoding.UTF8,
    "application/json");

  /* La variable response envoie la requête POST vers l'api ArticleService
  avec comme valeur le contenu de httpContent */

  var response = await _httpClient.PostAsync($"{_configuration["ArticleService"]}", httpContent);

  if(response.IsSuccessStatusCode)
  {

    // Si la réponse http est un succés on envoie un message 

    Console.WriteLine("Request POST send to Article Service");
  }
  else
  {

    // Si la réponse http est un échec on envoie un message

    Console.WriteLine("ERROR: Request POST not send to Article Service");
  }
}
```
Maintenant on peut tester en lancant une requête :
![Notre Port](https://i.ibb.co/N1NwT3P/Capture-d-cran-69.png)

Et nous voyons dans le terminal que la requête émise sur SubjectService a bien été envoyé vers ArticleService :
![Notre Port](https://i.ibb.co/PmcyqT5/Capture-d-cran-71.png)

Nous pouvons désormais récupérer nos données Coté ArticleServices :
![Notre Port](https://i.ibb.co/Y2Gvrrf/Capture-d-cran-73.png)


FIN DE LA REQUETE HTTP

## GRPC

### GRPC (Remote Procedure Call) est un Framework qui permet de passer des données par protocole orienté client - server et de manière synchrone, c'est à dire dans notre exemple, lorsque nous créons un sujet dans ArticleService, un contrat est mis en place de manière à ce que ce sujet soit aussi crée dans SubjectService. Pour cela nous passons par des Interface de protocole, avec des protobuffer, de manière à faire passé le sujet nouvellement crée de ArticleService vers SubjectService.


## Pour install Grpc :

### Commande pour le Server (ici SubjectService) 
```
dotnet add package Grpc.AspNetCore --version=2.38.0
```
### Commande pour le Client (ici ArticleService) 
```
dotnet add package Grpc.Tools --version=2.39.1

dotnet add package Grpc.Net.Client --version=2.38.0

dotnet add package Google.Protobuf --version=3.17.3
```
## Mise en place et configuration :

### Le ficher deployment

On commence par configurer le fichier subjects-deployments.yaml (qui correspond donc à notre server), et nous rajoutons une configuration d'un port d'entrée et d'un port de destination pour GRPC, ces deux port doivent être différents du protocole TCP : 80.

```
apiVersion: v1
kind: Service
metadata:
  name: subject-clusterip-server
spec:
  type: ClusterIP
  selector:
    app: subjectservice
  ports:
    - name: subjectservice
      protocol: TCP
      port: 80
      targetPort: 80
    - name: subjectgrpc #Configuration du cluster avec l'ajout d'un port et d'un port de destination pour GRPC
      port: 666
      targetPort: 666
```

Dans l'exemple ci-dessus nous pouvons constater  subjectgrpc avec les ports 666.

Ceci fait nous redéployons ce fichier avec la commande :

```
 kubectl apply -f .\ .\subjects-deployments.yaml
```

Et pour vérifier que le port 666 a bien été rajouté nous faisons :

```
kubectl get services
```

Ainsi dans le terminal nous pouvons constater que le clusterIp subject possede bien 2 ports TCP : 
![Notre Port](https://i.ibb.co/6XcvdLc/terminal-cluster.png)

La question est pourquoi 2 ports ? Le port 80 est le port par default sur lequel tous le web communique, et le port 666 nous sert à communiquer de la donnée.

### Le service production

Nous allons devoir spécifier dans SubjectServices le protocol que nous utiliserons et son port, pour cela dans le fichier appsettings.Production.json, nous devons rajouter le protocole HTTP2, qui correspond au protocole de GRPC et l'url avec le port de communication. Nous devrons aprés specifié le protocole et le port sur lequel fonctionne l'api, et donc transite les requêtes :

```
{
{
  "ArticleService": "http://article-clusterip-server:80/article/subject",
  "RabbitMQHost": "rabbitmq-clusterip-srv",
  "RabbitMQPort": 5672,
  "Kestrel":
  {
    "Endpoints":  //signifie que nous utilisons des URL
    {
      "Grpc": 
      {  // Ici notre GRPC
        "Protocols": "Http2",
        "Url": "http://subject-clusterip-server:666"
      },
      "webApi":
      {  // Ici notre API
        "Protocols": "Http1",
        "Url": "http://subject-clusterip-server:80"
      }
    }
  }
}
```

### Le fichier proto

Avant d'entrer dans le vif du sujet et de développer sur ce qu'est un fichier proto, il est vivement conseillé d'installer l'extension vscode-proto3. En effet l'indentation d'un fichier proto étant particulière, cela permet ainsi de faciliter le confort d'ecriture.

Nous créons un dossier Protos dans le service subject, puis dans ce dossier nouvellement crée nous ajoutons un fichier nommé subjects.proto .

Le fichier protobuf est un contrat, soit l'equivalent d'une interface mais pour GRPC, et c'est est un format indépendant de la langue permettant de spécifier les messages envoyés et reçus par les services GRPC. Dans ce fichier nous allons donc définir :

- une syntax à utiliser, soit la vérsion du protobufer souhaitée
- une option, qui correspond au namespace du service dans lequel nous nous trouvons
- un message, qui correspond à l'objet principal de transfert de données dans Protobuf, en l'occurence dans l'exemple çe sera l'objet Subject

```
//Syntaxe à utiliser
syntax = "proto3";

//Le nom du service dans le quel nous travaillons
option csharp_namespace = "SubjectService";

//Pour retourner toutes les requêtes
message GetAllRequest {}

//permet de retourner par rapport à toutes les requêtes, l'objet subject par son id
service GrpcSubject {
    rpc GetAllSubject (GetAllRequest) returns (SubjectResponse);
}

//Defini des nombres qui representent chaques attribu de l'objet
message GrpcSubjectModel {
    int32 subjectId = 1; //donne un emplacement à l'id de l'objet
    string name = 2;
    string description = 3;
}

// Pour renvoyer une reponse avec comme contenu l'objet, subjet = 1 car se base sur l'id pour nous retourner l'objet
message SubjectResponse {
    repeated GrpcSubjectModel subject = 1;
}
```

Ensuite, pour que ce fichier puise être chargé et fasse parti intégrente du projet, nous rajoutons une ligne dans le fichier SubjectService.csproj, en spécifiant comme balise que c'est un protobuf, en incluant l'emplacment du fichier et enfin en décrivant sur quel type de service il doit taper, en l'occurence ici un server ( rappelons que SubjectService est le serveur).

```
.........................................................................
    <PackageReference Include="Swashbuckle.AspNetCore" Version="5.6.3" />
  </ItemGroup>
  
  <ItemGroup>
    <Protobuf Include="Protos\subjects.proto" GrpcServices="Server"/>
  </ItemGroup>

</Project>
```

Il est grand temps de vérifier si le protobuf est bien chargé au lancement du service, pour ça toujours situé dans subjectService :

```
dotnet build
```

```
dotnet run
```

Si il n'y a pas d'erreur alors nous constaterons dans le dossier SubjectService\obj\Debug\net5.0 qu'un nouveau dossier intitulé Protos a été géneré, contenu deux fichier Subjects.cs et SubjectGrpc.cs

![Notre Port](https://i.ibb.co/9thF26s/proto.png)

Ces deux fichiers autogénerés contiennent tous le code nécessaire à GRPC, et demande aucune modifications.
Tous ceci a été géneré par le simple fichier proto, on peut donc affirmer qu'en plus de servir d'interface, il fait aussi office de fichier de configuration.

### Protocole de transfert
GRPC se base sur le même protocole que HTTP. De ce fait pour écrire les requêtes, nous allons devoir créer dans le dossier SyncDataServices (la ou se trouve le repo et l'interface http) un fichier nommé GrpcSubjectService.cs , il va permettre de récuperer tous les subjects et de rajouter les subjects qui néxistent pas dans la bdd de SubjectService.

Mais avant ça nous devons spécifier dans subjectprofiles un nouveau mapping, effectivement il va falloir faire matcher les données de Subject vers GrpcSubjectModel.


Rappelons que GrpcSubjectModel est l'object defini dans le protobuf.
```
CreateMap<Subject, GrpcSubjectModel>()
                // GrpcSubjectModel.SubjectId récupere l'id de Subject.Id
                .ForMember(dest => dest.SubjectId, opt => opt.MapFrom(src => src.Id))
                // GrpcSubjectModel.Name récupere l'id de Subject.Name
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                // GrpcSubjectModel.Description récupere l'id de Subject.Description
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description));
```

Revenons maintenant au fichier nommé GrpcSubjectService.cs, l'objectif de ce fichier est de récuperer un tableau de mes données, donc de mes sujets en se basant sur tous les informations qui ont été données sur le proto : 

```
using System.Threading.Tasks;
using AutoMapper;
using SubjectService.Data;
using Grpc.Core;

namespace SubjectService.SyncDataServices.Grpc
{
    /* la class hérite du protobuf subjects.proto et des méthodes autogenerés 
       situées dans obj\Debug\.net5.0\Protos */
    public class GrpcSubjectService : GrpcSubject.GrpcSubjectBase
    {

        /* Injection des dépendances, ici nous chargeons 
        l'interface de Subject et l'autoMapper*/
        private readonly ISubjectRepo _repository;
        private readonly IMapper _mapper;
        public GrpcSubjectService(ISubjectRepo repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        /* Méthode surchargée de type SubjectResponse, on appelle en paramètre la méthode GetAllRequest
        du fichier protobuf et un context de type server*/
        public override Task<SubjectResponse> GetAllSubject(GetAllRequest request, ServerCallContext context)
        {
            // resonse de type SubjectResponse
            var response = new SubjectResponse();
            // récupere tous les sujets
            var subjects = _repository.GetAllSubjects();

            /*Dans chaque entrée de mon tableau, donc des sujets récuperés,
             je crée un subjectResponse, mappé sur GrpcSubjectModel*/
            foreach(var subj in subjects)
            {
                response.Subject.Add(_mapper.Map<GrpcSubjectModel>(subj));
            }

            //retourne le résultat de response
            return Task.FromResult(response);
        }
    }
```

### Fichier startup

Dernière étape pour conclure la configuration de GRPC, dans le fichier statup.cs nous devons ajouter le service GRPC à la collection :

```
using SubjectService.SyncDataServices.Grpc;

 public void ConfigureServices(IServiceCollection services)
        {
 
                 services.AddDbContext<AppDbContext>(opt => opt.UseInMemoryDatabase("Subject"));
           
           

            services.AddScoped<ISubjectRepo, SubjectRepo>();
            services.AddHttpClient<IArticleDataClient, HttpArticleDataClient>();
            services.AddSingleton<IMessageBusClient, MessageBusClient>();
            services.AddGrpc();
            //permet de checker dans l'application courante et récupere toutes les instances de l'automapper
            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

            services.AddControllers();            
            services.AddSwaggerGen(c =>
```

Toujours dans le fichier statup.cs à la fin nous rajoutons un endpoint pour le service GRPC.
```
endpoints.MapGrpcService<GrpcSubjectService>();
                endpoints.MapGet("/protos/subjects.proto", async context => 
                {
                    await context.Response.WriteAsync(File.ReadAllText("Protos/subjects.proto"));
                });
```

Rappelons qu'un endpoint peut inclure une URL d'un serveur ou d'un service. Chaque point endpoint est l'emplacement à partir duquel les API peuvent accéder aux ressources dont elles ont besoin pour exécuter leur fonction.


Le protocole GRPC est désormais configuré.