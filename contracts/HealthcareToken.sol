// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// @dev ERC20 Token implementation for healthcare rewards and payments
contract HealthcareToken {
  string public name = 'Healthcare Token';
  string public symbol = 'HCT';
  uint8 public decimals = 18;
  uint256 public totalSupply;

  address public owner;
  address public patientManagementContract;

  mapping(address => uint256) public balanceOf;
  mapping(address => mapping(address => uint256)) public allowance;

  // Fee system for certain operations
  uint256 public transferFeeRate = 0;
  bool public feesEnabled = false;

  // List of addresses exempt from fees
  mapping(address => bool) public isExemptFromFee;

  // Events
  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
  event FeeRateChanged(uint256 newFeeRate);
  event FeesEnabledChanged(bool enabled);
  event PatientManagementContractChanged(address indexed newContract);

  modifier onlyOwner() {
    require(msg.sender == owner, 'Only the owner can call this function');
    _;
  }

  modifier onlyPatientManagement() {
    require(
      msg.sender == patientManagementContract,
      'Only the Patient Management contract can call this function'
    );
    _;
  }

  // Constructor that gives the deployer all initial tokens
  constructor(uint256 initialSupply) {
    owner = msg.sender;
    totalSupply = initialSupply * 10 ** uint256(decimals);
    balanceOf[msg.sender] = totalSupply;
    isExemptFromFee[msg.sender] = true;

    emit Transfer(address(0), msg.sender, totalSupply);
  }

  // Set the Patient Management contract address
  function setPatientManagementContract(address _contract) public onlyOwner {
    require(_contract != address(0), 'Cannot set zero address');
    patientManagementContract = _contract;
    isExemptFromFee[_contract] = true;

    emit PatientManagementContractChanged(_contract);
  }

  // Enable or disable fees
  function setFeesEnabled(bool _enabled) public onlyOwner {
    feesEnabled = _enabled;
    emit FeesEnabledChanged(_enabled);
  }

  // Set the transfer fee rate (in basis points, 1/100 of a percent)
  function setTransferFeeRate(uint256 _feeRate) public onlyOwner {
    require(_feeRate <= 500, 'Fee rate cannot exceed 5%');
    transferFeeRate = _feeRate;
    emit FeeRateChanged(_feeRate);
  }

  // Set an address as exempt from fees
  function setFeeExemption(address _address, bool _isExempt) public onlyOwner {
    isExemptFromFee[_address] = _isExempt;
  }

  // Transfer tokens from sender to recipient
  function transfer(address recipient, uint256 amount) public returns (bool) {
    uint256 feeAmount = 0;

    if (feesEnabled && !isExemptFromFee[msg.sender] && !isExemptFromFee[recipient]) {
      feeAmount = (amount * transferFeeRate) / 10000;
    }

    _transfer(msg.sender, recipient, amount - feeAmount);

    if (feeAmount > 0) {
      _transfer(msg.sender, owner, feeAmount);
    }

    return true;
  }

  // Approve the spender to spend the specified amount of tokens on behalf of the sender
  function approve(address spender, uint256 amount) public returns (bool) {
    allowance[msg.sender][spender] = amount;
    emit Approval(msg.sender, spender, amount);
    return true;
  }

  // Transfer tokens from one address to another
  function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
    require(allowance[sender][msg.sender] >= amount, 'Transfer amount exceeds allowance');

    uint256 feeAmount = 0;

    // Calculate fee if applicable
    if (feesEnabled && !isExemptFromFee[sender] && !isExemptFromFee[recipient]) {
      feeAmount = (amount * transferFeeRate) / 10000;
    }

    allowance[sender][msg.sender] -= amount;
    _transfer(sender, recipient, amount - feeAmount);

    if (feeAmount > 0) {
      _transfer(sender, owner, feeAmount);
    }

    return true;
  }

  // Internal function to transfer tokens
  function _transfer(address sender, address recipient, uint256 amount) internal {
    require(sender != address(0), 'Transfer from the zero address');
    require(recipient != address(0), 'Transfer to the zero address');
    require(balanceOf[sender] >= amount, 'Transfer amount exceeds balance');

    balanceOf[sender] -= amount;
    balanceOf[recipient] += amount;

    emit Transfer(sender, recipient, amount);
  }

  // Mint tokens to a specified address (only callable by the owner)
  function mint(address recipient, uint256 amount) public onlyOwner {
    require(recipient != address(0), 'Mint to the zero address');

    uint256 mintAmount = amount * 10 ** uint256(decimals);
    totalSupply += mintAmount;
    balanceOf[recipient] += mintAmount;

    emit Transfer(address(0), recipient, mintAmount);
  }

  // Burn tokens from the caller's account
  function burn(uint256 amount) public {
    uint256 burnAmount = amount * 10 ** uint256(decimals);
    require(balanceOf[msg.sender] >= burnAmount, 'Burn amount exceeds balance');

    balanceOf[msg.sender] -= burnAmount;
    totalSupply -= burnAmount;

    emit Transfer(msg.sender, address(0), burnAmount);
  }

  // Reward tokens for specific healthcare actions (can only be called by the Patient Management contract)
  function rewardForHealthcareAction(
    address recipient,
    uint256 amount
  ) public onlyPatientManagement {
    require(recipient != address(0), 'Reward to the zero address');

    uint256 rewardAmount = amount * 10 ** uint256(decimals);

    // Check if there are enough tokens in the contract balance
    if (balanceOf[patientManagementContract] >= rewardAmount) {
      _transfer(patientManagementContract, recipient, rewardAmount);
    } else {
      totalSupply += rewardAmount;
      balanceOf[recipient] += rewardAmount;
      emit Transfer(address(0), recipient, rewardAmount);
    }
  }

  // Withdraw ETH accidentally sent to the contract (only callable by the owner)
  function withdrawETH() public onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, 'No ETH to withdraw');

    payable(owner).transfer(balance);
  }

  /**
   * @dev Withdraw any ERC20 tokens accidentally sent to the contract (only callable by the owner)
   */
  function withdrawERC20(address tokenAddress, uint256 amount) public onlyOwner {
    IERC20 token = IERC20(tokenAddress);
    token.transfer(owner, amount);
  }
  receive() external payable {}
}

// Interface for interacting with other ERC20 tokens
interface IERC20 {
  function transfer(address recipient, uint256 amount) external returns (bool);
  function balanceOf(address account) external view returns (uint256);
}

/**
 * @title HealthcareRewards
 * @dev Contract to manage healthcare rewards and incentives
 */
contract HealthcareRewards {
  HealthcareToken public token;
  address public patientManagementContract;
  address public owner;

  // Reward amounts (in tokens with decimals)
  uint256 public registrationReward = 10;
  uint256 public appointmentCompletionReward = 5;
  uint256 public regularCheckupReward = 15;
  uint256 public vaccinationReward = 20;

  // Keeping track of rewards
  mapping(address => uint256) public totalRewardsEarned;
  mapping(address => uint256) public lastRewardTime;

  // Cooldown periods for rewards (in seconds)
  uint256 public constant REGISTRATION_COOLDOWN = 30 days;
  uint256 public constant APPOINTMENT_COOLDOWN = 1 days;
  uint256 public constant CHECKUP_COOLDOWN = 90 days;

  // Events
  event RewardIssued(address indexed recipient, uint256 amount, string rewardType);
  event RewardAmountChanged(string rewardType, uint256 newAmount);
  event PatientManagementContractChanged(address indexed newContract);

  modifier onlyOwner() {
    require(msg.sender == owner, 'Only the owner can call this function');
    _;
  }

  modifier onlyPatientManagement() {
    require(
      msg.sender == patientManagementContract,
      'Only the Patient Management contract can call this function'
    );
    _;
  }

  constructor(address payable _tokenAddress) {
    token = HealthcareToken(_tokenAddress);
    owner = msg.sender;
  }

  // Set the Patient Management contract address
  function setPatientManagementContract(address _contract) public onlyOwner {
    require(_contract != address(0), 'Cannot set zero address');
    patientManagementContract = _contract;
    emit PatientManagementContractChanged(_contract);
  }

  // Set the reward amounts
  function setRewardAmounts(
    uint256 _registration,
    uint256 _appointment,
    uint256 _checkup,
    uint256 _vaccination
  ) public onlyOwner {
    registrationReward = _registration;
    appointmentCompletionReward = _appointment;
    regularCheckupReward = _checkup;
    vaccinationReward = _vaccination;

    emit RewardAmountChanged('registration', _registration);
    emit RewardAmountChanged('appointment', _appointment);
    emit RewardAmountChanged('checkup', _checkup);
    emit RewardAmountChanged('vaccination', _vaccination);
  }

  // Issue a registration reward
  function issueRegistrationReward(address patient) public onlyPatientManagement {
    require(
      block.timestamp - lastRewardTime[patient] >= REGISTRATION_COOLDOWN,
      'Registration reward cooldown period not met'
    );

    lastRewardTime[patient] = block.timestamp;
    totalRewardsEarned[patient] += registrationReward;

    token.rewardForHealthcareAction(patient, registrationReward);
    emit RewardIssued(patient, registrationReward, 'registration');
  }

  // Issue an appointment completion reward
  function issueAppointmentReward(address patient) public onlyPatientManagement {
    require(
      block.timestamp - lastRewardTime[patient] >= APPOINTMENT_COOLDOWN,
      'Appointment reward cooldown period not met'
    );

    lastRewardTime[patient] = block.timestamp;
    totalRewardsEarned[patient] += appointmentCompletionReward;

    token.rewardForHealthcareAction(patient, appointmentCompletionReward);
    emit RewardIssued(patient, appointmentCompletionReward, 'appointment');
  }

  // Issue a regular checkup reward
  function issueCheckupReward(address patient) public onlyPatientManagement {
    require(
      block.timestamp - lastRewardTime[patient] >= CHECKUP_COOLDOWN,
      'Checkup reward cooldown period not met'
    );

    lastRewardTime[patient] = block.timestamp;
    totalRewardsEarned[patient] += regularCheckupReward;

    token.rewardForHealthcareAction(patient, regularCheckupReward);
    emit RewardIssued(patient, regularCheckupReward, 'checkup');
  }

  // Issue a vaccination reward
  function issueVaccinationReward(address patient) public onlyPatientManagement {
    totalRewardsEarned[patient] += vaccinationReward;

    token.rewardForHealthcareAction(patient, vaccinationReward);
    emit RewardIssued(patient, vaccinationReward, 'vaccination');
  }

  // Get total rewards earned by a patient
  function getPatientRewards(address patient) public view returns (uint256) {
    return totalRewardsEarned[patient];
  }
}
