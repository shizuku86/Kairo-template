# Kairo-template
This repository is a template based on the specifications of the Kairo addon linked below.  
https://github.com/shizuku86/Kairo

After cloning, run the following command to install node_modules:  
- npm install

After editing the lines ending with # in scripts/properties.ts appropriately and resolving errors,  
execute the following command in the terminal:  
- npm run build

When this command is executed, the following operations will be performed:  
- manifest.json is automatically generated in BP/ and RP/ from the information in properties  
- TypeScript files in scripts/ are built as JavaScript into BP/scripts  
- The pack_icon.png at the project root is copied into both BP/ and RP/  
- The completed BP/ and RP/ are copied into Minecraft’s development folder

## Requirements
- Node.js (for development and TypeScript build)

## Setup && Build
1. Install dependencies:
   ```bash
   npm install
   ```
2. Deploy
    ```bash
    npm run build
    ```
3. Auto-deploy on file change:
    ```bash
    npm run dev
    ```