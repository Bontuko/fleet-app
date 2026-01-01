# How to Deploy Fleet App on Render

This guide explains how to deploy the full stack (Frontend + Backend + Database) to Render using the `render.yaml` Blueprint.

## Prerequisites
- A GitHub or GitLab account.
- A [Render](https://render.com) account.

## Steps

1.  **Push Code to GitHub/GitLab**
    - Ensure this project root is pushed to a repository.

2.  **Create a New Blueprint Instance**
    - Go to the [Render Dashboard](https://dashboard.render.com/).
    - Click **New +** and select **Blueprint**.
    - Connect your repository.
    - Give it a name (e.g., `fleet-app`).

3.  **Review Resources**
    - Render will detect `render.yaml`.
    - It will list 3 resources:
        - `fleet-db` (Postgres)
        - `fleet-backend` (Web Service)
        - `fleet-dashboard` (Static Site)
    - Click **Apply**.

4.  **Wait for Build**
    - Render will provision the database, build the backend, and build the frontend.
    - Once "Live", your app is running!

## Troubleshooting

- **Database Connection**: The `render.yaml` automatically links `DATABASE_URL`. If you see connection errors, check the logs in the `fleet-backend` service.
- **CORS Issues**: If the frontend cannot talk to the backend, ensure `ALLOWED_ORIGINS` was correctly populated. The blueprint handles this automatically by setting the backend's env var to the frontend's URL.
