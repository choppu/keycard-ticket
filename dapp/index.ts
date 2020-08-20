import * as _ from 'lodash';
import "./css/app.css";

const conferenceArtifact = require("../artifacts/Conference.json");

const { ethers } = require("ethers");
const ethSigUtil = require('eth-sig-util');
const WAValidator = require('@swyftx/api-crypto-address-validator');


let provider;
let signer;
let contract: any;

function init() : void {
  (window as any).ethereum.enable();
  provider = new ethers.providers.Web3Provider((window as any).ethereum);
  signer = provider.getSigner();

  let factory = new ethers.ContractFactory(conferenceArtifact.abi, conferenceArtifact.bytecode, signer);
  let contractCreatePage = document.getElementById("create-contract-page");
  let createTicketPage = document.getElementById("participate-page");
  let attendPage = document.getElementById("attend-page")

  if(contractCreatePage) {
    createContract(factory);
  } else if (createTicketPage) {
    createTicket(conferenceArtifact.abi, provider, signer);
  } else if (attendPage) {
    markAttendance();
  }
}

function createContract(factory: any) : void {
  let confDescription = document.getElementById("contract-description") as HTMLInputElement;
  let newConfButton = document.getElementById("contract-create");
  let imgContainer = document.getElementById("create-conference-image") as HTMLImageElement;
  let confImage =  require("../dapp/img/conference.png");
  let successContainer = document.getElementById("conference-success");
  let successMessage = document.getElementById("success-message");
  let address = document.getElementById("conference-address");

  imgContainer.src = confImage.default;
  successContainer.classList.add("kt__display-none");

  confDescription.addEventListener("input", (e) => {
    confDescription.value == "" ? newConfButton.setAttribute("disabled", "disabled") : newConfButton.removeAttribute("disabled");
    e.preventDefault();
  });

  newConfButton.addEventListener("click", async (e) => {
    contract = await factory.deploy(confDescription.value);
    await contract.deployed();
    let confName = await contract.description();
    successContainer.classList.remove("kt__display-none");
    successMessage.innerHTML = `${confName} has been created successfully`;
    address.innerHTML = `Address: ${contract.address}`;
    e.preventDefault();
  });
}

async function createTicket(abi: any, provider: any, signer: any) : Promise<void> {
  let ticketImage =  require("../dapp/img/ticket.png");
  let ticketContainer = document.getElementById("create-ticket-image") as HTMLImageElement;
  let confAddressField = document.getElementById("conference-address") as HTMLInputElement;
  let attendeeAddressField = document.getElementById("attendee-address") as HTMLInputElement;
  let ticketInputs = document.getElementsByClassName("kt_ticket-input");
  let participateButton = document.getElementById("conference-participate");
  let getKeycardAddressButton = document.getElementById("participate-get-keycard-address");
  let conferenceNameField = document.getElementById("conference-name");
  let ticketSuccessMessage = document.getElementById("ticket-success-message");
  let hash = document.getElementById("ticket-ethscan-link") as HTMLAnchorElement;
  let url = window.location.href;
  let attendeeAddress: string;
  let conferenceAddress: string;
  let contract: any;

  ticketSuccessMessage.innerHTML = "";
  hash.innerHTML = "";
  hash.href = "";

  if (url.indexOf('#') != - 1) {
    conferenceAddress = url.slice(url.indexOf('#') + 1);
    confAddressField.value = conferenceAddress;
    contract = await updateConferenceAddress(confAddressField.value, conferenceNameField, abi, provider);
    getKeycardAddressButton.removeAttribute("disabled");
  } else {
    conferenceNameField.innerHTML = "Register";
  }

  ticketContainer.src = ticketImage.default;
  
  confAddressField.addEventListener("input", async (e) => {
    if (WAValidator.validate(confAddressField.value, 'eth')) {
      contract = await updateConferenceAddress(confAddressField.value, conferenceNameField, abi, provider);
      getKeycardAddressButton.removeAttribute("disabled");
    }
    e.preventDefault();
  });

  getKeycardAddressButton.addEventListener("click", async (e) => {
    if (contract) {
      let data = await signAttendance(contract, provider);
      attendeeAddressField.value = data.keycard;
      enableParticipateButton(participateButton, confAddressField.value, attendeeAddressField.value);
      e.preventDefault();
    }
  });

  for (let i = 0; i < ticketInputs.length; i++) {
    ticketInputs[i].addEventListener("input", (e) => {
      enableParticipateButton(participateButton, confAddressField.value, attendeeAddressField.value);
      e.preventDefault();
    });
  }

  participateButton.addEventListener("click", async (e) => {
    let ticketExist = await contract.tickets(attendeeAddressField.value);
    if(attendeeAddressField.value != attendeeAddress && (ticketExist.exists == false)) {
      let ticket = await contract.connect(signer).createTicket(attendeeAddressField.value);
      ticketSuccessMessage.innerHTML = "Your attendance is registered "
      hash.href = "https://ropsten.etherscan.io/tx/" + ticket.hash;
      hash.innerHTML = "Check transaction on Etherscan";
      e.preventDefault();
    }
  });
}

function markAttendance() : void {
  let attendanceImg =  require("../dapp/img/attendance.png");
  let attendanceImgContainer = document.getElementById("attend-conference-image") as HTMLImageElement;
  attendanceImgContainer.src = attendanceImg.default;
}

async function updateConferenceAddress(conferenceAddress: string, conferenceNameField: HTMLElement, abi: any, provider: any) : Promise<any> {
  let conference = new ethers.Contract(conferenceAddress, abi, provider);
  let confName = await conference.description();
  conferenceNameField.innerHTML = "Register to " + confName;
  return conference;
}

function enableParticipateButton(participateButton: HTMLElement, confVal: string, attendeeVal: string) : void {
  if (WAValidator.validate(confVal, 'eth') && WAValidator.validate(attendeeVal, 'eth') && confVal != attendeeVal) {
    participateButton.removeAttribute("disabled");
  } else {
    participateButton.setAttribute("disabled", "disabled");
  }
}

async function signAttendance(conference: any, provider: any) : Promise<any> {
  let attendanceDataType = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
      ],
      Attendance: [
        { name: "conference", type: "address" }
      ]
    },
    primaryType: "Attendance",
    domain: {
      name: "Conference",
      version: "1",
      chainId: (await provider.getNetwork()).chainId,
      verifyingContract: conference.address
    }
  }

  const obj = Object.assign({message: {conference: conference.address}}, attendanceDataType);
  let signature = await (window as any).ethereum.send("keycard_signTypedData", JSON.stringify(obj));
  let keycard = ethSigUtil.recoverTypedSignature({data: obj, sig: signature});

  return {signature: signature, keycard: keycard};
}

window.onload = init;
