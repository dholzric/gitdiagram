# System Patterns

## System Architecture

The system consists of a frontend and a backend. The frontend is a Next.js application that is responsible for rendering the user interface. The backend is a Python application that is responsible for generating the Mermaid diagrams.

## Key Technical Decisions

*   Using Next.js for the frontend.
*   Using Python for the backend.
*   Using Mermaid for generating diagrams.
*   Using Docker for deployment.

## Design Patterns in Use

*   Model-View-Controller (MVC)
*   REST API

## Component Relationships

*   The frontend communicates with the backend via a REST API.
*   The backend uses the Mermaid library to generate diagrams.
*   The frontend displays the diagrams to the user.
