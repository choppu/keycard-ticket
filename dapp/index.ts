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
  } else if (createTicketPage) {
    
  } 
}

window.onload = init;
