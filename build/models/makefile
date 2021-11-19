all:
		wget --no-check-certificate  -O swagger.json https://localhost:5001/swagger/v1/swagger.json
		npx swagger-typescript-api -p swagger.json -o src -n cc-api.ts --type-prefix "I" --axios
		cp src/cc-api.ts ../../CodeCritic/_client/src/cc-api.ts