---
title: RetroGameAPI
summary: A Go REST API for managing retro game collections and peer-to-peer trades, deployed on Kubernetes with autoscaling and monitoring.
problem: Turning a monolithic API into a distributed system by learning message queues, service monitoring, pod replication, and front-end communication.
stack: [Go, Gin, MySQL, Kafka, Docker, Kubernetes, Prometheus]
role: Solo project. Built the API, the email consumer service, the deployment manifests, and a React front end.
repo: https://github.com/xd-dbug/RetroGameAPI
cover: ./images/retrogame-demo.png
coverAlt: The RetroGameAPI React front end, a dark retro-styled console catalog with a search box and cards for consoles like the NES, Sega Genesis and PlayStation, each tagged with maker, year and region.
featured: true
order: 3
date: 2026-03-01
draft: false
---

## Problem & motivation

I was tasked with creating a monolithic API for retro game collections, and later turning that monolithic design into a distributed system. Every new technology was a new step in the process of distributing an application, from the email consumer to the service dashboard.

## Demo

The screenshot above is the React front end's console catalog, served by the API. The Games, Trades and Users tabs talk to the same API.

## How it works

- **API:** a REST API in Go with the Gin framework, backed by MySQL. Users register and log in for a JWT, then manage their game collections and browse consoles and companies.
- **Trades:** one user offers a trade, and the other accepts or rejects it with `PATCH /trade-offers/:id/status`. Accepting transfers ownership of the games automatically.
- **Notifications:** the API publishes trade events to Kafka, and a separate email-consumer service sends the emails, so trade requests never wait on email delivery.
- **Deployment:** Docker Compose for local development, and Kubernetes manifests for a cluster. The API runs behind an Nginx load balancer with a Horizontal Pod Autoscaler scaling it between 2 and 6 replicas.
- **Monitoring:** the API exports Prometheus counters for trade offers, new users and new games at `/metrics`, with Grafana dashboards on top.

## Run it locally

You need Docker with Docker Compose.

```sh
git clone https://github.com/xd-dbug/RetroGameAPI
cd RetroGameAPI/RetroGameAPI
docker compose up -d --build
```

The API is at http://localhost (through Nginx), Prometheus at http://localhost:9090 and Grafana at http://localhost:3000. Stop everything with `docker compose down`.

## What I learned / next steps

I learned the pros and cons of distributed systems versus monolithic ones, how to connect real API endpoints from the back end to the front end, and how pieces such as health dashboards, email sending, and databases can be pulled out and given their own architecture.
