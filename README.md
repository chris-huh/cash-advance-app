# Cash Advance App

## Description
- Users can create an **application** for a line of credit.
- An application can be in one of the following **states**:
    - **Open**: The application has been created but funds have not yet been disbursed.
    - **Cancelled**: User-initiated cancellation before any funds are disbursed.
    - **Rejected**: Admin has rejected the application.
    - **Outstanding**: Funds have been disbursed (within the user’s credit limit).
    - **Repaid**: User has fully repaid the outstanding amount.
- Users can **disburse** funds if it does not exceed their credit limit and optionally request **Express Delivery** (arrives within 3 days) along with leaving a **tip**.
- Users can **repay** partially or in full. Full repayment transitions the application to **Repaid**.
- Users can **cancel** the application if it is still in **Open** state.
- Admins can **reject** an application in **Open** state.
- Users should be able to **view** all their historical applications at any time.

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone git@github.com:chris-huh/cash-advance-app.git
   cd cash-advance-app
   ```

2. **Install server dependencies and run the server**
   ```bash
   npm install && npm run offline
   ```
   
3. **Install client dependencies and run the client:**
   Open a new terminal window, navigate to the client directory, and run:
   ```bash
   npm install && npm run dev
   ```

### Accessing the App
Open your browser and go to [http://localhost:5173](http://localhost:5173) to access the application.

## User Registration

- **Regular Users:** You can create regular users by clicking on the "Register" button in the app.
  
- **Admin Users:** Admin users need to be created using a CURL command. Use the following command to create an admin user:
  ```bash
  curl -X POST http://localhost:3000/signup -H "Content-Type: application/json" -d '{"isAdmin": true, "email": "admin-email", "password": "admin-password"}'
  ```

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
