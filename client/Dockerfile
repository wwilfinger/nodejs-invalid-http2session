FROM node:18.16.1-bookworm-slim as build

RUN apt-get update && \
  apt-get upgrade -y && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /opt/code



FROM build AS app

RUN apt-get update && \
  apt-get upgrade -y && \
  apt-get install -y dumb-init && \
  # debugging utils
  apt-get install -y strace dnsutils ncat tcpdump iproute2 procps && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

COPY . .

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "./index.js"]
