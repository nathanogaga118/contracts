const { ethers, upgrades } = require("hardhat");
const PROXY = "0xF923f0828c56b27C8f57bc698c99543f63091E9A";

async function main() {
    const [owner] = await ethers.getSigners();
    // We get the contract to deploy
    console.log(`Deploying from ${owner.address}`);
    const Contract = await ethers.getContractFactory("JavStakeX");

    // const deployment = await upgrades.forceImport(PROXY, Contract);
    // console.log("Proxy imported from:", deployment.address);

    const impl = await upgrades.upgradeProxy(PROXY, Contract, {
        kind: "uups",
        redeployImplementation: "always",
        txOverrides: {
            gasLimit: ethers.parseUnits("0.03", "gwei"),
        },
    });
    await impl.waitForDeployment();

    console.log(`Upgrade Finished..`);
    console.log(`Starting Verification..`);

    let newImplementationAddress = await upgrades.erc1967.getImplementationAddress(PROXY);

    try {
        await run("verify:verify", { address: newImplementationAddress });
    } catch (error) {
        if (!error.message.includes("Reason: Already Verified")) {
            console.error(error);
            console.log(`\nVerification of  new implementation failed!`);
            console.log(`But contract was deployed at Address: ${newImplementationAddress}`);
            process.exit(1);
        }
    }

    console.log(`New implementation Address: ${newImplementationAddress}`);
    console.log(`JavStakeX contract upgraded`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
