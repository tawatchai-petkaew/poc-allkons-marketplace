docker build  -t registry.digitalocean.com/shopdit/marketplace-api-order .
docker push registry.digitalocean.com/shopdit/marketplace-api-order
helm upgrade --install -f ./helm/values-production.yaml marketplace-api-order-production ./helm
docker rmi $(docker images | grep 'registry.digitalocean.com/shopdit/marketplace-api-order') -f