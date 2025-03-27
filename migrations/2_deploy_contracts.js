// requiring the contract
var PatientManagement = artifacts.require("./PatientManagement.sol");
var HealthcareToken = artifacts.require("./healthcareToken.sol");

// exporting as module 
 module.exports = function(deployer) {
  deployer.deploy(PatientManagement);
  deployer.deploy(HealthcareToken,1000000);
 };

  