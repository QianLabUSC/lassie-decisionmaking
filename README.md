# RHEX Decision Making Scenario    

This repo is a fork of Shenyue Chen's original work, which I contributed to and am now forking as the new developer takes over. This web application simulates a geo-scientist's decision making process when conducting an experiment, recording their actions for research.

Website (main) is now hosting on AWS S3: www.dataforaging.com
Website (admin) is now hosting on AWS S3: /www.dataforaging.com/admin/index.html

## Technologies
This is a `React` application. There is some styling from `Material-UI`, as well as lots of custom CSS I have added. The React code uses `TypeScript`, although not all components are fully typed. The main page uses `deck.gl` to render the map and transects, and the various charts are rendered to canvas tags using `Chart.js`. For building, `Webpack` is used to bundle the assets. The backend of the application is simply pushing a JSON string to `DynamoDB` once the user has completed the entire scenario.

## Running & Building
After you have cloned the repo, make sure to install the dependencies with `yarn install`. Note that the `yarn.lock` file maintains a version set of all the node dependencies so we are all using the same modules.

To run the application, use `yarn start:main`. You can then view it in a browser at URL `localhost:8080`.

To build the application for production, use `yarn build:main`. The outputs will be stored in `./dist`.

There is also an admin website that displays the outputs of previously gathered data. To use this code instead, use `yarn start:admin` and `yarn build:admin`.

## Hosting
The application is hosted on Penn's servers. The URL for the production build is `https://www.seas.upenn.edu/~foraging/field/alt/` and the URL used for sharing development builds is `https://www.seas.upenn.edu/~foraging/field/dev/alt/`.

Steps to Deploy the Website
1. First build the main package using `yarn build:main`.
2. In order to ssh into the server from off Penn's network, you will likely need the university VPN, which can be downloaded from https://www.isc.upenn.edu/how-to/university-vpn-getting-started-guide.
3. Copy the files from your local computer to some folder in your Penn Eniac directory. For example, `scp -r ./dist/* skylerr@eniac.seas.upenn.edu:~/foraging` copies the files in `dist` into a folder `foraging` in my account.
4. Ssh into your Eniac server. For example, `ssh skylerr@eniac.seas.upenn.edu`.
5. Copy the files to the production server using the same method. The folder the files should be copied into is `foraging@eniac.seas.upenn.edu:/home1/f/foraging/html/field/dev/alt/`.
    
    5.1 If you do not have access to the `foraging` account, someone with access will need to add you. Once they ssh in, open `.k5login` and add the desired user's email to the list, using the format `username@UPENN.EDU`. Once you have been added, run `kinit` from your eniac terminal to register a Kerberos ticket to get access to the `foraging` account. You can use `klist` to check the current tickets to see if it was created properly. With those steps, you should be able to ssh into the account.
6. When uploading files for the first time, there might be permission issues. Make sure the files have the correct permissions using something like `chmod a+rx` on whatever you uploaded.
7. Done! Changes are usually visible immediately.

## Tools
The `tools` directory contains a few files that I have created to help speed up development.
- Transect Coordinates - `transectCoordsConverter.html` contains an HTML page with a script. I am usually given the transect coordinates as a text file, so you can copy that text file in, click a button, and it will output the JavaScript already formatted that can be copied into our code base. Saves on some copy-pasting-formatting time.
- Color Generator - `colors.html` contains an HTML page with a script that generates a series of colors and outputs the JavaScript code already formatted. This saves on copy-paste time if you want `x` number of hard-coded color values.
- Sample Data - `loader.R` contains an R script that I am using to read in the MATLAB file I am given and convert it to a JSON file. This has been more convenient to work with in the application, and converts it to a more sensible format than the automatic JSON generators could.
- Sample Locations - `transectDiagramPoints.html` contains an HTML file that takes the transect diagram the users click and generates the 22 points evenly spaced along the slope that the samples are mapped to. To find these points, you need to color the slope to be sampled from in red. The image `tools\diagram_scalebar.png` is the current working version with this coloring scheme. If the diagram changes, a copy of the new image will need to be created.
