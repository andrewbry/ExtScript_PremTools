// assign variables
var nameClipAry = [];
var reelClipAry = [];
var origNameClipAry = [];
var infoArray = [];
var kPProPrivateProjectMetadataURI = "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";
var tapename = "Column.Intrinsic.TapeName";
var array = [];
var AdobeXMPScript ;
var regex = /[\d|.|\-|e|E|\+]+/g;
var matchedclips = 0;


//get the csv file first
var csvFile = File.openDialog ("Target CSV File","*.csv"); // PROMPT FOR CSV FILE

// Following opens the text file and stores it in var CSVFILE. Then splits it by every new line, and COMA into a multi-tiered array, INFOARRAY.
if(csvFile){
    var csvFile = csvFile.fsName; // FORMAT CSV FILEPATH TO BE FRIENDLY
    var file = File(csvFile) //OPEN, READ, AND CLOSE THE CSV FILE
    file.open("r");
    var fullText = file.read(); // store whats in the csv into memory
    file.close();
    infoArray = fullText.split("\n"); // SPLIT THE CSV FILE AT EVERY NEW LINE
        for(var a=0;a<infoArray.length;a++){ // LOOP THROUGH EACH LINE, SPLIT THE LINE AT EVERY COMMA
//~             infoArray[a] = infoArray[a].split(";");  
            infoArray[a] = infoArray[a].split("\t");      
        }
}


if(infoArray[infoArray.length -1] == ""){ //SOMETIMES WHEN SPLITTING UP THE ARRAY, THE PROCESS CREATES AN EXTRA, EMPTY LINE. tHIS WILL JUST TEST AND REMOVE THAT IF IT HAPPENS
    infoArray.splice(infoArray.length-1, 1)    
}

//find which colums we need from the ale 7th (6th) now is the headers
for (var b = 0; b < infoArray.length; b++){
//~     alert(infoArray[6][b])
    if (infoArray[6][b]  === "ASC_SAT"){
        var satcol = b
        }
    if (infoArray[6][b]  === "ASC_SOP"){
        var cdlcol = b   
        }
    if  (infoArray[6][b]  === "Name"){
        var reelcol = b   
        }
    }
  

// get selected items
var viewIDs = app.getProjectViewIDs();
for(var a = 0; a< app.projects.numProjects; a++){
    var currentProject = app.getProjectFromViewID(viewIDs[a]);
    if(currentProject){
        if(currentProject.documentID === app.project.documentID){
            var selectedItems = app.getProjectViewSelection(viewIDs[a]);
            }
        }
    }

//Alternate loop through selected items not CSV
//~ if(selectedItems.length > (infoArray.length -1)){
if(selectedItems){
// LOOP THROUGH INFOARRAY ONLY IF THE SELECTED ITEMS AND CSV LENGTH IS THE SAME - removed this checks for selected items twice now
    if (selectedItems){
        if (AdobeXMPScript === undefined) {
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
            }
        for (var s = 0; s < selectedItems.length; s++) {  
            
            // look through the csv for the matching name and update the stuff otherwise continue onto the next selected item and loop again
            for (var c = 0; c < infoArray.length; c++){
                // info array 0 is Tape Name, 1 is CDL values, 2 is Sat [row][column]
                // check the original name to be the same in the table

                var projectMetadata = selectedItems[s].getProjectMetadata();
                var xmp = new XMPMeta(projectMetadata);
//~                 var found_tapename = xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, tapename);
                var thereelname = String(xmp.getProperty(kPProPrivateProjectMetadataURI, tapename));
                   
                if (infoArray[c][reelcol] === thereelname){
                    matchedclips++;
                    
                    var cdleffect = selectedItems[s].videoComponents();
                    //if there is no componenet you can add the effect ??? to master clip
                    //selectedItems[s].addVideoEffect(qe.project.getVideoEffectByName("Crop"))
                    var cdls = infoArray[c][cdlcol].split(" ");
                    var cdlnumbers = []
                        for(var m = 0; m < cdls.length; m++){
                            cdlnumbers[m] = parseFloat(cdls[m].match(regex));
                            }

                   var satvalue = parseFloat(infoArray[c][satcol].match(regex));
                                  
                    cdleffect[0].properties[0].setValue(cdlnumbers[0],true); //Red Slope
                    cdleffect[0].properties[1].setValue(cdlnumbers[3],true); //Red Offset
                    cdleffect[0].properties[2].setValue(cdlnumbers[6],true); //Red Power
                    cdleffect[0].properties[3].setValue(cdlnumbers[1],true); // Green Slope
                    cdleffect[0].properties[4].setValue(cdlnumbers[4],true); //Green Offset
                    cdleffect[0].properties[5].setValue(cdlnumbers[7],true); //Green Power
                    cdleffect[0].properties[6].setValue(cdlnumbers[2],true); //Blue Slope
                    cdleffect[0].properties[7].setValue(cdlnumbers[5],true); //Blue Offset
                    cdleffect[0].properties[8].setValue(cdlnumbers[8],true); //Blue Power
                    cdleffect[0].properties[9].setValue(satvalue,true); // saturation
                    }
                }
            app.setSDKEventMessage(matchedclips+ "matched clips out of " + selectedItems.length +" selected clips!", 'info');
            }
        app.setSDKEventMessage(matchedclips+ "matched clips out of " + selectedItems.length +" selected clips!", 'info');
        }
    
    } else {
        app.setSDKEventMessage("wrong number of items selected. Aborted!!", 'info');
        }
    
//~ /* ================================================= END ===============================================================*/
