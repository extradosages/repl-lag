FROM node:16

ARG USERNAME=node
ARG USER_GID=1000
ARG USER_UID=1000
# Set-up non-root user
RUN userdel -r node \
  && groupadd --gid $USER_GID $USERNAME \
  && useradd -s /bin/bash --uid $USER_UID --gid $USERNAME -m $USERNAME

# Additional OS packages
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
  && apt-get -y install --no-install-recommends \
    curl \
    git \
    ssh-client

# Install graphite
RUN npm install --global @withgraphite/graphite-cli

CMD [ "tail", "-f", "/dev/null" ]
