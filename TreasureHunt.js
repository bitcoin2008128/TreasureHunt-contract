
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { utils}  =require("ethers");

describe('TreasureHunt', () => {
  let treasureHunt;
  let owner;
  let player;

  beforeEach(async () => {
    [owner, player] = await ethers.getSigners();
    const TreasureHunt = await ethers.getContractFactory('TreasureHunt');
    treasureHunt = await TreasureHunt.deploy();
  });

  it('should allow a player to join the game', async () => {
    await treasureHunt.connect(player).join({value: ethers.parseEther('1.0')});
    expect(await treasureHunt.playerPositions(player.address)).to.not.equal(0);
  });

  it('should not allow a player to move before joining the game', async () => {
    await expect(treasureHunt.move(0)).to.be.revertedWith('You haven\'t joined the game yet');
  });

  it("should not allow the player to move to a position that is already occupied", async () => {
    await treasureHunt.connect(player).join({ value: ethers.parseEther('1.0') });
    const currentPosition = await treasureHunt.playerPositions(player.address);
    await treasureHunt.connect(player).move(1);
    const newPosition = await treasureHunt.playerPositions(player.address);
    await expect(treasureHunt.connect(player).move(newPosition)).to.be.revertedWith("You can't move to the same position");
  });
  it('should allow players to move', async () => {
    await treasureHunt.connect(player).join({ value: ethers.parseEther('1') });
    const initialPosition = await treasureHunt.playerPositions(player.address);
    await treasureHunt.connect(player).move(1);
    const newPosition = await treasureHunt.playerPositions(player.address);
    expect(newPosition).to.be.gt(initialPosition);
  });

  it("should reset treasure position when new position is prime", async function () {
    await treasureHunt.connect(player).join({ value: ethers.parseEther('1') });
  
    const initialTreasurePosition = await treasureHunt.treasurePosition();
  
    await treasureHunt.connect(player).move(1); 
    const newPosition = await treasureHunt.playerPositions(player.address);
  
    if (isPrime(newPosition.toString())) {
      const newTreasurePosition = await treasureHunt.treasurePosition();

      expect(newTreasurePosition.toString()).to.not.equal(initialTreasurePosition.toString());
      expect(newTreasurePosition.toString()).to.not.equal(newPosition.toString());
    }
  });
  

 it("should allow a player to win and receive the reward", async function () {
  await treasureHunt.connect(player).join({ value: ethers.parseEther('1') });
  await treasureHunt.connect(player).move(1);
  const newPosition = await treasureHunt.playerPositions(player.address);
  const treasurePosition = await treasureHunt.treasurePosition();

  if (newPosition === treasurePosition) {
    const initialBalance = await ethers.provider.getBalance(player.address);

    await treasureHunt.connect(player).move(1); 

    const finalBalance = await ethers.provider.getBalance(player.address);
    expect(finalBalance).to.be.gt(initialBalance);
  }
});

  function isPrime(number){
    number=parseInt(number);
    if(number<=1) return false;
      for(let i=2;i*i<number;++i){
           if(number%i===0)
            return false;
       }
       return true;
  }
});
