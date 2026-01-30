// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BlindAuction {
    // --- VARIABLES ---
    address public beneficiary;
    uint public auctionEndTime;
    address public highestBidder;
    uint public highestBid;
    bool public ended;

    // --- EVENTS ---
    event BidPlaced(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    // --- CONSTRUCTOR ---
    constructor(
        uint _biddingTime,
        address _beneficiary
    ) {
        beneficiary = _beneficiary;
        auctionEndTime = block.timestamp + _biddingTime;
    }

    // --- FUNCTION: PLACE A BID ---
    function bid() public payable {
        if (block.timestamp > auctionEndTime) {
            revert("Auction already ended.");
        }

        if (msg.value <= highestBid) {
            revert("There is already a higher bid.");
        }

        if (highestBid != 0) {
            // Refund the previous bidder (New Standard 2026)
            (bool success, ) = payable(highestBidder).call{value: highestBid}("");
            require(success, "Refund failed.");
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        emit BidPlaced(msg.sender, msg.value);
    }

    // --- FUNCTION: END THE AUCTION ---
    function auctionEnd() public {
        if (block.timestamp < auctionEndTime) {
            revert("Auction not yet ended.");
        }
        if (ended) {
            revert("auctionEnd has already been called.");
        }

        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        // Transfer to beneficiary (New Standard 2026)
        (bool success, ) = payable(beneficiary).call{value: highestBid}("");
        require(success, "Transfer to beneficiary failed.");
    }
}
