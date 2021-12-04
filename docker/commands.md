<!-- 

  pm2 start --name "venttys" "npm -- run dev" 
  docker build -t registry.gitlab.com/vettys/backend/whatsapp-handler . 
  
  -->

# CREAR UN COMERCIO

### 1. Ir al backend:  
```
http://35.192.30.37:8000/graphql
```

### 2. Correr las mutaciones para crear el comercio y enrolar el usuario
```
mutation {
  commerce(commerceInfo:{
    name:"Hamburguesas KRUSTY"
    phone:"+573117922157"
    address:"Avenida siempreviva"
    state:"Sprintfield"
    botCode:"Default"
    assistance_name:"KRUSTY"
  })
  enrollUserAtCommerce(userInfo:{
    commerce: "+573117922157"
    name:"Crhistian David Vergara"
    email: "krisskira@gmail.com"
    phone:"+573183919187"
    is_enable:true
    address:"Calle falsa 123"
    rol: Managerial
    password:"12345Az!"
  })
}
```

### 3. Entar al servidor por ssh

```
ssh usuario@35.192.30.37
```

### 4. Levantar el listener de whatsapp
```
docker run -d \
    --network=venttys-net \
    -v "venttys-wh-tokens:/home/app/tokens" \
    -v "venttys-wh-public:/home/app/public" \
    --name "phone_573117922157" \
    -e COMMERCE="Hamburguesas KRUSTY" \
    -e NODE_ENV=development \
    -e PHONE="+573117922157" \
    -e EXTERNAL_PUBSUB_SERVER='venttys-kafka:9092' \
    registry.gitlab.com/vettys/backend/whatsapp-handler
```
### 5. Escanear el codigo QR
```
docker logs -f phone_573117922157
```

### 6. Iniciar sesion en la aplicacion de backoffice.
```
https://quickstartsample-opvsxj.web.app/#/
```