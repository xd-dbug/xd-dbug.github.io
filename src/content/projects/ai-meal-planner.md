---
title: AI Meal Planner
summary: A recipe-sharing platform on AWS whose AI meal planner runs as an async Lambda/SQS pipeline, built on a team of four.
problem: Develop a cloud-based project with an AI feature that showcases different cloud architecture patterns.
stack: [AWS Lambda, SQS, RDS, SAM, Claude API, Python, React]
role: Team of 4 (cloud platforms course project). Owned the AI meal-planning feature and most of the team's infrastructure work.
repo: https://github.com/xd-dbug/PRO305
cover: ./images/mealplanner-demo.png
coverAlt: Architecture diagram. A web client calls API Gateway, which routes to auth, recipe, moderation and meal-plan Lambdas backed by S3 and RDS. Meal-plan requests go through an SQS queue with a dead-letter queue to a consumer Lambda that calls the Claude API, with CloudWatch alarms over everything.
featured: true
order: 2
date: 2026-09-01
draft: false
---

## Problem & motivation

The problem our group was given was to develop a cloud-based systems architecture that used AI in a useful way while also solving a real-world problem. We chose to build a meal planner application because we wanted one place for people to be able to view, store, and create meal plans for themselves and others.

## Demo

The diagram above is the system architecture. Most requests are handled synchronously by a Lambda behind API Gateway. Meal-plan requests go through SQS to a separate consumer that calls Claude, so a slow generation never ties up the API.

## How it works

Every backend function is an AWS Lambda behind API Gateway, with MySQL on RDS and recipe photos in S3. The meal planner is the one part that can't answer within a single request, so it runs asynchronously:

1. `POST /mealplan/generate` validates the user's preferences, stores a `pending` job in RDS, puts the job ID on an SQS queue, and returns `202 Accepted` with the job ID.
2. A consumer Lambda picks up the job, builds a prompt from the preferences, the user's dietary tags (as hard constraints) and their saved recipes (as inspiration only), and calls Claude.
3. The prompt asks for strict JSON in a fixed shape. The consumer validates the response, then marks the job `complete` with the plan, or `failed` with the error.
4. The client polls `GET /mealplan/status/{job_id}` until the job finishes.

A message that fails three times moves to a dead-letter queue. CloudWatch alarms send email through SNS on any API 5xx, p95 latency over 1 s, any dead-letter message, and plan generation over 5 s. The whole stack is defined in one AWS SAM template.

## Run it locally

You need an AWS account, the AWS and SAM CLIs, and an Anthropic API key.

```sh
git clone https://github.com/xd-dbug/PRO305
cd PRO305
cp .env.example .env              # fill in the RDS connection, S3 bucket and API key
cd infra && sam build && sam deploy --guided   # prompts for the DB password and JWT secret
cd ../frontend && npm install && npm run dev
```

## What I learned / next steps

This project taught me how to set up different AWS services (Lambda, SQS, RDS). I also learned how to work with an AI API and fine-tune prompts and responses.
