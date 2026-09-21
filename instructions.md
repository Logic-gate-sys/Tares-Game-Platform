# STEPS TO TAKE WITH THE DOCKERFILE

Build and executed the docker container as a 'remote server (ubuntu-linux)
 ```bash
 # buid image 
 docker build -t ubuntu-ssh .       
 docker images   docker run -dit --name production-server -p 22:22 -p 80:80 -p 443:443 ubuntu-ssh    // run container
 docker exec production-server /bin/bash -c "service ssh start"     # exec a command in the running container simulating a remote linux 
 ssh ubuntu@127.0.0.1       # ssh into the container as if it were a remote server 
 ssh-keygen -t ed25519 -C "danielkpatamia@gmail.com"  # generate an ssh key-pair for secure connection b/n the 'sever' and github
 cat ~/.ssh/id_ed25519.pub  # display and content the content of the ssh keypair that you will add to github using the ssh and gcp section
# Now you can clone the repo into the 'server'
# setup  pm2 using pm2.config.ts (npm i pm2 -g) to manage processes on the prodction server  
 sudo apt install nginx    # install nginx 
 sudo service start nginx  # start nginx server for reverse proxy
 sudo vim /etc/nginx/sites-available/default  # open the the default config directory of nginx and reconfigure it to proxy
```

 ## Enabling https on Nginx
 ```bash
  sudo mkdir /etc/nginx/ssl # make and ssl directory in the nginx folder
  # generate a self sign certificate. Note in production a secure entity will have to sign the certificate
  sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/server.key -out /etc/nginx/ssl/server.crt
  ```
  - Update the nginx configuration to allow ssh pointing to private and public keys on the server

  ```nginx
      server {
        listen 443 ssl;
        server_name _;
  
        ssl_certificate /etc/nginx/ssl/server.crt;
        ssl_certificate_key /etc/nginx/ssl/server.key;
  
        location / {
          proxy_pass http://127.0.0.1:8000;
        }
  }
  ```

 ### NOTE:
 - If an actual certificate is obtained from a certificate provider , these are the process to upload it the 
   appropriate location on the server 

 ```bash
    scp server.* ubuntu@127.0.0.1:/home/ubuntu/.
    ssh ubuntu@127.0.0.1
    sudo mv server.* /etc/nginx/ssl/
 ```
