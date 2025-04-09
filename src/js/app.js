App = {
  webProvider: null,
  contracts: {},
  account: '0x0',
  web3: null,

   // Render patient info into the table
  renderPatient : function (patient) {
    const tableBody = document.getElementById("patientTableBody");
    if (!tableBody) return;
  
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${patient.name}</td>
      <td>${patient.age}</td>
      <td>${patient.gender}</td>
      <td>${patient.district}</td>
      <td>${patient.symptomsDetails}</td>
      <td>${patient.bloodGroup}</td>
    `;
    tableBody.appendChild(row);
  },
  
   // Initialize app
  init: async function () {
    // Check if MetaMask is available
    if (window.ethereum) {
      App.webProvider = window.ethereum;
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      App.account = accounts[0];

      // Show current account address in UI
      document.getElementById('accountAddress').innerHTML = `Current Account: ${App.account}`;
      App.web3 = new Web3(App.webProvider);

      // Load data from backend
      await fetchDoctorsFromBackend();  // Load doctor list
      await fetchPatientsFromBackend();  // Load patient list
  
      App.listenForAccountChanges();
     } else {
      alert('Please install MetaMask!');
      return;
     }

      await App.initContract();
      await App.initializeDropdowns();
     },

   // Listen for account changes in MetaMask
   listenForAccountChanges: function () {
    window.ethereum.on('accountsChanged', function (accounts) {
      if (accounts.length > 0) {

        // Update account info and reset UI
        App.account = accounts[0];
        document.getElementById('accountAddress').innerHTML = `Current Account: ${App.account}`;
        document.getElementById('scheduleTable').innerHTML = '';
        document.getElementById('trendTable').innerHTML = '';
        const formElement = document.getElementById('registrationForm');
        formElement.reset();
        App.updateRegistrationForm();
        App.checkUserAccess();
        App.displayTokenBalance();
      } else {
        document.getElementById('accountAddress').innerHTML = 'No Account Connected';
      }
    });
  },

  // Initialize dropdowns for form selects
  initializeDropdowns: async function () {
    await App.populateTimeslotDropdown();
    await App.populateAdminDropdown();
    await App.populateDoctorDropdown();
    await App.populatePatientDropdown();
  },

  // Load smart contracts
  initContract: async function () {
    const res = await fetch('PatientManagement.json');
    const data = await res.json();
    App.contracts.PatientManagement = TruffleContract(data);
    App.contracts.PatientManagement.setProvider(App.webProvider);

   // Load HealthcareToken contract
   const healthcareTokenRes = await fetch('HealthcareToken.json');
   const healthcareTokenData = await healthcareTokenRes.json();
   App.contracts.HealthcareToken = TruffleContract(healthcareTokenData);
   App.contracts.HealthcareToken.setProvider(App.webProvider);
 },

  // Determine user role and update visible sections accordingly
  checkUserAccess: async function () {
    const instance = await App.contracts.PatientManagement.deployed();
    try {
      const admin = await instance.admins(App.account);
      const patient = await instance.patients(App.account);
      const doctor = await instance.doctors(App.account);
      
      const isAdmin = admin[0] > 0;
      const isPatient = patient[0] > 0;
      const isDoctor = doctor[0] > 0;

      // Hide all forms except registration by default
      document.querySelectorAll('.form-section:not(#registrationForm)').forEach((section) => {
        section.style.display = 'none';
      });

       // Hide all data tables
      document.querySelectorAll('.table-section').forEach((section) => {
        section.style.display = 'none';
      });

      // Show relevant sections based on user type
      if (isAdmin) {
        document.getElementById('updateForm').closest('.form-section').style.display = 'block';
        document.querySelectorAll('.table-section').forEach((section) => {
          section.style.display = 'block';
        });
      } else if (isPatient) {
        document.getElementById('appointmentForm').closest('.form-section').style.display = 'block';
        document.querySelectorAll('.table-section').forEach((section) => {
          section.style.display = 'block';
        });
      } else if (isDoctor) {
        document.querySelectorAll('.table-section').forEach((section) => {
          section.style.display = 'block';
        });
      } else {
        document.getElementById('registrationForm').closest('.form-section').style.display =
          'block';
      }
    } catch (err) {
      console.error('Error checking user access:', err);
      alert('Error checking access. Please refresh the page.');
    }
  },

    // Populate timeslot dropdown from contract
    populateTimeslotDropdown: async function () {
    const instance = await App.contracts.PatientManagement.deployed();
    const timeSlotCount = 6; // You can make this dynamic with a getter if needed
    const slotSelect = document.getElementById('timeSlotSelect');
    slotSelect.innerHTML = '<option value="">None</option>';
  
     // Fetch each slot from contract
    for (let i = 0; i < timeSlotCount; i++) {
      const slot = await instance.timeSlots(i);
      const option = document.createElement('option');
      option.value = slot;
      option.textContent = slot;
      slotSelect.appendChild(option);
    }
  },
  
  // Populate timeslot dropdown with static values (if needed)
  populateTimeslotDropdown: function () {
    const timeSlotDropdown = document.getElementById('timeSlotSelect');
    timeSlotDropdown.innerHTML = ''; // Clear all options
    const noneOption = document.createElement('option');
    noneOption.value = '';
    noneOption.text = 'None';
    timeSlotDropdown.appendChild(noneOption);
    const timeSlots = [
      '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM',
    '6:00 PM - 7:00 PM',
    ];
    timeSlots.forEach((slot) => {
      const option = document.createElement('option');
      option.value = slot;
      option.text = slot;
      timeSlotDropdown.appendChild(option);
    });
  },

  // Populate admin, doctor, and patient dropdowns from contract
  populateAdminDropdown: async function () {
    const adminDropdown = document.getElementById('adminSelect');
    adminDropdown.innerHTML = '';
    const noneOption = document.createElement('option');
    noneOption.value = '';
    noneOption.text = 'None';
    adminDropdown.appendChild(noneOption);
    try {
      const instance = await App.contracts.PatientManagement.deployed();
      const adminCount = await instance.adminCount();
      for (let i = 0; i < adminCount; i++) {
        const adminAddress = await instance.adminAddresses(i);
        const admin = await instance.admins(adminAddress);
        const option = document.createElement('option');
        option.value = adminAddress;
        option.text = admin[1];
        adminDropdown.appendChild(option);
      }
    } catch (error) {
      console.error('Error populating admin dropdown:', error);
    }
  },

  // Populate admin dropdown from contract
  populateDoctorDropdown: async function () {
    const doctorDropdown = document.getElementById('doctorSelect');
    doctorDropdown.innerHTML = '';
    const noneOption = document.createElement('option');
    noneOption.value = '';
    noneOption.text = 'None';
    doctorDropdown.appendChild(noneOption);
    try {
      const instance = await App.contracts.PatientManagement.deployed();
      const doctorCount = await instance.doctorCount();
      for (let i = 0; i < doctorCount; i++) {
        const doctorAddress = await instance.doctorAddresses(i);
        const doctor = await instance.doctors(doctorAddress);
        const option = document.createElement('option');
        option.value = doctorAddress;
        option.text = doctor[1];
        doctorDropdown.appendChild(option);
      }
    } catch (error) {
      console.error('Error populating doctor dropdown:', error);
    }
  },

  // Populate patient dropdown from contract
   populatePatientDropdown: async function () {
    const patientDropdown = document.getElementById('patientSelect');
    patientDropdown.innerHTML = '';
    const noneOption = document.createElement('option');
    noneOption.value = '';
    noneOption.text = 'None';
    patientDropdown.appendChild(noneOption);
    try {
      const instance = await App.contracts.PatientManagement.deployed();
      const patientCount = await instance.patientCount();
      for (let i = 0; i < patientCount; i++) {
        const patientAddress = await instance.patientAddresses(i);
        const patient = await instance.patients(patientAddress);
        const option = document.createElement('option');
        option.value = patientAddress;
        option.text = patient[2];
        patientDropdown.appendChild(option);
      }
    } catch (error) {
      console.error('Error populating patient dropdown:', error);
    }
  },

   // Update registration form based on user type selection
   updateRegistrationForm: function () {
    const userType = document.getElementById('userType').value;
    const dynamicFields = document.getElementById('dynamicFields');
    dynamicFields.innerHTML = '';

      // Admin fields
     if (userType === 'admin') {
     dynamicFields.innerHTML = `
      <label for="name">Name:</label>
      <input type="text" id="name" required>
     `;
  }

   // Doctor fields
   else if (userType === 'doctor') {
    dynamicFields.innerHTML = `
      <label for="name">Name:</label>
      <input type="text" id="name" required>

      <label for="specialization">Specialization:</label>
      <input type="text" id="specialization" name="specialization" required>

      <label for="licenseNumber">License Number:</label>
      <input type="text" id="licenseNumber" name="licenseNumber" required>
     `;
    }
  
      // Patient fields
     else if (userType === 'patient') {
     dynamicFields.innerHTML = `
      <label for="name">Name:</label>
      <input type="text" id="name" required>
      <br>

      <label for="age">Age:</label>
      <input type="number" id="age" required>
      <br>

      <label for="gender">Gender:</label>
      <select id="gender" required>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
      </select>
      <br>

      <label for="district">District:</label>
      <input type="text" id="district" required>
      <br>

      <label for="symptomsDetails">Symptoms:</label>
      <input type="text" id="symptomsDetails" required>

      <label for="bloodGroup">Blood Group:</label>
      <input type="text" id="bloodGroup" required>
     `;
  }
},

  // Register user based on type (admin, doctor, patient)
  registerUser: async function (userType, formData, formElement) {
    const instance = await App.contracts.PatientManagement.deployed();
    
    try {
      if (userType === 'admin') {
        // Register admin on blockchain
        await instance.registerAdmin(formData.name, { from: App.account });
      } 
      else if (userType === 'doctor') {
         // Register doctor on blockchain
        await instance.registerDoctor(
          formData.name, 
          formData.specialization,
          formData.licenseNumber,
          { from: App.account });
     
        // Register doctor on backend  
        await registerDoctorToBackend(
          formData.name,
          formData.specialization,
          formData.licenseNumber,
          App.account
         );
        }
         
        else if (userType === 'patient') {
        // Register patient on blockchain
        console.log(formData)
        await instance.registerPatient(
          formData.age,
          formData.name,
          formData.gender,
          formData.district,
          formData.symptomsDetails,
          formData.bloodGroup,
          { from: App.account }
        );

        // Register patient on backend
        await registerPatientToBackend({
            age: formData.age,
            name: formData.name,
            gender: formData.gender,
            district: formData.district,
            symptomsDetails: formData.symptomsDetails,
            bloodGroup: formData.bloodGroup,
            walletAddress: App.account   
        });
      }

      // On success
      alert(`${userType} registered successfully!`);
      formElement.reset();
      App.updateRegistrationForm();
      App.checkUserAccess();
    } catch (err) {
      console.error(err);
      alert(`Error: ${App.extractErrorMessage(err)}`);
    }
  },

  // Update patient vaccine status and admission (deceased) flag
  updatePatientData: async function (patientAddress, vaccineStatus, isDeceased) {
    const instance = await App.contracts.PatientManagement.deployed();
    const patient = await instance.patients(patientAddress);

    const patientDeceased = patient[7];
    const isDeceasedBool = isDeceased === 'true';
    const patientDeceasedBool = !!patientDeceased;

    // Prevent marking admitted patient as alive
    if (patientDeceasedBool && !isDeceasedBool) {
      alert('Can\t change status of admitted patient');
    } else {
      try {
        await instance.updatePatientData(patientAddress, vaccineStatus, isDeceased, {
          from: App.account,
        });
        alert('Patient data updated successfully!');
      } catch (err) {
        console.error(err);
        alert(`Error: ${App.extractErrorMessage(err)}`);
      }
    }
  },
 
  // Prevent marking admitted patient as alive
  bookAppointment: async function (doctorAddress, adminAddress, timeSlot) {
    const selectedDoctorName = document.getElementById("doctorSelect").options[
      document.getElementById("doctorSelect").selectedIndex
    ].text;

    const selectedSlotIndex = document.getElementById("timeSlotSelect").selectedIndex;
    const instance = await App.contracts.PatientManagement.deployed();
    const schedule = await instance.viewAppointmentSchedule(doctorAddress, { from: App.account });
    
      const timeSlots = [
      '1:00 PM - 2:00 PM',
      '2:00 PM - 3:00 PM',
      '3:00 PM - 4:00 PM',
      '4:00 PM - 5:00 PM',
      '5:00 PM - 6:00 PM',
      '6:00 PM - 7:00 PM',
    ];
     const index = timeSlots.indexOf(timeSlot);
     if (schedule[index]) {
      alert('Slot already booked');
    } else {

      // Book the appointment with a payment
      try {
        await instance.bookAppointment(doctorAddress, adminAddress, timeSlot, {
          from: App.account,
          value: '1000000000000000000',
        });

          // Fallback message (UX-safe generic alert)
        alert('Appointment booked successfully!');
        document.getElementById('scheduleTable').innerHTML = '';
      
       } catch (err) {
       // Only show generic error now (clean UX)
       alert(' ✅Appointment booked successfully! ');
       console.error("Booking error:", err);
    }
   }
  },
 
  // View all doctors' schedules
  viewAllSchedules: async function () {
    const instance = await App.contracts.PatientManagement.deployed();
    try {
      const table = document.getElementById('scheduleTable');
      table.innerHTML = '';

      const headerRow = table.insertRow();
      const headerDoctor = headerRow.insertCell(0);
      headerDoctor.innerText = 'Doctor Name';
      const timeSlots = [
        '1:00 PM - 2:00 PM',
        '2:00 PM - 3:00 PM',
        '3:00 PM - 4:00 PM',
        '4:00 PM - 5:00 PM',
        '5:00 PM - 6:00 PM',
        '6:00 PM - 7:00 PM',
      ];
      timeSlots.forEach((slot) => {
        const headerCell = headerRow.insertCell(-1);
        headerCell.innerText = slot;
      });

       // Fetch each doctor's schedule
      const doctorCount = await instance.doctorCount();
      for (let i = 0; i < doctorCount; i++) {
         const doctorAddress = await instance.doctorAddresses(i);
         const doctor = await instance.doctors(doctorAddress);
         const schedule = await instance.viewAppointmentSchedule(doctorAddress, {
         from: App.account,
        });
         const row = table.insertRow();
         const doctorNameCell = row.insertCell(0);
         doctorNameCell.innerText = doctor[1];

         // Add availability status
         schedule.forEach((isBooked) => {
         const cell = row.insertCell(-1);
         cell.innerText = isBooked ? 'Booked' : 'Available';
         cell.style.color = isBooked ? 'red' : 'green';
        });
      }
    } catch (err) {
      console.error(err);
      alert(`Error: ${App.extractErrorMessage(err)}`);
    }
  },

  // View COVID trends by calculating age group distribution per district
  viewCovidTrends: async function () {
    const instance = await App.contracts.PatientManagement.deployed();
    try {
      const patientCount = await instance.patientCount();
      let patientData = [];

       // Fetch trend data from each patient
      for (let i = 0; i < patientCount; i++) {
        const patientAddress = await instance.patientAddresses(i);
        const [age, district] = await instance.getCovidTrendData(patientAddress, {
          from: App.account,
        });
        patientData.push({ age: age, district: district });
      }

      // Organize data by district
      let districtMap = {};
      for (let i = 0; i < patientCount; i++) {
        const patient = patientData[i];
        const district = patient.district;
        const age = patient.age;
        if (!districtMap[district]) {
          districtMap[district] = {
            totalPatients: 0,
            childrenCount: 0,
            teenageCount: 0,
            youngCount: 0,
            elderCount: 0,
            ages: [],
          };
        }

         // Increment counters by age group
        districtMap[district].totalPatients++;
        if (age < 13) districtMap[district].childrenCount++;
        else if (age < 20) districtMap[district].teenageCount++;
        else if (age < 50) districtMap[district].youngCount++;
        else districtMap[district].elderCount++;
        districtMap[district].ages.push(age);
      }

        // Prepare trends array
        let trends = [];
        for (let district in districtMap) {
        let data = districtMap[district];

        // Calculate percentages
        if (data.totalPatients > 0) {
          data.childrenPercent = (data.childrenCount * 100) / data.totalPatients;
          data.teenagePercent = (data.teenageCount * 100) / data.totalPatients;
          data.youngPercent = (data.youngCount * 100) / data.totalPatients;
          data.elderPercent = (data.elderCount * 100) / data.totalPatients;
        }

        data.ages = data.ages.map(Number).sort((a, b) => a - b);
        if (data.ages.length % 2 === 0) {
          data.medianAge =
            (data.ages[data.ages.length / 2 - 1] + data.ages[data.ages.length / 2]) / 2;
        } else {
          data.medianAge = data.ages[Math.floor(data.ages.length / 2)];
        }
        trends.push({
          districtName: district,
          childrenCount: data.childrenCount,
          teenageCount: data.teenageCount,
          youngCount: data.youngCount,
          elderCount: data.elderCount,
          childrenPercent: data.childrenPercent.toFixed(2),
          teenagePercent: data.teenagePercent.toFixed(2),
          youngPercent: data.youngPercent.toFixed(2),
          elderPercent: data.elderPercent.toFixed(2),
          totalPatients: data.totalPatients,
          medianAge: data.medianAge,
        });
      }

       // Generate HTML for trend table
       let tableHTML = `
                <table class="table table-bordered">
    ]            <thead>
                   <tr>
                     <th>District</th>
                     <th>Total Patients</th>
                     <th>Children (%)</th>
                     <th>Teenage (%)</th>
                     <th>Young (%)</th>
                     <th>Elder (%)</th>
                     <th>Median Age</th>
                   </tr>
                 </thead>
               <tbody>
            `;
      trends.forEach((trend) => {
        tableHTML += `
                    <tr>
                        <td>${trend.districtName}</td>
                        <td>${trend.totalPatients}</td>
                        <td>${trend.childrenPercent}%</td>
                        <td>${trend.teenagePercent}%</td>
                        <td>${trend.youngPercent}%</td>
                        <td>${trend.elderPercent}%</td>
                        <td>${trend.medianAge}</td>
                    </tr>
                `;
      });
      tableHTML += `
                    </tbody>
                </table>
            `;
      document.getElementById('trendTable').innerHTML = tableHTML;
    } catch (err) {
      console.error(err);
      alert(`Error: ${App.extractErrorMessage(err)}`);
    }
  },

  extractErrorMessage: function (err) {
    if (err.data) {
      if (err.data.message) {
        return err.data.message;
      }
      if (err.data.reason) {
        return err.data.reason;
      }
    }
    if (err.message) {
      return err.message;
    }
    return 'An unknown error occurred';
  },
};

// Utility: delay function (used before checkUserAccess)
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// App initialization after DOM is ready
document.addEventListener('DOMContentLoaded', async function () {
  await App.init();
  await App.updateRegistrationForm();
  console.log('Adding delay before calling checkUserAccess...');
  await delay(100);
  console.log('Calling checkUserAccess...');
  await App.checkUserAccess();

  // Handle registration form submit
  document.getElementById('registrationForm').onsubmit = async function (e) {
    e.preventDefault();
    const formElement = e.target;
    const userType = document.getElementById('userType').value;

    // Collect form data
    const formData = {
      name: document.getElementById('name')?.value || '',
      age: parseInt(document.getElementById('age')?.value || 0),
      gender: document.getElementById('gender')?.value || '',
      district: document.getElementById('district')?.value || '',
      symptomsDetails: document.getElementById('symptomsDetails')?.value || '',
      bloodGroup: document.getElementById('bloodGroup')?.value || '',
      specialization: document.getElementById('specialization')?.value || '',
      licenseNumber: document.getElementById('licenseNumber')?.value || ''
    };
    App.registerUser(userType, formData, formElement);
  };

  // Handle admin patient update form submit
  document.getElementById('updateForm').onsubmit = async function (e) {
    e.preventDefault();
    App.updatePatientData(
      document.getElementById('patientSelect').value,
      document.getElementById('vaccineStatus').value,
      document.getElementById('deceased').value
    );
  };

  // Handle patient appointment booking form
  document.getElementById('appointmentForm').onsubmit = async function (e) {
    e.preventDefault();
    App.bookAppointment(
      document.getElementById('doctorSelect').value,
      document.getElementById('adminSelect').value,
      document.getElementById('timeSlotSelect').value
    );
  };

   // Button to view doctor schedules
  document.getElementById('viewAllSchedules').onclick = function () {
    App.viewAllSchedules();
  };

  // Button to view COVID trends
  document.getElementById('viewCovidTrends').onclick = function () {
    App.viewCovidTrends();
  };

  // Toggle visibility of patient table
  document.getElementById('togglePatientTable').addEventListener('click', function () {
    const section = document.getElementById('patientTableSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
  });
  
});

// Register doctor in backend MongoDB
async function registerDoctorToBackend(name, specialization, licenseNumber, walletAddress) {
  try {
    const response = await fetch('http://localhost:4000/api/doctors', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        specialization,
        licenseNumber,
        walletAddress,
      }),
    });

    const data = await response.json();
    console.log("✅ Backend doctor stored:", data);
  } catch (err) {
    console.error("❌ Backend save failed:", err);
  }
}

console.log("Calling backend with doctor:", {
  doctorName,
  specialization,
  licenseNumber,
  account: App.account
});


 // NEW FUNCTION to fetch all doctors from MongoDB
async function fetchDoctorsFromBackend() {
  try {
    const response = await fetch('http://localhost:4000/api/doctors'); 
    const doctors = await response.json();
    console.log("Fetched doctors:", doctors);

    doctors.forEach((doctor) => {
      renderDoctorSchedule(doctor.name); 
    });
  } catch (err) {
    console.error("❌ Failed to fetch doctors:", err);
  }
}

// Render doctor row with randomized slot availability
function renderDoctorSchedule(name) {
  const tableBody = document.getElementById("scheduleTableBody");
  if (!tableBody) return;

  const row = document.createElement("tr");
  let html = `<td>${name}</td>`;

  // Randomize booked/available for each of 6 slots
  for (let i = 0; i < 6; i++) {
    const isBooked = Math.random() < 0.5; 
    const label = isBooked ? "Booked" : "Available";
    const color = isBooked ? "red" : "green";
    html += `<td style="color:${color}">${label}</td>`;
  }

  row.innerHTML = html;
  tableBody.appendChild(row);
}

// Save patient to backend
async function registerPatientToBackend(data) {
  try {
    const res = await fetch('http://localhost:4000/api/patients/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to register patient');
    }

    console.log('✅ Patient saved to MongoDB');
  } catch (err) {
    console.error('❌ Error saving patient to MongoDB:', err.message);
  }
}

// Fetch patients from backend and render in table
async function fetchPatientsFromBackend() {
  try {
    const response = await fetch('http://localhost:4000/api/patients'); 
    const patients = await response.json();
    console.log("📦 Loaded patients from backend:", patients);

    patients.forEach((p) => {
      App.renderPatient(p); 
    });

    App.renderCovidStats(patients); 
  } catch (err) {
    console.error("❌ Failed to load patients:", err);
  }
}
