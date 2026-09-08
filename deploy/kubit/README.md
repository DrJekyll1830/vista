# Kubit deployment

The application is deployed by the Kubit `tag-build-deploy` component in the
root `.gitlab-ci.yml`. It builds `app/Dockerfile` when `master` changes and
deploys the `app-prod` environment/image `vista-app-prod`.

Vista currently runs in the existing `konkooria` namespace because this Kubit
account cannot create namespaces. All Vista resources are prefixed with
`vista-`.

PostgreSQL is intentionally a single StatefulSet (`vista-postgresql`) with one
5Gi PVC. It is not the Konkooria HA PostgreSQL pack. Create the
`vista-postgresql` Secret before applying `vista-postgresql.yaml`; the app Pack
uses the same connection URL. Keep the real Pack with its generated secrets
outside Git, as Konkooria does with its local `packs/` directory.

The tracked Pack example is a template only. The live Pack is named
`vista-app`; its `DOCKER_TAG` is updated by the Kubit deployment flow.
