#!/bin/bash

# Uses clasp to get a list of all deployments, then does some string
# manipulation to pull out the bit we want. This takes the original output of

# 6 Deployments.
# - AKfycbxk9mIQccVLJqaLFs79hqDre7kW_KADv1risA7Z5HCy @HEAD
# - AKfycbxixH-Zmy5gYy-7Tn7PsOGWj4Kbvyd9Gb8YGBT9XB7nFQIFlDtDPYcTZ_fcnM6x92o-ew @1 - 0.0.3
# - AKfycbxdJy9xxOlWRuitP7XdjeJW9aOFTjYYcLp-GBG7sQQjlmnGsc5kYjqzeINLh8cYh5dqkg @2 - 0.0.4
# - AKfycbyNIbNwRwLwSAPttlVuXPogT4p-1zM_aNEPdliRfZ8H4NpPtr8D6VSg4m2hghLaKuMezw @3 - 0.0.5
# - AKfycbxV1nLPXhOfgD-b-8Q2Efxq5TaSrgwhlbJDvAeIkpowbKcoFqknzOrgrU-t86B7VoQFyA @6 - 0.0.8
# - AKfycbwFrL1OLXR3wqfnxowGFF3w3D4eq-54vAwjxDWcWRjiZMxX7jhII_1Ddx6y76GDHrxIew @7 - 0.0.9

# then turns it into
# - AKfycbwFrL1OLXR3wqfnxowGFF3w3D4eq-54vAwjxDWcWRjiZMxX7jhII_1Ddx6y76GDHrxIew @7 - 0.0.9

# then turns it into
# AKfycbwFrL1OLXR3wqfnxowGFF3w3D4eq-54vAwjxDWcWRjiZMxX7jhII_1Ddx6y76GDHrxIew
LATEST_DEPLOYMENT=$(cd src; npx @google/clasp deployments  | tail -n 1 | sed -r 's|- (.*)@[0-9]+.*|\1|')

# We then embed this id into the base link for deeplinking, then print it out to the console.
echo "https://datastudio.google.com/datasources/create?connectorId=$LATEST_DEPLOYMENT"
