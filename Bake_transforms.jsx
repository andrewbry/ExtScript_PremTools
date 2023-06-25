

$._PPP_={
    analyseOpticals : function () {
		var activeSeq = app.project.activeSequence;
        var validTracks = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
        var valid = false;
        var amountofbakes = 0
        var numofclips = 0

		if (activeSeq) {
            // check its the right one

            if(prompt('THIS PROCESS IN NOT UNDOABLE - SAVE/BACKUP FIRST\n' + '\nIs the correct sequence timeline?\n' + activeSeq.name + '\ny or n', 'n', 'Right Sequence?') !== 'y'){
                app.setSDKEventMessage("Didn't run, try getting the active sequence correct.", 'error');
                return
            }

			var updateUI = true;
            var group = activeSeq.videoTracks;
            var trackchoice = parseInt(prompt('Which video track to analyse? Number between 1-15', '1', 'Which Video Track?')) - 1;

            for (var t = 0; t < validTracks.length; t++){
                if (trackchoice === validTracks[t]){
                    valid = true;
                }
            }

            if(valid === false || trackchoice > group.numTracks){
                app.setSDKEventMessage("Bad Track Number.", 'error');
                return
            }

            var track = group[trackchoice];
            var clips = track.clips;
            // Lets run through all the clips on the track
            for (var clipIndex = 0; clipIndex < clips.numItems; clipIndex++) {

                //get the first clip
                var clip = clips[clipIndex];
                //get the componenets of the clip
                var effects = clip.components; 
                var sourcename = clip.name;

                //check if the clip is a premiere graphic before we continue
                if(sourcename === 'Graphic' && clip.projectItem === null){
                    continue
                }

                // lets get information about the clip
                var clipfps = clip.projectItem.getFootageInterpretation().frameRate;

                // translation 
                var position = effects[1].properties[0].getValue();
                if (position[0] !== 0.5 || position[1] !== 0.5 || effects[1].properties[0].getKeys()){

                    if (effects[1].properties[0].getKeys()){
                        numofclips++
                        var transkeys = effects[1].properties[0].getKeys();
                        var keytimes = []
                        var keyvalues = []
                        var keysection = []
                        var section = 0
                        var prevkeyvalue = [0.5, 0.5]
                        var keyvalue = [0.5, 0.5]
                        var index = 0
                        var currentkeytimes = []
                        

                        for (var i = 0; i < transkeys.length; i++) {
                            keyvalue = effects[1].properties[0].getValueAtKey(transkeys[i].seconds)
                            // test if the next keyframe is actually different to the previous
                            // if its not different store where we are up to in a section
                            // and reset the list index
                            // values come back as an array [0.5, 0.5]
                            if (keyvalue[0] == prevkeyvalue[0] && keyvalue[1] == prevkeyvalue[1] && i > 0){
                                keysection[section] = keytimes.slice(0,index)
                                keytimes = []
                                section++
                                index = 0
                            } else if (i == transkeys.length-1) {
                                // check if we are at the end to store the last section
                                keysection[section] = keytimes
                            }
                            // record the current times and continue
                            keytimes[index] = transkeys[i].seconds;
                        
                            // this is at the end so it remains the same at the start of the loop
                            prevkeyvalue = effects[1].properties[0].getValueAtKey(transkeys[i].seconds)
                            index++
                        }

                        // ok we have our key frame times built in sections section[0][time,time], section[1][time, time ,time]
                        
                        for (var si = 0; si< keysection.length; si++){
                            currentkeytimes = keysection[si]
                            // how many frames are we going over?                    
                            var bakekeys = ((currentkeytimes[currentkeytimes.length-1]) - currentkeytimes[0])* clipfps;
                            var iterate = 1 / clipfps;
                            var startTime = currentkeytimes[0];

                            // any way to not loop through twice?
                            // first get our values 
                            for (var vi = 0; vi < bakekeys; vi++) {
                                keyvalues[vi] = effects[1].properties[0].getValueAtTime(startTime + (iterate*vi));
                            }
                            // now we go back through and set the key and value
                            for (var vi = 0; vi < bakekeys; vi++) {
                                effects[1].properties[0].addKey(startTime + (iterate*vi));
                                effects[1].properties[0].setValueAtKey(startTime + (iterate*vi), keyvalues[vi] , 0)
                            }
                            amountofbakes++
                        }
                    }
                    //premiere uses a fraction of the screen to calculate translate 0.5 is the center if the anchor is also 0.5
                }              
            }	            
            app.setSDKEventMessage(amountofbakes + " Position sections baked on " + numofclips + " clips.", 'info');
		} else {
            app.setSDKEventMessage("No active sequence.", 'error');
		}
    }
}



$._PPP_.analyseOpticals();
