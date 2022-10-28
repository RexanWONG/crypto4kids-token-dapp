const { ethers } = require("hardhat");
const { expect } = require("chai");    

const tokens = (i) => {
    return ethers.utils.parseUnits(i.toString(), 'ether')
}

describe('Token', () => {
    let token, accounts, deployer, receiver, exchange

    beforeEach(async() => { 
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Crypto4Kids Token', 'C4K', '6900000000')   
        
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
        exchange = accounts[2]
        
    }) 
       
    describe('Deployment', () => {
        const name = 'Crypto4Kids Token'
        const symbol = 'C4K'
        const decimals = '18'
        const totalSupply = tokens('6900000000')

        it('has a correct name', async () => {
            expect(await token.name()).to.equal(name)
        })
    
        it('has a correct symbol', async () => {
            expect(await token.symbol()).to.equal(symbol)
        })
    
        it('has a correct decimals', async () => {
            expect(await token.decimals()).to.equal(decimals)
        })
    
        it('has a correct total supply', async () => {
            expect(await token.totalSupply()).to.equal(totalSupply)
        })

        it('assigns total supply to deployer', async () => {
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
        })
    })
  
    describe('Sending Tokens', () => {
        let amount, transaction, result

        describe('Success', () => {
            beforeEach(async () => {
                amount = tokens(100)
                transaction = await token.connect(deployer).transfer(receiver.address, amount)  
                result = await transaction.wait()
            })
    
            it('transfers token balances', async () => {
                // console.log('deployer balance before transfer', await token.balanceOf(deployer.address))
                // console.log('receiver balance before transfer', await token.balanceOf(receiver.address))

                expect(await token.balanceOf(deployer.address)).to.equal(tokens(6899999900))
                expect(await token.balanceOf(receiver.address)).to.equal(amount)
    
                // console.log('deployer balance before transfer', await token.balanceOf(deployer.address))
                // console.log('receiver balance before transfer', await token.balanceOf(receiver.address))
    
            })
    
            it('emits a Transfer event', async () => {
                const eventLog = result.events[0]
                expect(eventLog.event).to.equal('Transfer')
    
                const args = eventLog.args
                expect(args.from).to.equal(deployer.address)
                expect(args.to).to.equal(receiver.address)
                expect(args.value).to.equal(amount)
            })  
        })
        
        describe('Failure', () => {
            it('rejects insufficient balances for transactions', async () => {
                const invalidAmount = tokens('69000000000') //greater than the total supply
                await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted 
            })
            it('rejects invalid recipent', async () => {
                const invalidAmount = tokens(100) 
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted 
            })
        })

        describe('Approve Tokens', () => {
            let amount, transaction, result

            beforeEach(async () => {
                amount = tokens(100)
                transaction = await token.connect(deployer).approve(exchange.address, amount)  
                result = await transaction.wait()
            })
            describe('Success', () => {
                it('allocates an allowance for delegated token spending', async () => {
                    expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
                })
                
                it('emits a Approval event', async () => {
                    const eventLog = result.events[0]
                    expect(eventLog.event).to.equal('Approval')
        
                    const args = eventLog.args
                    expect(args.owner).to.equal(deployer.address)
                    expect(args.spender).to.equal(exchange.address)
                    expect(args.value).to.equal(amount)
                })  
            })

            describe('Failure', () => {
                it('rejects invalid spenders', async () => {
                    await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
                })

            })
        })

        describe('Delegated Token Transfers', () => {
            let amount, transaction, result

            beforeEach(async () => {
                amount = tokens(100)
                transaction = await token.connect(deployer).approve(exchange.address, amount)  
                result = await transaction.wait()
            })

            describe('Success', () => {
                beforeEach(async () => {
                    transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount)  
                    result = await transaction.wait()
                })

                it('transfers token balances', async () => {
                    expect(await token.balanceOf(deployer.address)).to.be.equal(ethers.utils.parseUnits('6899999900', 'ether'))
                    expect(await token.balanceOf(receiver.address)).to.be.equal(amount)
                })

                it('resets the allowance', async () => {
                    expect(await token.allowance(deployer.address, exchange.address)).to.be.equal('0')
                })

                it('emits a Transfer event', async () => {
                    const eventLog = result.events[0]
                    expect(eventLog.event).to.equal('Transfer')
        
                    const args = eventLog.args
                    expect(args.from).to.equal(deployer.address)
                    expect(args.to).to.equal(receiver.address)
                    expect(args.value).to.equal(amount)
                }) 
            })

            describe('Faliure', async () => {
                const invalidAmount = tokens('69000000000') //greater than total supply
                await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted
            })
        })
    })      
})
  


