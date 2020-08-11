// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

contract Conference {
  event Attended(address attendee);

  struct Attendance {
    address conference;
  }

  struct Ticket {
    bool exists;
    bool attended;
  }

  bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
  bytes32 constant ATTENDANCE_TYPEHASH = keccak256("Attendance(address conference)");
  bytes32 DOMAIN_SEPARATOR;

  mapping(address => Ticket) public tickets;

  constructor() public {
    uint256 chainID;

    assembly {
      chainID := chainid()
    }

    DOMAIN_SEPARATOR = keccak256(abi.encode(
      EIP712DOMAIN_TYPEHASH,
      keccak256("Conference"),
      keccak256("1"),
      chainID,
      address(this)
    ));
  }

  function createTicket(address _keycard) public {
    Ticket storage ticket = tickets[_keycard];
    require(!ticket.exists, "Ticket already exists");

    ticket.exists = true;
  }

  function hash(Attendance memory _attendance) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      ATTENDANCE_TYPEHASH,
      _attendance.conference
    ));
  }

  function recoverSigner(Attendance memory _attendance, bytes memory _sig) internal view returns (address) {
    require(_sig.length == 65, "bad signature length");

    bytes32 r;
    bytes32 s;
    uint8 v;

    assembly {
      r := mload(add(_sig, 32))
      s := mload(add(_sig, 64))
      v := byte(0, mload(add(_sig, 96)))
    }

    if (v < 27) {
      v += 27;
    }

    require(v == 27 || v == 28, "signature version doesn't match");

    bytes32 digest = keccak256(abi.encodePacked(
      "\x19\x01",
      DOMAIN_SEPARATOR,
      hash(_attendance)
    ));

    return ecrecover(digest, v, r, s);
  }

  function attend(Attendance memory _attendance, bytes memory _signature) public {
    address signer = recoverSigner(_attendance, _signature);
    Ticket storage ticket = tickets[signer];

    require(ticket.exists, "Ticket not found");
    require(_attendance.conference == address(this), "Wrong conference");
    require(!ticket.attended, "Attendance already registered");

    ticket.attended = true;
    emit Attended(signer);
  }
}