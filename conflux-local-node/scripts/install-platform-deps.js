#!/usr/bin/env node

const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

function getPlatformPackage() {
  const platform = os.platform();
  const arch = os.arch();

  console.log(`Detected platform: ${platform}-${arch}`);

  switch (platform) {
    case "darwin":
      if (arch === "arm64") {
        return "@xcfx/node-darwin-arm64@0.6.0";
      } else if (arch === "x64") {
        return "@xcfx/node-darwin-x64@0.6.0";
      }
      break;
    case "linux":
      if (arch === "arm64") {
        return "@xcfx/node-linux-arm64-gnu@0.6.0";
      } else if (arch === "x64") {
        return "@xcfx/node-linux-x64-gnu@0.6.0";
      }
      break;
    case "win32":
      if (arch === "x64") {
        return "@xcfx/node-win32-x64-msvc@0.6.0";
      }
      break;
  }

  throw new Error(`Unsupported platform: ${platform}-${arch}`);
}

function installPlatformDependency() {
  try {
    const packageName = getPlatformPackage();
    console.log(`Installing platform-specific dependency: ${packageName}`);

    execSync(`npm install ${packageName}`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    console.log("✅ Platform-specific dependency installed successfully");

    // Verify the native binding exists
    const nodeModulesPath = path.join(process.cwd(), "node_modules");
    const xcfxNodePath = path.join(nodeModulesPath, "@xcfx/node");

    if (fs.existsSync(xcfxNodePath)) {
      const files = fs.readdirSync(xcfxNodePath);
      const nodeFile = files.find((file) => file.endsWith(".node"));

      if (nodeFile) {
        console.log(`✅ Native binding found: ${nodeFile}`);
      } else {
        console.log("⚠️  Native binding not found in @xcfx/node directory");
      }
    }
  } catch (error) {
    console.error(
      "❌ Failed to install platform-specific dependency:",
      error.message
    );
    process.exit(1);
  }
}

function checkSystemDependencies() {
  console.log("Checking system dependencies...");

  const platform = os.platform();

  if (platform === "linux") {
    try {
      execSync("ldd --version", { stdio: "pipe" });
      console.log("✅ ldd available");
    } catch (error) {
      console.log("⚠️  ldd not available - may need to install build tools");
    }

    try {
      execSync("openssl version", { stdio: "pipe" });
      console.log("✅ OpenSSL available");
    } catch (error) {
      console.log("⚠️  OpenSSL not available - may need to install libssl-dev");
    }
  }
}

if (require.main === module) {
  console.log("🔧 Installing platform-specific dependencies for @xcfx/node...");
  checkSystemDependencies();
  installPlatformDependency();
}
