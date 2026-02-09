FROM node:24-trixie

ENV PROJECT_PATH=/workspaces/lukesims.com
ENV PLAYWRIGHT_BROWSERS_PATH=/playwright-browsers

USER root
RUN apt-get update && apt-get upgrade -y

RUN mkdir -p ${PROJECT_PATH} && chown node:node ${PROJECT_PATH}
WORKDIR ${PROJECT_PATH}

# Copy the NPM configs so we can install dependencies to use the same Playwright
# executable as the project would be using. No point copying anything else since
# they'll be overwritten when the project folder is mounted in the container.
COPY package*.json ${PROJECT_PATH}/
RUN npm ci

# Install the system dependencies required by Playwright
# now since we won't be using the container as root.
RUN npx playwright install-deps

# Download the browser binaries for Playwright into a location outside of
# the project so they won't be deleted when the project folder is mounted.
# `PLAYWRIGHT_BROWSERS_PATH` is used by the Playwright CLI, see:
#     https://playwright.dev/docs/browsers#managing-browser-binaries
RUN mkdir -p ${PLAYWRIGHT_BROWSERS_PATH} && \
    npx --yes playwright install && \
    chown -R node:node ${PLAYWRIGHT_BROWSERS_PATH}

USER node
