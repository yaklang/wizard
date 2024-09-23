#!/bin/sh
echo "START TO BUILD yarn build-redteam"

# remove old build and use new
# 
yarn build-redteam

NOWTAG=v1ll4n/legion-frontend:`date +%F`
LATESTTAG=v1ll4n/legion-frontend:latest
echo "NOW WE ARE BUILDING:" $NOWTAG

docker build . -t $NOWTAG
docker tag ${NOWTAG} ${LATESTTAG}
docker push $NOWTAG
docker push $LATESTTAG
