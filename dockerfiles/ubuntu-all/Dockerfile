FROM automatest/ubuntu-base

RUN rm -rf /var/cache/apt/* \
 && rm -rf /var/lib/apt/lists/* \
 && adduser --system --group --disabled-password jan-hybs

USER jan-hybs

ENV PATH="/matlab/bin:${PATH}"

COPY execute /bin/