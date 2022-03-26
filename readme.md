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
ssh venttys
cd ../app/bot/
nano ecosystem.config.js
```

### 4. Levantar el listener de whatsapp
- add `addCommerce("NewCommerceName","+573334445566", false),`
- Run `pm2 start ecosystem.config.js`

### 5. Escanear el codigo QR
```
http://35.192.30.37:8001/
```

### 6. Iniciar sesion en la aplicacion de backoffice.
```
https://comercio.venttys.com
```