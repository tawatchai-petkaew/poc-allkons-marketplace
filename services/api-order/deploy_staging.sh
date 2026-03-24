docker build  -t registry.digitalocean.com/shopdit/marketplace-api-order .
docker push registry.digitalocean.com/shopdit/marketplace-api-order
helm upgrade --install -f ./helm/values-staging.yaml marketplace-api-order-staging ./helm
docker rmi $(docker images | grep 'registry.digitalocean.com/shopdit/marketplace-api-order') -f