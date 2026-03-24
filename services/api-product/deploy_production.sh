docker build  -t registry.digitalocean.com/shopdit/shopdit-api .
docker push registry.digitalocean.com/shopdit/shopdit-api
helm upgrade --install -f ./helm/values-production.yaml shopdit-api-production ./helm
docker rmi $(docker images | grep 'registry.digitalocean.com/shopdit/shopdit-api') -f