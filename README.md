# HealthSync AI Frontend

This README provides instructions on how to set up and run the HealthSync AI frontend project locally.

## Getting Started

Follow these steps to get the development environment running:

1.  **Clone the repository:**
    Open your terminal or command prompt and run the following git command:
    ```bash
    git clone https://github.com/HealthSyncAI/healthsync-ai-frontend.git
    ```

2.  **Navigate to the project directory:**
    Change your current directory to the newly cloned folder:
    ```bash
    cd healthsync-ai-frontend
    ```

3.  **Install dependencies:**
    Choose *one* of the following package managers to install the necessary project dependencies. Make sure you have the chosen package manager installed on your system (Node.js is required for npm).
    ```bash
    # Using npm (comes with Node.js)
    npm install

    # Using Yarn (install separately if needed)
    # yarn install

    # Using pnpm (install separately if needed)
    # pnpm install

    # Using Bun (install separately if needed)
    # bun install
    ```
    *Note: Uncomment and use the command corresponding to your preferred package manager.*

4.  **Run the development server:**
    Start the local development server using the corresponding command for the package manager you used in the previous step:
    ```bash
    # If you used npm
    npm run dev

    # If you used Yarn
    # yarn dev

    # If you used pnpm
    # pnpm dev

    # If you used Bun
    # bun dev
    ```
    *Note: Uncomment and use the command corresponding to your preferred package manager.*

5.  **Open the application:**
    Once the server starts, open your web browser and navigate to [http://localhost:3000](http://localhost:3000) (or the specific port indicated in your terminal output) to see the application running.