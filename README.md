# Keycard Ticket

Keycard Ticket is a prototype dApp which can be used as a ticketing system for events. It works properly only with Status browser, because it uses Keycard Cash Applet which is at the moment supported only in that browser.

## Features

- [x] Uses Keycard Cash Applet to get attendee's address (Create Ticket page) and to mark attendance (Attend page)
- [x] Built using Buidler, Waffle & Ethers
- [x] Deploy contract (Create Conference page)
- [x] Mobile UX

## Demo

### Create conference 

You can deploy your conference contract at [Create Conference](https://choppu.github.io/keycard-ticket) page following the instructions on the screenshoots below. Once the contract is deployed (it takes a bit of time) you will see a success message and a conference address, which will be needed afterwards to create a ticket and mark attendance.
</br></br>
<img align="center" width="30%" hspace="1%" src="https://user-images.githubusercontent.com/66014759/91148107-7d13a880-e6b9-11ea-9eff-3f6312455128.png">
<img align="center" width="30%" hspace="1%" src="https://user-images.githubusercontent.com/66014759/91148143-8735a700-e6b9-11ea-9615-e539cbd7fd37.png">
<img align="center" width="30%" hspace="1%" src="https://user-images.githubusercontent.com/66014759/91156511-848c7f00-e6c4-11ea-8232-005fe5875095.png">
</br></br>

### Participate

To participate in the conference go to [Create Ticket](https://choppu.github.io/keycard-ticket/ticket.html#0x8BCA1bAa0016008A719b6373Fbf91f28ddE90069) page. The conference address can be stored as a part of Create Ticket page link ```https://choppu.github.io/keycard-ticket/ticket.html#conference-address``` or it can be written in the text field. 

To sign in to the conference you will need to get your Keycard Cash address. To do it click Get Keycard Address button and sign a meta transaction with your Keycard.

Once you have both conference address and Keycard address you can finally proceed to create your ticket. Click Participate button and sign the transaction. On success you will see a link to your transaction on Etherscan.
</br></br>
<img align="center" width="30%" hspace="1%" src="https://user-images.githubusercontent.com/66014759/91153861-0ed2e400-e6c1-11ea-90a7-790dafedf91d.png">
<img align="center" width="30%" hspace="1%" src="https://user-images.githubusercontent.com/66014759/91153890-1a260f80-e6c1-11ea-9513-2287aa6f30e5.png">
<img align="center" width="30%" hspace="1%" src="https://user-images.githubusercontent.com/66014759/91153904-1f835a00-e6c1-11ea-838e-37a66b8392d2.png">
</br></br>

### Attend

The [Check Ticket](https://choppu.github.io/keycard-ticket/attend.html#0x8BCA1bAa0016008A719b6373Fbf91f28ddE90069) page is aimed to check ticket existance and to mark the conference attendance. Again the conference address can be stored as a part of Create Ticket page link ```https://choppu.github.io/keycard-ticket/attend.html#conference-address``` or it can be written in the text field. 

You will need to tap your Keycard on one of the organizator's devices to gain the ticket info. To mark the attendance the organizator will need to sign the transaction and send it to Ethereum. 

Once the attendance is marked, next time that you tap your card an "Attendance is already registered" message will be shown.
</br></br>
<img align="center" width="30%" hspace="1%" src="https://user-images.githubusercontent.com/66014759/91155655-6d995d00-e6c3-11ea-9255-daa9e0ba809b.png">
<img align="center" width="30%" hspace="1%" src="https://user-images.githubusercontent.com/66014759/91155671-70944d80-e6c3-11ea-9eda-1a48f9dd36e6.png">
<img align="center" width="30%" hspace="1%" src="https://user-images.githubusercontent.com/66014759/91155677-738f3e00-e6c3-11ea-8f21-c2e41669e5a6.png">
</br></br>