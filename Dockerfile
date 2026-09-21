# Use ubuntu's official image to simulate a remote desktop
FROM ubuntu 
# run unminise version to allow interractive acess
RUN yes | unminimize
# update this imaginary server and install necessary packages
RUN apt update && apt upgrade

RUN apt install sudo openssh-server git curl vim 

RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && apt install nodejs -y
# Create user 'ubuntu' with root acess and add it to sudo groups 'ubuntu' assuming this is a linux machine 
RUN useradd -rm -d /home/ubuntu -s /bin/bash -g root -G sudo -u 1000 ubuntu
# change password to 'ubuntu'
RUN echo 'ubuntu:ubuntu' | chpasswd

# for ssh
EXPOSE 22 
# for http
EXPOSE 80
# for https
EXPOSE 443

# startup command 
CMD ["/bin/bash"]

