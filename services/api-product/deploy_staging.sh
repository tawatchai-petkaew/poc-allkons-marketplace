docker build  -t registry.digitalocean.com/shopdit/shopdit-api .
docker push registry.digitalocean.com/shopdit/shopdit-api
helm upgrade --install -f ./helm/values-staging.yaml shopdit-api-staging ./helm
docker rmi $(docker images | grep 'registry.digitalocean.com/shopdit/shopdit-api') -f