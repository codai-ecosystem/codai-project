FROM alpine:latest
COPY packages/api-utils/dist /tmp/api-utils-check
COPY packages/shared-ui/dist /tmp/shared-ui-check
RUN ls -la /tmp/
CMD ["echo", "test"]