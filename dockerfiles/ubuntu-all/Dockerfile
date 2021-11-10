FROM automatest/ubuntu-base

RUN apt update && DEBIAN_FRONTEND=noninteractive apt install -y \
    python3 \
    python3-dev \
    python3-pip \
    openjdk-8-jdk \
    gcc g++ \
    nano \
    libpng-dev \
    libfreetype6-dev \
    libblas-dev \
    liblapack-dev \
    gfortran \
    build-essential \
    xorg \
    gnupg ca-certificates \
    mpich \
    && apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF \
    && echo "deb https://download.mono-project.com/repo/ubuntu stable-bionic main" | tee /etc/apt/sources.list.d/mono-official-stable.list \
    && apt update \
    && DEBIAN_FRONTEND=noninteractive apt install -y mono-devel

RUN apt install -y libjpeg-dev zlib1g-dev \
    && pip3 install pytest pytest-json numpy scipy matplotlib pandas seaborn
# mpi4py networkx

# nodejs
RUN DEBIAN_FRONTEND=noninteractive apt install -y curl \
 && curl -sL https://deb.nodesource.com/setup_14.x -o- | bash \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs \
 && npm i -g typescript

# dotnet
RUN wget https://packages.microsoft.com/config/ubuntu/19.10/packages-microsoft-prod.deb -O packages-microsoft-prod.deb \
 && dpkg -i packages-microsoft-prod.deb \
 && apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y apt-transport-https \
 && apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y dotnet-sdk-3.1 \
 && dotnet run --help


RUN rm -rf /var/cache/apt/* \
 && rm -rf /var/lib/apt/lists/* \
 && adduser --system --group --disabled-password jan-hybs

USER jan-hybs

RUN dotnet run --help

ENV PATH="/matlab/bin:${PATH}"

COPY execute /bin/