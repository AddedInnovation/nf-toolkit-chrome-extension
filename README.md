# nf-toolkit-chrome-extension
Chrome Extension to expose form control data quickly and easily

## Installation Instructions
+ [Clone](https://github.com/AddedInnovation/nf-toolkit-chrome-extension.git) or [Download ZIP](https://github.com/AddedInnovation/nf-toolkit-chrome-extension/archive/master.zip) of master
+ Navigate to file locations
+ Unzip files, if applicable
+ Install netFORUM SQL Metadata and Schema files for xWeb ExecuteMethod to your netFORUM database. Note: the extension only works with one environment at a time right now.
  - Navigate to {extracted content location}\nf-toolkit-chrome-extension-master\AI.NetfourmToolkitChromeExtension.SQL\ folder
  - Execute all Schema files (prefixed with SCHEMA) in order
  - Execute all Metadata files (prefixed with MD) in order
+ Prepare Chrome Extension for your environment
  - Configure a xWeb user with a password. Note: you can use your iWeb username by adding an xWeb password, if you wish.
  - Open ai-toolkit-chrome-extension.js from {extracted content location}\nf-toolkit-chrome-extension-master\AI.NetforumToolkitChromeExtension\ folder
  - Modify the xWebUserName, xWebPassword, and xWebUrl variables for your environment
  - Save ai-toolkit-chrome-extension.js with your changes
+ Install Chrome Extension
  - Open Google Chrome
  - Click on Options Elipsis on toolbar
  - Click More Tools, then Extensions
  - Ensure box next to "Developer Mode" is Checked. If it is checked, you will see a button labeled "Load unpacked extension"
  - Click "Load unpacked extension" button
  - Navigate to {extracted content location}\nf-toolkit-chrome-extension-master\AI.NetforumToolkitChromeExtension\ folder then click OK
  - If the installation was successful, you will notice an extension called "Added Innovation - Netforum Toolkit Chrome Extension"
+ See it in action!
  - Navigate to the environment you chose earlier in the Installation step
  - You will see 
+ For additional security
  - Out of the box, the Execute Method web services are set up to allow any xWeb user to access them. If you wish to enhance the security of these methods, please navigate to the methods (https://{youriWebUrl}/iWeb/forms/DynamicEdit.aspx?ItemKey=f52fa09e-114b-4239-a0f4-bd364310bac6&LinkKey=25e1cf22-7134-4e15-b663-3d9981d6f4fd&FormKey=49e359a7-804d-4120-ad26-8463e93232e6&tab=Toolkit&tabitem=XML%20Web%20Service&key=f57d8b1f-8dc3-407a-b413-3f4a0b6d44c1), uncheck "allow anonymous access", then add your xWeb User to the "Authorized Web Servers" list.
