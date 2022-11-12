
all: build

ubuntu-22.04:
	# docker rmi -f automatest/ubuntu-all:22.04
	docker build -t automatest/ubuntu-all:22.04 22.04
	docker run --rm -it automatest/ubuntu-all:22.04 bash


ubuntu-22.04-push:
	docker push automatest/ubuntu-all:22.04

ubuntu-build:
	docker build -t automatest/ubuntu-base ubuntu-base
	docker build -t automatest/ubuntu-all ubuntu-all

.PHONY: ubuntu-all
ubuntu-all:
	docker build -t automatest/ubuntu-all ubuntu-all
	docker push automatest/ubuntu-all

build:
	docker build -t automatest/base base
	docker build -t automatest/cc cc
	docker build -t automatest/java java
	docker build -t automatest/python2 python2
	docker build -t automatest/python3 python3
	docker build -t automatest/all all


clear:
	docker rmi -f automatest/base
	docker rmi -f automatest/cc
	docker rmi -f automatest/java
	docker rmi -f automatest/python2
	docker rmi -f automatest/python3
	docker rmi -f automatest/all

push:
	docker push automatest/base
	docker push automatest/cc
	docker push automatest/java
	docker push automatest/python2
	docker push automatest/python3
	docker push automatest/all

main:
	docker rmi -f automatest/base
	docker rmi -f automatest/all

	docker build -t automatest/base base
	docker build -t automatest/all all

	docker push automatest/base
	docker push automatest/all
