import * as _ from 'lodash';
import "./css/app.css";

const conferenceArtifact = require("../artifacts/Conference.json");

const { ethers } = require("ethers");
const ethSigUtil = require('eth-sig-util');

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

  if(contractCreatePage) {
    createContract(factory);
  } else if (createTicketPage) {
    createTicket(conferenceArtifact.abi, provider);
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

async function createTicket(abi: any, provider: any) : Promise<void> {
  let ticketImage =  require("../dapp/img/ticket.png");
  let ticketContainer = document.getElementById("create-ticket-image") as HTMLImageElement;
  let confAddressField = document.getElementById("conference-address") as HTMLInputElement;
  let attendeeAddressField = document.getElementById("attendee-address") as HTMLInputElement;
  let ticketInputs = document.getElementsByClassName("kt_ticket-input");
  let url = window.location.href;
  let participateButton = document.getElementById("conference-participate");
  let signButton = document.getElementById("participate-sign");
  let attendeeAddress: string;
  let confName;
  let conferenceAddress = url.slice(url.indexOf('#') + 1);
  let contract = new ethers.Contract(conferenceAddress, abi, provider);
  let conferenceNameField = document.getElementById("conference-name");

  ticketContainer.src = ticketImage.default;
  confAddressField.value = conferenceAddress;
  confName = await contract.description();
  conferenceNameField.innerHTML = "Register to " + confName;

  confAddressField.addEventListener("input", async (e) => {
    if(confAddressField.value.length == 42) {
      contract = new ethers.Contract(confAddressField.value, abi, provider);
      confName = await contract.description();
      conferenceNameField.innerHTML = "Register to " + confName;
    }
    e.preventDefault();
  });

  signButton.addEventListener("click", async (e) => {
    let data = await signAttendance(contract, provider);
    attendeeAddressField.value = data.keycard;
    e.preventDefault();
  });

  for (let i = 0; i < ticketInputs.length; i++) {
    ticketInputs[i].addEventListener("input", (e) => {
      if (confAddressField.value.length == 42 && attendeeAddressField.value.length == 42 && confAddressField.value != attendeeAddressField.value) {
        participateButton.removeAttribute("disabled");
      } else {
        participateButton.setAttribute("disabled", "disabled");
      }
      e.preventDefault();
    });
  }

  participateButton.addEventListener("click", async (e) => {
    if(attendeeAddressField.value != attendeeAddress) {
      contract.createTicket(attendeeAddressField.value);
      let ticket = await contract.tickets(attendeeAddressField.value);
      console.log(ticket);
      e.preventDefault();
    }
  });

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
  };

  const obj = Object.assign({message: {conference: conference.address}}, attendanceDataType);
  let signature = await (window as any).ethereum.send("keycard_signTypedData", JSON.stringify(obj));
  let keycard = ethSigUtil.recoverTypedSignature({data: obj, sig: signature});

  return {signature: signature, keycard: keycard};
}

window.onload = init;
