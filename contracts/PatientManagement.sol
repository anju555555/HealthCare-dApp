// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PatientManagement
 * @dev A system for managing patient records, appointments, and healthcare data on blockchain
 */
contract PatientManagement {
  // Enum for vaccine status to replace string-based comparisons
  enum VaccineStatus {
    NOT_VACCINATED,
    ONE_DOSE,
    TWO_DOSE,
    BOOSTER
  }

  // Enum for patient severity status
  enum PatientSeverity {
    MILD,
    MODERATE,
    SEVERE,
    CRITICAL
  }

  // Admin structure
  struct Admin {
    uint id;
    string name;
    uint timestamp;
    bool active;
  }

  // Patient structure
  struct Patient {
    uint id;
    uint age;
    string name;
    string gender;
    string district;
    VaccineStatus vaccineStatus;
    string symptomsDetails;
    PatientSeverity severity;
    bool isDead;
    address patientAddress;
    uint lastCheckup;
    string bloodGroup;
    string[] allergies;
    string[] medications;
    uint timestamp;
  }

  // Doctor structure
  struct Doctor {
    uint id;
    string name;
    string specialization;
    string licenseNumber;
    bool verified;
    uint appointmentFee;
    uint timestamp;
    address doctorAddress;
  }

  // Appointment structure
  struct Appointment {
    address patient;
    uint timestamp;
    bool completed;
    string diagnosis;
    string prescription;
  }

  // District statistics
  struct DistrictData {
    string districtName;
    uint childrenCount;
    uint teenageCount;
    uint youngCount;
    uint elderCount;
    uint childrenPercent;
    uint teenagePercent;
    uint youngPercent;
    uint elderPercent;
    uint totalPatients;
    uint medianAge;
  }

  // Counters for each entity
  uint public adminCount;
  uint public patientCount;
  uint public doctorCount;
  uint public appointmentCount;

  // Mappings for storing user data
  mapping(address => Admin) public admins;
  mapping(address => Patient) public patients;
  mapping(address => Doctor) public doctors;
  mapping(address => mapping(string => Appointment)) public doctorAppointments;
  mapping(string => mapping(uint256 => bool)) public doctorSchedule;

  // Address lists
  address[] public patientAddresses;
  address[] public doctorAddresses;
  address[] public adminAddresses;

  // User registration and type
  mapping(address => bool) private registeredUsers;
  mapping(address => uint) public userType;

  // Available time slots
  string[] public timeSlots = [
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM',
    '6:00 PM - 7:00 PM'
  ];

  // Check if provided slot exists
  function isSlotValid(string memory timeSlot) public view returns (bool) {
    for (uint i = 0; i < timeSlots.length; i++) {
      if (keccak256(bytes(timeSlots[i])) == keccak256(bytes(timeSlot))) {
        return true;
      }
    }
    return false;
  }

  // Emergency contacts for patients
  mapping(address => address[]) public emergencyContacts;

  // Events for logging actions
  event AdminRegistered(address indexed adminAddress, uint id, string name, uint timestamp);
  event DoctorRegistered(
    address indexed doctorAddress,
    uint256 id,
    string name,
    string specialization,
    uint256 timestamp
  );

  event PatientRegistered(address indexed patientAddress, uint id, string name, uint timestamp);
  event PatientUpdated(address indexed patientAddress, string updateField, uint timestamp);
  event AppointmentBooked(
    address indexed patientAddress,
    address indexed doctorAddress,
    string timeSlot,
    uint fee,
    uint timestamp
  );

  event AppointmentCompleted(
    address indexed patientAddress,
    address indexed doctorAddress,
    string timeSlot,
    uint timestamp
  );

  // Modifier: restrict to admin only
  modifier onlyAdmin() {
    require(userType[msg.sender] == 1, 'Only admins can perform this action');
    require(admins[msg.sender].active, 'Admin account is not active');
    _;
  }

  // Modifier: restrict to verified doctors
  modifier onlyDoctor() {
    require(userType[msg.sender] == 2, 'Only doctors can perform this action');
    require(doctors[msg.sender].verified, 'Doctor account is not verified');
    _;
  }

  // Modifier: restrict to patients
  modifier onlyPatient() {
    require(userType[msg.sender] == 3, 'Only patients can perform this action');
    _;
  }

  // Modifier: only registered users can access
  modifier onlyRegisteredUser() {
    require(registeredUsers[msg.sender], 'You must be registered');
    _;
  }

  // Constructor: registers contract deployer as the first admin
  constructor() {
    address hardcodedAdmin = 0x0D2f38cD0F5CB5E52e8701e0378Dfa958AA43cf5;
    adminCount++;
    admins[hardcodedAdmin] = Admin({
      id: adminCount,
      name: 'Contract Deployer',
      timestamp: block.timestamp,
      active: true
    });
    registeredUsers[hardcodedAdmin] = true;
    userType[hardcodedAdmin] = 1;
    adminAddresses.push(hardcodedAdmin);

    emit AdminRegistered(hardcodedAdmin, adminCount, 'Contract Deployer', block.timestamp);
  }

  // Function to register a new admin
  function registerAdmin(string memory name) public {
    require(!registeredUsers[msg.sender], 'You are already registered');
    require(bytes(name).length > 0, 'Name cannot be empty');

    adminCount++;
    admins[msg.sender] = Admin({
      id: adminCount,
      name: name,
      timestamp: block.timestamp,
      active: true
    });

    registeredUsers[msg.sender] = true;
    userType[msg.sender] = 1;
    adminAddresses.push(msg.sender);

    emit AdminRegistered(msg.sender, adminCount, name, block.timestamp);
  }

  // Function to register a new patient
  function registerPatient(
    uint age,
    string memory name,
    string memory gender,
    string memory district,
    string memory symptomsDetails,
    string memory bloodGroup
  ) public // Ensure user is not already registered
  {
    require(!registeredUsers[msg.sender], 'You are already registered');
    require(bytes(name).length > 0, 'Name cannot be empty');
    require(age > 0, 'Age must be greater than 0');
    require(bytes(gender).length > 0, 'Gender cannot be empty');
    require(bytes(district).length > 0, 'District cannot be empty');
    require(bytes(symptomsDetails).length > 0, 'Symptoms details cannot be empty');
    require(bytes(bloodGroup).length > 0, 'Blood group cannot be empty');

    patientCount++;

    string[] memory emptyStringArray = new string[](0);

    // Create and store patient record
    patients[msg.sender] = Patient({
      id: patientCount,
      name: name,
      age: age,
      gender: gender,
      district: district,
      vaccineStatus: VaccineStatus.NOT_VACCINATED,
      symptomsDetails: symptomsDetails,
      severity: PatientSeverity.MILD,
      isDead: false,
      patientAddress: msg.sender,
      lastCheckup: block.timestamp,
      bloodGroup: bloodGroup,
      allergies: emptyStringArray,
      medications: emptyStringArray,
      timestamp: block.timestamp
    });

    // Mark user as registered
    registeredUsers[msg.sender] = true;
    userType[msg.sender] = 3;
    patientAddresses.push(msg.sender);

    // Emit event for logging
    emit PatientRegistered(msg.sender, patientCount, name, block.timestamp);
  }

  // Function to register a new doctor
  function registerDoctor(
    string memory name,
    string memory specialization,
    string memory licenseNumber
  ) public {
    require(!registeredUsers[msg.sender], 'You are already registered');
    require(bytes(name).length > 0, 'Name cannot be empty');
    require(bytes(specialization).length > 0, 'Specialization cannot be empty');
    require(bytes(licenseNumber).length > 0, 'License number cannot be empty');

    doctorCount++;

    doctors[msg.sender] = Doctor({
      id: doctorCount,
      name: name,
      specialization: specialization,
      licenseNumber: licenseNumber,
      verified: false,
      appointmentFee: 0.01 ether,
      timestamp: block.timestamp,
      doctorAddress: msg.sender
    });

    registeredUsers[msg.sender] = true;
    userType[msg.sender] = 2;
    doctorAddresses.push(msg.sender);

    emit DoctorRegistered(msg.sender, doctorCount, name, specialization, block.timestamp);
  }

  // Function to update patient data
  function updatePatientData(
    address patientAddress,
    uint vaccineStatusCode,
    bool isDead
  ) public onlyAdmin {
    require(userType[patientAddress] == 3, 'Address is not a registered patient');
    require(vaccineStatusCode <= uint(VaccineStatus.BOOSTER), 'Invalid vaccine status');

    Patient storage patient = patients[patientAddress];

    require(!(patient.isDead && isDead == false), 'Dead patient cannot be marked as alive');

    patient.vaccineStatus = VaccineStatus(vaccineStatusCode);
    if (!patient.isDead) {
      patient.isDead = isDead;
    }

    emit PatientUpdated(patientAddress, 'vaccineStatus', block.timestamp);
    if (isDead) {
      emit PatientUpdated(patientAddress, 'deceased', block.timestamp);
    }
  }

  // Update severity level of a patient
  function updatePatientSeverity(address patientAddress, uint severityCode) public onlyAdmin {
    require(userType[patientAddress] == 3, 'Address is not a registered patient');
    require(severityCode <= uint(PatientSeverity.CRITICAL), 'Invalid severity status');
    require(!patients[patientAddress].isDead, 'Cannot update deceased patient');

    patients[patientAddress].severity = PatientSeverity(severityCode);
    patients[patientAddress].lastCheckup = block.timestamp;

    emit PatientUpdated(patientAddress, 'severity', block.timestamp);
  }

  // Add allergy record to a patient
  function addPatientAllergy(address patientAddress, string memory allergy) public onlyAdmin {
    require(userType[patientAddress] == 3, 'Address is not a registered patient');
    require(bytes(allergy).length > 0, 'Allergy cannot be empty');
    require(!patients[patientAddress].isDead, 'Cannot update deceased patient');

    patients[patientAddress].allergies.push(allergy);

    emit PatientUpdated(patientAddress, 'allergy', block.timestamp);
  }

  // Add medication record to a patient
  function addPatientMedication(address patientAddress, string memory medication) public onlyAdmin {
    require(userType[patientAddress] == 3, 'Address is not a registered patient');
    require(bytes(medication).length > 0, 'Medication cannot be empty');
    require(!patients[patientAddress].isDead, 'Cannot update deceased patient');

    patients[patientAddress].medications.push(medication);

    emit PatientUpdated(patientAddress, 'medication', block.timestamp);
  }

  // Function to verify a doctor
  function verifyDoctor(address doctorAddress) public onlyAdmin {
    require(userType[doctorAddress] == 2, 'Address is not a registered doctor');

    doctors[doctorAddress].verified = true;

    emit DoctorRegistered(
      doctorAddress,
      doctors[doctorAddress].id,
      doctors[doctorAddress].name,
      doctors[doctorAddress].specialization,
      block.timestamp
    );
  }

  // Function to set appointment fee for a doctor
  function setDoctorAppointmentFee(uint fee) public onlyDoctor {
    require(fee > 0, 'Fee must be greater than 0');

    doctors[msg.sender].appointmentFee = fee;
  }

  // Function to book an appointment with a doctor
  function bookAppointment(
    address doctorAddress,
    address adminAddress,
    string memory timeSlot
  ) public payable onlyPatient {
    require(userType[doctorAddress] == 2, 'Not a valid doctor');
    require(doctors[doctorAddress].verified, 'Doctor is not verified');
    require(userType[adminAddress] == 1, 'Not a valid admin');
    require(
      msg.value >= doctors[doctorAddress].appointmentFee,
      'Insufficient payment for appointment'
    );
    require(!patients[msg.sender].isDead, 'Deceased patients cannot book appointments');

    bool validSlot = false;
    for (uint i = 0; i < timeSlots.length; i++) {
      if (keccak256(bytes(timeSlots[i])) == keccak256(bytes(timeSlot))) {
        validSlot = true;
        break;
      }
    }
    require(validSlot, 'Invalid time slot');

    Appointment storage appointment = doctorAppointments[doctorAddress][timeSlot];
    require(appointment.patient == address(0), 'Time slot already booked');

    appointment.patient = msg.sender;
    appointment.timestamp = block.timestamp;
    appointment.completed = false;

    appointmentCount++;

    payable(adminAddress).transfer(msg.value);

    emit AppointmentBooked(msg.sender, doctorAddress, timeSlot, msg.value, block.timestamp);
  }

  // Function to complete an appointment
  function completeAppointment(
    string memory timeSlot,
    string memory diagnosis,
    string memory prescription
  ) public onlyDoctor {
    Appointment storage appointment = doctorAppointments[msg.sender][timeSlot];

    require(appointment.patient != address(0), 'No appointment in this time slot');
    require(!appointment.completed, 'Appointment already completed');

    appointment.completed = true;
    appointment.diagnosis = diagnosis;
    appointment.prescription = prescription;

    patients[appointment.patient].lastCheckup = block.timestamp;

    emit AppointmentCompleted(appointment.patient, msg.sender, timeSlot, block.timestamp);
  }

  // Add allergy record to a patient
  function viewAppointmentSchedule(
    address doctorAddress
  ) public view onlyRegisteredUser returns (string[] memory, address[] memory, bool[] memory) {
    require(userType[doctorAddress] == 2, 'Not a valid doctor');

    string[] memory availableSlots = new string[](timeSlots.length);
    address[] memory bookedPatients = new address[](timeSlots.length);
    bool[] memory completionStatus = new bool[](timeSlots.length);

    for (uint i = 0; i < timeSlots.length; i++) {
      availableSlots[i] = timeSlots[i];
      Appointment storage appointment = doctorAppointments[doctorAddress][timeSlots[i]];
      bookedPatients[i] = appointment.patient;
      completionStatus[i] = appointment.completed;
    }

    return (availableSlots, bookedPatients, completionStatus);
  }

  // Function to get appointment details
  function getAppointmentDetails(
    address doctorAddress,
    string memory timeSlot
  ) public view onlyRegisteredUser returns (address, uint, bool, string memory, string memory) {
    require(userType[doctorAddress] == 2, 'Not a valid doctor');

    Appointment storage appointment = doctorAppointments[doctorAddress][timeSlot];

    require(appointment.patient != address(0), 'No appointment in this time slot');

    if (
      msg.sender != doctorAddress && userType[msg.sender] != 1 && msg.sender != appointment.patient
    ) {
      return (appointment.patient, appointment.timestamp, appointment.completed, '', '');
    }

    return (
      appointment.patient,
      appointment.timestamp,
      appointment.completed,
      appointment.diagnosis,
      appointment.prescription
    );
  }

  // Function to get patient details
  function getPatientAllergies(
    address patientAddress
  ) public view onlyRegisteredUser returns (string[] memory) {
    require(userType[patientAddress] == 3, 'Not a valid patient');

    // Only admin, doctor, or patient themselves can view this
    require(
      userType[msg.sender] == 1 || userType[msg.sender] == 2 || msg.sender == patientAddress,
      'Not authorized to view this information'
    );

    return patients[patientAddress].allergies;
  }

  // Function to get patient medications
  function getPatientMedications(
    address patientAddress
  ) public view onlyRegisteredUser returns (string[] memory) {
    require(userType[patientAddress] == 3, 'Not a valid patient');

    require(
      userType[msg.sender] == 1 || userType[msg.sender] == 2 || msg.sender == patientAddress,
      'Not authorized to view this information'
    );

    return patients[patientAddress].medications;
  }

  // Function to get patient details
  function getCovidTrendData(
    address patientAddress
  ) public view onlyRegisteredUser returns (uint, string memory, uint, bool, PatientSeverity) {
    require(userType[patientAddress] == 3, 'Not a valid patient');

    Patient storage patient = patients[patientAddress];

    return (
      patient.age,
      patient.district,
      uint(patient.vaccineStatus),
      patient.isDead,
      patient.severity
    );
  }

  // Add allergy record to a patient
  function addEmergencyContact(address contact) public onlyPatient {
    require(registeredUsers[contact], 'Emergency contact must be a registered user');

    emergencyContacts[msg.sender].push(contact);
  }

  // Function to get emergency contacts of a patient
  function getPatientCount() public view returns (uint) {
    return patientCount;
  }

  // Return total number of registered doctors
  function getDoctorCount() public view returns (uint) {
    return doctorCount;
  }

  // Get patient address by index (only for registered users)
  function getPatientByIndex(uint index) public view onlyRegisteredUser returns (address) {
    require(index < patientAddresses.length, 'Invalid index');

    return patientAddresses[index];
  }

  // Get doctor address by index (only for registered users)
  function getDoctorByIndex(uint index) public view onlyRegisteredUser returns (address) {
    require(index < doctorAddresses.length, 'Invalid index');

    return doctorAddresses[index];
  }
}
