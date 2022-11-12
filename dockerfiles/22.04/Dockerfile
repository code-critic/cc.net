FROM ubuntu:22.04

# basic tools
RUN apt update && DEBIAN_FRONTEND=noninteractive apt install -y \
    bash man wget build-essential curl nano htop xorg libpng-dev libfreetype6-dev htop \
    gnupg ca-certificates


# python3
RUN apt install -y \
    python3 python3-pip python3-dev python3-venv python3-wheel python3-setuptools \
 && pip3 install --upgrade pip \
 && pip3 install --upgrade setuptools \
 && pip3 install --upgrade wheel \
 && pip3 install --upgrade numpy scipy pandas matplotlib seaborn scikit-learn networkx pytest pytest-json


# C/C++ (no clang)
RUN apt install -y \
    gcc g++ gfortran \
    libblas-dev liblapack-dev \
    libpng-dev libfreetype6-dev


# .NET & mono, install to shared folder
RUN wget --quiet https://download.visualstudio.microsoft.com/download/pr/253e5af8-41aa-48c6-86f1-39a51b44afdc/5bb2cb9380c5b1a7f0153e0a2775727b/dotnet-sdk-7.0.100-linux-x64.tar.gz \
 && mkdir -p /usr/share/dotnet \
 && tar zxf dotnet-sdk-7.0.100-linux-x64.tar.gz -C /usr/share/dotnet \
 && ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet \
 && rm -rf dotnet-sdk-7.0.100-linux-x64.tar.gz \
 && chmod +x /usr/share/dotnet/dotnet \
 && DEBIAN_FRONTEND=noninteractive apt install -y mono-devel
ENV DOTNET_ROOT=$HOME/dotnet


# nodejs & npm & typescript
RUN curl -sL https://deb.nodesource.com/setup_19.x | bash - \
 && apt install -y nodejs \
 && npm i -g typescript


# JAVA
RUN apt install -y openjdk-11-jdk


# rust
ENV RUSTUP_HOME=/usr/share/rust \
    CARGO_HOME=/usr/share/rust \
    PATH=/usr/share/rust/bin:$PATH
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y \
 && ln -s $HOME/.cargo/bin/rustc /usr/local/bin/rustc \
 && ln -s $HOME/.cargo/bin/cargo /usr/local/bin/cargo


# ruby
RUN apt install -y ruby-full


# install global npm packages
RUN npm i -g process fs readline util @types/node


# copy files
RUN adduser --system --group --disabled-password jan-hybs \
 && dotnet run --help
ENV PATH="/matlab/bin:${PATH}"
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1
COPY execute /bin/
COPY tests /bin/tests
COPY test-languages.sh /bin/


USER jan-hybs