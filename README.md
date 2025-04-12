# HealthCare-dApp

A decentralized application for managing healthcare records, doctor appointments, and issuing token-based rewards. It uses smart contracts on Ethereum and a JavaScript-based backend with MongoDB for storing off-chain data.

---

## Features

- **Appointment Management**: Patients can book appointments with doctors.
- **Role-Based Access**: Roles for patients, doctors, and admins can be registered.
- **Data on Blockchain**: All data is securely stored on the Ethereum blockchain using smart contracts.
- **Off-Chain Data Storage**: Uses MongoDB to store non-sensitive data and support efficient querying.
- **View All Users**: Admins can view all registered patients and doctors through the interface.
- **Tech Stack**: Built with React.js for frontend and Solidity for smart contracts.
- **Blockchain Interaction**: Uses MetaMask for user authentication and blockchain transactions.
- **Deployment Tools**: Smart contracts deployed with Truffle; Ganache used for local Ethereum blockchain.

---

## Environment Setup
Following commands are tested on window.

### Prerequisites
1. **Install Node Version Manager (nvm):**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
   ```

2. **Install Node.js (v18.15.0):**
   ```bash
   nvm install v18.20.7
   nvm alias default v18.20.7
   ```

3. **Install Truffle:**
   ```bash
   npm install -g truffle
   ```

4. **Install MongoDB**
   - Download and install MongoDB Community Edition from the official site: 
     https://www.mongodb.com/try/download/community
   - Example connection string used in this project:
     mongodb://localhost:27017/healthcare-dapp

4. **Install Ganache:**
   - Download from [Ganache](https://trufflesuite.com/ganache/)
   - Install additional tools:
     ```bash
     sudo add-apt-repository universe && sudo apt install libfuse2
     ```
   - Make the downloaded file executable and run it.

5. **Install MetaMask:**
   - Go to [MetaMask](https://metamask.io/) and install the extension for your preferred browser.
   - Follow the on-screen instructions to set up MetaMask.

### Connecting MetaMask to Ganache
1. **Add Network Manually in MetaMask:**
   - Network Name: localhost:7545
   - New RPC URL: http://127.0.0.1:7545
   - Chain ID: 1337
   - Currency Symbol: ETH

2. **Import Ganache Account to MetaMask:**
   - Copy the private key from Ganache.
   - Import the account in MetaMask using the private key.
---

## Installation
1. Clone the repository.
2. Start Ganache and create a new workspace.
3. Start MongoDb connection.
4. In a **new terminal**, navigate to the backend folder and start the server:
    ```bash
    cd backend
    node server.js
    ```
5. **new terminal**, Compile and deploy the smart contracts using Truffle:
    ```bash
    truffle compile
    truffle migrate
    ```
6. Install the required packages:
    ```bash
    npm install
    ```
7. Start the React app:
    ```bash
    npm run dev
    ```
8. Open the app in your browser at `http://localhost:3000/`.
---

## Screenshots

### Registration Page (Admin & Doctor & patients)
The homepage of the Healthcare DApp showcases a blockchain-powered Patient Management System designed for secure and decentralized healthcare records management. At the top, a navigation bar provides quick access to key sections such as Home, Registration, Appointments, and Reports. A prominent success message confirms that the user's wallet has been connected successfully, indicating that MetaMask or another Ethereum-compatible wallet is actively linked to the application. Just below, the token balance is displayed, showing that the connected user holds 100 HCT (Healthcare Tokens), which are likely used for transactions within the platform. The registration section allows users to register based on their role—Admin, Doctor, or Patient—by selecting a user type and filling in the relevant details. The interface is clean, responsive, and user-friendly, making it easy to navigate and interact with the blockchain backend.

![Image Alt](https://github.com/anju555555/HealthCare-dApp/blob/00aad818f096178b4a1c5bd79ebbf55b5c73239a/Screenshots/p1%20home.png)



![Image Alt](https://github.com/anju555555/HealthCare-dApp/blob/00aad818f096178b4a1c5bd79ebbf55b5c73239a/Screenshots/p3%20Doc%20regi.png)



![Image Alt](https://github.com/anju555555/HealthCare-dApp/blob/00aad818f096178b4a1c5bd79ebbf55b5c73239a/Screenshots/p4%20patient%20regi.png)



### Update Patient Data (Admin only)
This screenshot shows the "Update Patient Data" section for admins in the Healthcare DApp. The admin selects a patient, updates their vaccine and admission status, and submits the changes. MetaMask then prompts for transaction confirmation, ensuring the update is securely recorded on the blockchain.




![Image Alt](https://github.com/anju555555/HealthCare-dApp/blob/00aad818f096178b4a1c5bd79ebbf55b5c73239a/Screenshots/p6%20patient%20form%20(admin)%20.png)

### View appoinment Schedule (For Current Doctor)
This screenshot displays the "View Appointment Schedules" section of the Healthcare DApp. It shows the connected user's wallet address, token balance, and available appointment slots. For Dr. Jiya Patel, multiple time slots are already marked as "Booked," helping users view current availability in real-time.





![Image Alt](https://github.com/anju555555/HealthCare-dApp/blob/00aad818f096178b4a1c5bd79ebbf55b5c73239a/Screenshots/p8%20currrent%20appoin%20table.png)

### View appoinment Schedule (All Doctors data)
This screenshot displays the backend view of the Healthcare DApp, showing the complete appointment schedule for all doctors. Each row represents a doctor, and each column indicates hourly time slots from 1:00 PM to 7:00 PM. The system dynamically updates the status as "Booked" or "Available" based on real-time blockchain data, helping admins or users easily track appointment availability across all registered doctors.




![Image Alt](https://github.com/anju555555/HealthCare-dApp/blob/00aad818f096178b4a1c5bd79ebbf55b5c73239a/Screenshots/p9%20View%20all%20appointment%20table1.png)



![Image Alt](https://github.com/anju555555/HealthCare-dApp/blob/00aad818f096178b4a1c5bd79ebbf55b5c73239a/Screenshots/p10%20view%20all%20appointment%20table%202.png)

### Book Doctors Appointment(Patient Only)
This screenshot shows the "Book Doctor Appointment" section for patients in the Healthcare DApp. The user attempts to book an appointment with Dr. Jiya Patel for the 2:00 PM – 3:00 PM slot, but a pop-up alert indicates that the selected time slot is already booked. This ensures real-time slot validation, preventing double booking through blockchain logic.




![Image Alt](https://github.com/user-attachments/assets/2ef41838-1a9b-44e3-92ae-7c43b9029aac)


### Covid Trend Data (Current Data)
This screenshot displays the "Covid Trend Data" section of the Healthcare DApp. It shows a statistical summary of patient data by district, including total patients, age group distribution, and median age. For the district “Nikol,” one patient is recorded, with 100% falling under the elder category, indicating valuable demographic insight for health monitoring.




![Image Alt](https://github.com/anju555555/HealthCare-dApp/blob/00aad818f096178b4a1c5bd79ebbf55b5c73239a/Screenshots/p14%20covid%20trend%20data%20(view%20treds)%20patient.png)



### Registered Patients (Patients already registered)
This screenshot shows the "Registered Patients" section of the Healthcare DApp, powered by a blockchain-based backend. It displays a structured table of patient details such as name, age, gender, district, symptoms, and blood group. All data is securely stored and retrieved using smart contracts, ensuring transparency and tamper-proof patient management.




![Image Alt](https://github.com/anju555555/HealthCare-dApp/blob/00aad818f096178b4a1c5bd79ebbf55b5c73239a/Screenshots/p15%20register%20patient%20table%20.png)



### MongoDb and API
These screenshots showcase the backend database setup and API integration of the Healthcare DApp using MongoDB and Express.js. The first image shows MongoDB Compass connected to the healthcare database, with two collections: doctors and patients. The second and third images display JSON data fetched from API endpoints (/api/patients and /api/doctors) hosted on localhost:4000, returning structured information like patient demographics and doctor details. This setup ensures that user data is stored securely in MongoDB and served efficiently to the frontend via RESTful APIs.





![Image Alt](https://github.com/anju555555/HealthCare-dApp/blob/00aad818f096178b4a1c5bd79ebbf55b5c73239a/Screenshots/mongoDB%20data1.png)


![Image Alt](https://github.com/anju555555/HealthCare-dApp/blob/00aad818f096178b4a1c5bd79ebbf55b5c73239a/Screenshots/API%20doc%20data.png)


![Image Alt](https://github.com/anju555555/HealthCare-dApp/blob/00aad818f096178b4a1c5bd79ebbf55b5c73239a/Screenshots/API%20patient%20data.png)


-----


---

