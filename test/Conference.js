const { expect } = require("chai");
const { ethers } = require("@nomiclabs/buidler");
const ethSigUtil = require('eth-sig-util');

describe("Conference contract", () => {
  let conference;
  let owner;
  let attendee;
  let attendeeAddress;
  let keycardPrivate = "bc76d50cc6e6c020fad1f99dec1f7379564cd29a890cf0ce3fefacc2b4dc34c3";
  let keycardAddress = "0x57139B20c66AaaC8e0Cc93d448D6BeBF4f53b58D";
  let attendanceDataType;
  let desc = "Conference 1";

  function keycardSign(message, key) {
    const obj = Object.assign({ message: message }, attendanceDataType);
    return ethSigUtil.signTypedData(Buffer.from(key, "hex"), { data: obj });
  }

  before(async () =>{
    const Conference = await ethers.getContractFactory("Conference");
    [owner, attendee, ...addrs] = await ethers.getSigners();
    attendeeAddress = await attendee.getAddress();
    conference = await Conference.deploy(desc);
    await conference.deployed();

    attendanceDataType = {
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
        chainId: (await owner.provider.getNetwork()).chainId,
        verifyingContract: conference.address
      }
    };
  });

  it("Correct description", async () => {
    expect(await conference.description()).to.equal(desc);
  });

  it("Create Ticket", async () => {
    await conference.connect(attendee).createTicket(keycardAddress);
    let ticket = await conference.tickets(keycardAddress);
    expect(ticket.exists).to.equal(true);
    expect(ticket.attended).to.equal(false);

    let ticket2 = await conference.tickets(attendeeAddress);
    expect(ticket2.exists).to.equal(false);
    expect(ticket2.attended).to.equal(false);
  });

  it("Ticket exists", async () => {
    await expect(conference.connect(attendee).createTicket(keycardAddress)).to.be.revertedWith("Ticket already exists");
  });

  it("Register attendance", async () => {
    let attendance = {
      conference: conference.address
    }
    
    await expect(conference.attend(attendance, keycardSign(attendance, keycardPrivate))).to.emit(conference, "Attended").withArgs(keycardAddress);

    let ticket = await conference.tickets(keycardAddress);
    expect(ticket.attended).to.equal(true);
  });

  it("Ticket not found", async () => {
    let attendance = {
      conference: conference.address
    }

    let wrongKeycardKey = "ac76d50cc6e6c020fad1f99dec1f7379564cd29a890cf0ce3fefacc2b4dc34c3";

    await expect(conference.attend(attendance, keycardSign(attendance, wrongKeycardKey))).to.be.revertedWith("Ticket not found");
  });

  it("Wrong conference", async () => {
    let attendance = {
      conference: keycardAddress
    }

    await expect(conference.attend(attendance, keycardSign(attendance, keycardPrivate))).to.be.revertedWith("Wrong conference");
  });

  it("Conference attended", async () => {
    let attendance = {
      conference: conference.address
    }

    await expect(conference.attend(attendance, keycardSign(attendance, keycardPrivate))).to.be.revertedWith("Attendance already registered");
  });
});