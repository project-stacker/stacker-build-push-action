FROM alpine:3.16

VOLUME /tmp

ARG VERSION=1.0.0
LABEL AUTHOR="unknown"

ENV ENV_VERSION1 \$VERSION
ENV ENV_VERSION2=\$VERSION
ENV ENV_VERSION3=\$\{VERSION\}
ENV TEST_PATH="/usr/share/test/bin:$PATH" \
    TEST_PATHS_CONFIG="/etc/test/test.ini" \
    TEST_PATHS_DATA="/var/lib/test" \
    TEST_PATHS_HOME="/usr/share/test" \
    TEST_PATHS_LOGS="/var/log/test" \
    TEST_PATHS_PLUGINS="/var/lib/test/plugins" \
    TEST_PATHS_PROVISIONING="/etc/test/provisioning"
ENV COMMIT_SHA=${COMMIT_SHA}

RUN echo \$VERSION
RUN echo \$\{VERSION\}

RUN apk add --no-cache lua5.3 lua-filesystem lua-lyaml lua-http

ENTRYPOINT [ "/usr/local/bin/fetch-latest-releases.lua" ]
